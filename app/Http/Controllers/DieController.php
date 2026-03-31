<?php

namespace App\Http\Controllers;

use App\Models\DieModel;
use App\Models\DieProcess;
use App\Models\Customer;
use App\Models\MachineModel;
use App\Services\DieMonitoringService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DieController extends Controller
{
    protected DieMonitoringService $monitoringService;

    public function __construct(DieMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }

    /**
     * Display a listing of dies.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['customer_id', 'machine_model_id', 'status', 'line', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $perPage = in_array($perPage, [10, 15, 25, 50, 100, 200]) ? $perPage : 15;

        $paginator = $this->monitoringService->getDies($filters, $perPage);

        // Transform paginated items to include computed attributes
        $paginator->through(function ($die) {
            return [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'customer' => $die->customer?->code,
                'customer_name' => $die->customer?->name,
                'model' => $die->machineModel?->code,
                'tonnage' => $die->machineModel?->tonnageStandard?->tonnage,
                'qty_die' => $die->qty_die,
                'line' => $die->line,
                'process_type' => $die->process_type,
                'accumulation_stroke' => $die->accumulation_stroke,
                'standard_stroke' => $die->standard_stroke,
                'ppm_standard' => $die->ppm_standard,
                'remaining_strokes' => $die->remaining_strokes,
                'stroke_percentage' => $die->stroke_percentage,
                'lot_size' => $die->lot_size_value,
                'current_lot' => $die->current_lot,
                'total_lots' => $die->total_lots,
                'remaining_lots' => $die->remaining_lots,
                'lot_progress' => $die->lot_progress,
                'ppm_status' => $die->ppm_status,
                'ppm_status_label' => $die->ppm_status_label,
                'ppm_alert_status' => $die->ppm_alert_status,
                'ppm_alert_status_label' => $die->ppm_alert_status_label,
                'last_ppm_date' => $die->last_ppm_date?->format('d-M-Y'),
                'last_stroke' => $die->last_stroke,
                // PPM Conditions Info
                'ppm_trigger_condition' => $die->ppm_trigger_condition,
                'ppm_conditions_info' => $die->ppm_conditions_info,
                'next_ppm_stroke' => $die->next_ppm_stroke,
                'ppm_count' => $die->ppm_count ?? 0,
                'is_4lot_check' => $die->is_4lot_check,
            ];
        });

        // Get distinct lines for filter tabs
        $lines = DieModel::active()
            ->whereNotNull('line')
            ->where('line', '!=', '')
            ->distinct()
            ->pluck('line')
            ->sort()
            ->values();

        // Line summary stats
        $lineStats = DieModel::active()
            ->selectRaw('line, COUNT(*) as total')
            ->whereNotNull('line')
            ->where('line', '!=', '')
            ->groupBy('line')
            ->pluck('total', 'line');

        return Inertia::render('Dies/Index', [
            'dies' => $paginator,
            'filters' => $filters,
            'customers' => Customer::active()->get(['id', 'code', 'name']),
            'machineModels' => MachineModel::with([
                'tonnageStandard' => fn($q) => $q->select(['id', 'tonnage']),
            ])
                ->active()
                ->get(['id', 'code', 'name', 'tonnage_standard_id']),
            'lines' => $lines,
            'lineStats' => $lineStats,
        ]);
    }

    /**
     * Show the form for creating a new die.
     */
    public function create()
    {
        return Inertia::render('Dies/Create', [
            'customers' => Customer::active()->get(['id', 'code', 'name']),
            'machineModels' => MachineModel::with('tonnageStandard')
                ->active()
                ->get(),
        ]);
    }

    /**
     * Store a newly created die.
     */
    public function store(Request $request)
    {
        // dd($request->all());
        $validated = $request->validate([
            'part_number' => 'required|string|max:50',
            'part_name' => 'required|string|max:200',
            'machine_model_id' => 'required|exists:machine_models,id',
            'customer_id' => 'required|exists:customers,id',
            'qty_die' => 'required|integer|min:1',
            'line' => 'nullable|string|max:20',
            'process_type' => 'nullable|in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
            'control_stroke' => 'nullable|integer|min:0',
            'last_ppm_date' => 'nullable|date',
            'last_stroke' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        DieModel::create($validated);

        return redirect()->route('dies.index')
            ->with('success', 'Die created successfully.');
    }

    /**
     * Display the specified die.
     */
    public function show(DieModel $die)
    {
        $die->load([
            'machineModel.tonnageStandard',
            'customer',
            'productionLogs' => fn($q) => $q->orderByDesc('production_date')->limit(50),
            'ppmHistories' => fn($q) => $q->orderByDesc('ppm_date'),
            'dieProcesses',
        ]);

        // Build schedule info: prioritize dies table fields, fallback to ppm_schedules table
        // Only look up fallback schedule when PPM flow is in scheduling phase
        // (NOT during red_alerted or earlier — those are from previous cycles)
        $ppmScheduledDate = $die->ppm_scheduled_date?->format('d-M-Y');
        $ppmScheduledBy = $die->ppm_scheduled_by;

        // Only do fallback lookup when status indicates scheduling has actually happened
        // in the CURRENT cycle. Statuses like orange_alerted, lot_date_set, red_alerted
        // are BEFORE MTN creates a schedule, so old schedule data should NOT be shown.
        $schedulingActiveStatuses = [
            'ppm_scheduled', 'schedule_approved',
            'transferred_to_mtn', 'ppm_in_progress',
            'additional_repair', 'ppm_completed',
        ];

        if (in_array($die->ppm_alert_status, $schedulingActiveStatuses)) {
            // Get upcoming/latest PPM schedule from ppm_schedules table (scheduler calendar)
            $upcomingSchedule = $die->ppmSchedules()
                ->where(function ($q) {
                    $q->whereNotNull('plan_week')
                      ->orWhereNotNull('ppm_date');
                })
                ->orderByDesc('year')
                ->orderByDesc('month')
                ->orderByDesc('week')
                ->first();

            // If no date on die record, try to get from ppm_schedules (scheduler calendar)
            if (!$ppmScheduledDate && $upcomingSchedule) {
                if ($upcomingSchedule->ppm_date) {
                    $ppmScheduledDate = $upcomingSchedule->ppm_date->format('d-M-Y');
                } elseif ($upcomingSchedule->plan_week) {
                    $ppmScheduledDate = "Week {$upcomingSchedule->week_label}, " .
                        \Carbon\Carbon::create($upcomingSchedule->year, $upcomingSchedule->month, 1)->format('M Y') .
                        " (Plan: {$upcomingSchedule->plan_week})";
                }
                // Use updated_by (who last edited the calendar cell) as the scheduler
                $ppmScheduledBy = $ppmScheduledBy ?: ($upcomingSchedule->updated_by ?? $upcomingSchedule->pic);
            }

            // If ppm_scheduled_by still empty but calendar has updated_by, use that
            if (!$ppmScheduledBy && $upcomingSchedule) {
                $ppmScheduledBy = $upcomingSchedule->updated_by ?? $upcomingSchedule->pic;
            }
        }

        return Inertia::render('Dies/Show', [
            'die' => [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'customer' => $die->customer,
                'machineModel' => $die->machineModel,
                'tonnage' => $die->machineModel?->tonnageStandard?->tonnage,
                'qty_die' => $die->qty_die,
                'line' => $die->line,
                'process_type' => $die->process_type,
                'accumulation_stroke' => $die->accumulation_stroke,
                'last_stroke' => $die->last_stroke,
                'standard_stroke' => $die->standard_stroke,
                'remaining_strokes' => $die->remaining_strokes,
                'stroke_percentage' => $die->stroke_percentage,
                'lot_size' => $die->lot_size_value,
                'current_lot' => $die->current_lot,
                'total_lots' => $die->total_lots,
                'remaining_lots' => $die->remaining_lots,
                'lot_progress' => $die->lot_progress,
                'ppm_status' => $die->ppm_status,
                'ppm_status_label' => $die->ppm_status_label,
                'ppm_alert_status' => $die->ppm_alert_status,
                'ppm_alert_status_label' => $die->ppm_alert_status_label,
                'last_ppm_date' => $die->last_ppm_date?->format('d-M-Y'),
                'location' => $die->location,
                'notes' => $die->notes,
                'productionLogs' => $die->productionLogs,
                'ppmHistories' => $die->ppmHistories,
                // PPM Conditions Info
                'ppm_trigger_condition' => $die->ppm_trigger_condition,
                'ppm_conditions_info' => $die->ppm_conditions_info,
                'next_ppm_stroke' => $die->next_ppm_stroke,
                'ppm_count' => $die->ppm_count ?? 0,
                'stroke_at_last_ppm' => $die->stroke_at_last_ppm ?? 0,
                'total_ppm_checkpoints' => $die->total_ppm_checkpoints,
                // PPIC & PROD features
                'last_lot_date' => $die->last_lot_date?->format('d-M-Y'),
                'last_lot_date_set_by' => $die->last_lot_date_set_by,
                'transferred_at' => $die->transferred_at?->format('d-M-Y H:i'),
                'transferred_by' => $die->transferred_by,
                'transfer_from_location' => $die->transfer_from_location,
                'transfer_to_location' => $die->transfer_to_location,
                // PPM Schedule Info
                'ppm_scheduled_date' => $ppmScheduledDate,
                'ppm_scheduled_by' => $ppmScheduledBy,
                'schedule_approved_at' => $die->schedule_approved_at?->format('d-M-Y H:i'),
                'schedule_approved_by' => $die->schedule_approved_by,
                // PPM Processing Info
                'ppm_started_at' => $die->ppm_started_at?->format('d-M-Y H:i'),
                'ppm_finished_at' => $die->ppm_finished_at?->format('d-M-Y H:i'),
                'ppm_total_days' => $die->ppm_total_days,
                'is_4lot_check' => $die->is_4lot_check,
                // Multi-process PPM
                'die_processes' => $die->dieProcesses->map(fn($p) => [
                    'id' => $p->id,
                    'encrypted_id' => $p->encrypted_id,
                    'process_type' => $p->process_type,
                    'process_label' => $p->process_label,
                    'process_order' => $p->process_order,
                    'ppm_status' => $p->ppm_status,
                    'status_label' => $p->status_label,
                    'ppm_started_at' => $p->ppm_started_at?->format('d-M-Y H:i'),
                    'ppm_completed_at' => $p->ppm_completed_at?->format('d-M-Y H:i'),
                    'completed_by' => $p->completed_by,
                    'notes' => $p->notes,
                ]),
                'ppm_process_progress' => $die->ppm_process_progress,
                // Remarks
                'schedule_remark' => $die->schedule_remark,
                'schedule_change_reason' => $die->schedule_change_reason,
                'mtn_remark' => $die->mtn_remark,
                'ppic_remark' => $die->ppic_remark,
                'schedule_cancelled_at' => $die->schedule_cancelled_at?->format('d-M-Y H:i'),
                'schedule_cancelled_by' => $die->schedule_cancelled_by,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified die.
     */
    public function edit(DieModel $die)
    {
        // dd($die);
        return Inertia::render('Dies/Edit', [
            'die' => $die,
            'customers' => Customer::active()->get(['id', 'code', 'name']),
            'machineModels' => MachineModel::with([
                'tonnageStandard' => fn($q) => $q->select(['id', 'tonnage', 'standard_stroke']),
            ])
                ->active()
                ->get(['id', 'code', 'name', 'tonnage_standard_id']),
        ]);
    }

    /**
     * Update the specified die.
     */
    public function update(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'part_number' => 'required|string|max:50',
            'part_name' => 'required|string|max:200',
            'machine_model_id' => 'required|exists:machine_models,id',
            'customer_id' => 'required|exists:customers,id',
            'qty_die' => 'required|integer|min:1',
            'line' => 'nullable|string|max:20',
            'process_type' => 'nullable|in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
            'control_stroke' => 'nullable|integer|min:0',
            'last_ppm_date' => 'nullable|date',
            'last_stroke' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'is_4lot_check' => 'boolean',
        ]);

        $die->update($validated);

        return redirect()->route('dies.index')
            ->with('success', 'Die updated successfully.');
    }

    /**
     * Record PPM for the specified die.
     * Button disabled unless die has been transferred to MTN Dies location.
     */
    public function recordPpm(Request $request, DieModel $die)
    {
        // Validate that die has been transferred to MTN Dies
        if (!in_array($die->ppm_alert_status, ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'])) {
            return redirect()->back()
                ->with('error', 'Cannot record PPM. Die must be transferred to MTN Dies location first.');
        }

        $validated = $request->validate([
            'ppm_date' => 'required|date',
            'pic' => 'required|string|max:100',
            'maintenance_type' => 'required|in:routine,repair,overhaul,emergency',
            'process_type' => 'nullable|in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
            'checklist_results' => 'nullable|array',
            'checklist_results.*.item_no' => 'required|integer',
            'checklist_results.*.description' => 'required|string',
            'checklist_results.*.result' => 'required|in:normal,unusual',
            'checklist_results.*.remark' => 'nullable|string',
            'work_performed' => 'nullable|string',
            'parts_replaced' => 'nullable|string',
            'findings' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'checked_by' => 'nullable|string|max:100',
            'approved_by' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->recordPpm($die, $validated);

        return redirect()->back()
            ->with('success', 'PPM recorded successfully. Stroke counter has been reset.');
    }

    /**
     * Schedule PPM for the specified die (after Orange Alert)
     * Flow: Orange Alert → MTN Dies: Create Schedule of PPM
     * Now supports schedule_remark
     */
    public function schedulePpm(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'scheduled_date' => 'nullable|date',
            'plan_week' => 'nullable|string|max:20',
            'pic' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'schedule_remark' => 'nullable|string|max:1000',
        ]);

        $this->monitoringService->schedulePpmWithRemark($die, $validated);

        return redirect()->back()
            ->with('success', 'PPM has been scheduled successfully.');
    }

    /**
     * PPIC: Approve PPM Schedule
     * Flow: MTN Dies creates schedule → PPIC: Approve The PPM Schedule
     */
    public function approvePpmSchedule(Request $request, DieModel $die)
    {
        $this->monitoringService->approvePpmSchedule($die);

        return redirect()->back()
            ->with('success', 'PPM Schedule has been approved by PPIC.');
    }

    /**
     * Start PPM Processing for the specified die
     * Flow: MTN Dies starts PPM Processing
     * Now supports multi-process type selection
     */
    public function startPpmProcessing(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'process_types' => 'nullable|array',
            'process_types.*' => 'in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
        ]);

        $this->monitoringService->startPpmProcessing($die, $validated['process_types'] ?? []);

        return redirect()->back()
            ->with('success', 'PPM Processing has been started.' .
                (!empty($validated['process_types']) ? ' ' . count($validated['process_types']) . ' processes initialized.' : ''));
    }

    /**
     * PPIC: Set Last Date of LOT
     * Flow: Orange Alert -> PPIC sets the estimated last production date for current LOT
     */
    public function setLastLotDate(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'last_lot_date' => 'required|date',
            'set_by' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->setLastLotDate($die, $validated);

        return redirect()->back()
            ->with('success', 'Last LOT date has been set successfully.');
    }

    /**
     * PROD: Transfer Dies to MTN Dies Location
     * Flow: Red Alert → PROD: Transfer Dies to Location MTN Dies
     */
    public function transferDies(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'from_location' => 'nullable|string|max:100',
            'to_location' => 'nullable|string|max:100',
            'transferred_by' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->transferDiesToMtn($die, $validated);

        return redirect()->back()
            ->with('success', 'Dies has been transferred to MTN Dies location.');
    }

    /**
     * PROD: Transfer Dies Back to Production
     * Flow: PPM Completed → Status Red→Green → PROD: Dies Location Back to Production
     */
    public function transferBackToProduction(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'to_location' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->transferBackToProduction($die, $validated);

        return redirect()->back()
            ->with('success', 'Dies has been transferred back to Production. PPM cycle completed.');
    }

    /**
     * MTN Dies: Mark Additional Repair Needed during PPM
     * Flow: Processing PPM → "The Process is Normal?" → No → Additional Repair Dies
     */
    public function markAdditionalRepair(Request $request, DieModel $die)
    {
        $this->monitoringService->markAdditionalRepair($die);

        return redirect()->back()
            ->with('success', 'Die marked for additional repair. PPM continues after repair.');
    }

    /**
     * MTN Dies: Resume PPM after Additional Repair
     * Flow: Additional Repair Dies → back to Processing PPM
     */
    public function resumePpmAfterRepair(DieModel $die)
    {
        $this->monitoringService->resumePpmAfterRepair($die);

        return redirect()->back()
            ->with('success', 'PPM processing resumed after additional repair.');
    }

    /**
     * Cancel PPM Schedule with reason
     */
    public function cancelSchedule(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $this->monitoringService->cancelPpmSchedule($die, $validated);

        return redirect()->back()
            ->with('success', 'PPM Schedule cancelled.');
    }

    /**
     * Reschedule PPM with change reason
     */
    public function reschedule(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'scheduled_date' => 'required|date',
            'pic' => 'nullable|string|max:100',
            'reason' => 'nullable|string|max:1000',
            'schedule_remark' => 'nullable|string|max:1000',
        ]);

        $this->monitoringService->reschedulePpm($die, $validated);

        return redirect()->back()
            ->with('success', 'PPM rescheduled successfully.');
    }

    /**
     * Complete a specific process within multi-process PPM
     */
    public function completeProcess(Request $request, DieProcess $process)
    {
        $validated = $request->validate([
            'ppm_date' => 'required|date',
            'pic' => 'required|string|max:100',
            'maintenance_type' => 'required|in:routine,repair,overhaul,emergency',
            'checklist_results' => 'nullable|array',
            'checklist_results.*.item_no' => 'required|integer',
            'checklist_results.*.description' => 'required|string',
            'checklist_results.*.result' => 'required|in:normal,unusual',
            'checklist_results.*.remark' => 'nullable|string',
            'work_performed' => 'nullable|string',
            'parts_replaced' => 'nullable|string',
            'findings' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'checked_by' => 'nullable|string|max:100',
            'approved_by' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->completeProcess($process, $validated);

        return redirect()->back()
            ->with('success', "Process {$process->process_label} completed.");
    }

    /**
     * Start a specific process within multi-process PPM
     */
    public function startProcess(DieProcess $process)
    {
        $this->monitoringService->startProcess($process);

        return redirect()->back()
            ->with('success', "Process {$process->process_label} started.");
    }

    /**
     * Update MTN Dies remark
     */
    public function updateMtnRemark(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'mtn_remark' => 'required|string|max:2000',
        ]);

        $this->monitoringService->updateMtnRemark($die, $validated['mtn_remark']);

        return redirect()->back()
            ->with('success', 'MTN Dies remark updated.');
    }

    /**
     * Update PPIC remark
     */
    public function updatePpicRemark(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'ppic_remark' => 'required|string|max:2000',
        ]);

        $this->monitoringService->updatePpicRemark($die, $validated['ppic_remark']);

        return redirect()->back()
            ->with('success', 'PPIC remark updated.');
    }

    /**
     * Remove the specified die from storage.
     */
    public function destroy(DieModel $die)
    {
        // Check if die has production logs or PPM history
        if ($die->productionLogs()->exists() || $die->ppmHistories()->exists()) {
            // Soft delete - just mark as inactive
            $die->update(['status' => 'inactive']);
            return redirect()->route('dies.index')
                ->with('success', 'Die has been deactivated.');
        }

        $die->delete();
        return redirect()->route('dies.index')
            ->with('success', 'Die deleted successfully.');
    }

    /**
     * Show Test Alert page
     */
    public function showTestAlert()
    {
        return Inertia::render('TestAlert', [
            'dies' => DieModel::with('customer:id,code')
                ->active()
                ->get(['id', 'part_number', 'part_name', 'customer_id', 'accumulation_stroke']),
            'mailConfig' => [
                'driver' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'from' => config('mail.from.address'),
            ],
        ]);
    }

    /**
     * Send test alert email
     */
    public function sendTestAlert(Request $request)
    {
        $validated = $request->validate([
            'die_id' => 'required|exists:dies,id',
            'alert_type' => 'required|in:orange,red',
            'email' => 'required|email',
        ]);

        $die = DieModel::with(['customer', 'machineModel'])->findOrFail($validated['die_id']);

        try {
            $notification = new \App\Notifications\CriticalDieAlert($die, $validated['alert_type']);

            // Use on-demand notification
            \Illuminate\Support\Facades\Notification::route('mail', $validated['email'])
                ->notify($notification);

            return redirect()->back()
                ->with('success', "Test {$validated['alert_type']} alert sent to {$validated['email']}");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }

    // ======================================
    // BATCH PPM ACTIONS (Multi-Die)
    // ======================================

    /**
     * Batch: Start PPM Processing for multiple dies
     */
    public function batchStartPpm(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'transferred_to_mtn')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk Start PPM.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->startPpmProcessing($die);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die PPM process started successfully.");
    }

    /**
     * Batch: Transfer multiple dies to MTN Dies
     */
    public function batchTransferDies(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
            'transferred_by' => 'nullable|string|max:100',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'red_alerted')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk transfer ke MTN Dies.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->transferDiesToMtn($die, [
                'transferred_by' => $validated['transferred_by'] ?? auth()->user()?->name,
            ]);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die successfully transferred to MTN Dies.");
    }

    /**
     * Batch: Transfer multiple dies back to Production
     */
    public function batchTransferBack(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'ppm_completed')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'No dies are eligible for transfer back to Production.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->transferBackToProduction($die);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die successfully transferred back to Production. PPM cycle completed.");
    }

    /**
     * Batch: Mark additional repair for multiple dies
     */
    public function batchAdditionalRepair(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'ppm_in_progress')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk Additional Repair.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->markAdditionalRepair($die);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die ditandai membutuhkan additional repair.");
    }

    /**
     * Batch: Resume PPM after repair for multiple dies
     */
    public function batchResumePpm(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'additional_repair')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk Resume PPM.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->resumePpmAfterRepair($die);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die PPM process resumed successfully.");
    }

    /**
     * Batch: Record PPM for multiple dies at once
     * Each die gets its own process_type, checklist, and PPM history
     * Shared fields: ppm_date, pic, maintenance_type, checked_by, approved_by
     */
    public function batchRecordPpm(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
            'ppm_date' => 'required|date',
            'pic' => 'required|string|max:100',
            'maintenance_type' => 'required|in:routine,repair,overhaul,emergency',
            'checked_by' => 'nullable|string|max:100',
            'approved_by' => 'nullable|string|max:100',
            // Per-die data keyed by die ID
            'die_data' => 'required|array',
            'die_data.*.process_type' => 'nullable|in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
            'die_data.*.checklist_results' => 'nullable|array',
            'die_data.*.checklist_results.*.item_no' => 'required|integer',
            'die_data.*.checklist_results.*.description' => 'required|string',
            'die_data.*.checklist_results.*.result' => 'required|in:normal,unusual',
            'die_data.*.checklist_results.*.remark' => 'nullable|string',
            'die_data.*.work_performed' => 'nullable|string',
            'die_data.*.parts_replaced' => 'nullable|string',
            'die_data.*.findings' => 'nullable|string',
            'die_data.*.recommendations' => 'nullable|string',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->whereIn('ppm_alert_status', ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'])
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk Record PPM.');
        }

        $dieData = $validated['die_data'] ?? [];
        $count = 0;
        foreach ($dies as $die) {
            $perDie = $dieData[$die->id] ?? [];
            $ppmData = [
                'ppm_date' => $validated['ppm_date'],
                'pic' => $validated['pic'],
                'maintenance_type' => $validated['maintenance_type'],
                'process_type' => $perDie['process_type'] ?? $die->process_type,
                'checklist_results' => $perDie['checklist_results'] ?? null,
                'work_performed' => $perDie['work_performed'] ?? null,
                'parts_replaced' => $perDie['parts_replaced'] ?? null,
                'findings' => $perDie['findings'] ?? null,
                'recommendations' => $perDie['recommendations'] ?? null,
                'checked_by' => $validated['checked_by'],
                'approved_by' => $validated['approved_by'],
            ];
            $this->monitoringService->recordPpm($die, $ppmData);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die PPM recorded successfully.");
    }

    /**
     * Batch: Set Last LOT Date for multiple dies at once
     * Flow: PPIC sets the estimated last production date for multiple orange/red dies
     */
    public function batchSetLastLotDate(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
            'last_lot_date' => 'required|date',
            'set_by' => 'nullable|string|max:100',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->whereNotIn('ppm_alert_status', [
                'transferred_to_mtn',
                'ppm_in_progress',
                'additional_repair',
                'ppm_completed',
            ])
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk Set Last LOT Date.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->setLastLotDate($die, [
                'last_lot_date' => $validated['last_lot_date'],
                'set_by' => $validated['set_by'] ?? auth()->user()?->name,
            ]);
            $count++;
        }
        dd($count);

        return redirect()->back()
            ->with('success', "{$count} die Last LOT Date set successfully.");
    }
}
