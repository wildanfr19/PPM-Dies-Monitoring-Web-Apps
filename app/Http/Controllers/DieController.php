<?php

namespace App\Http\Controllers;

use App\Models\DieModel;
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

        $dies = $this->monitoringService->getDies($filters);

        // Transform dies to include computed attributes
        $diesData = $dies->map(function ($die) {
            return [
                'id' => $die->id,
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'customer' => $die->customer?->code,
                'customer_name' => $die->customer?->name,
                'model' => $die->machineModel?->code,
                'tonnage' => $die->machineModel?->tonnageStandard?->tonnage,
                'qty_die' => $die->qty_die,
                'line' => $die->line,
                'accumulation_stroke' => $die->accumulation_stroke,
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
                // PPM Conditions Info
                'ppm_trigger_condition' => $die->ppm_trigger_condition,
                'ppm_conditions_info' => $die->ppm_conditions_info,
                'next_ppm_stroke' => $die->next_ppm_stroke,
                'ppm_count' => $die->ppm_count ?? 0,
            ];
        });

        return Inertia::render('Dies/Index', [
            'dies' => $diesData,
            'filters' => $filters,
            'customers' => Customer::active()->get(['id', 'code', 'name']),
            'machineModels' => MachineModel::with([
                'tonnageStandard' => fn($q) => $q->select(['id', 'tonnage']),
            ])
                ->active()
                ->get(['id', 'code', 'name', 'tonnage_standard_id']),
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
            'control_stroke' => 'nullable|integer|min:0',
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
        ]);

        return Inertia::render('Dies/Show', [
            'die' => [
                'id' => $die->id,
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'customer' => $die->customer,
                'machineModel' => $die->machineModel,
                'tonnage' => $die->machineModel?->tonnageStandard?->tonnage,
                'qty_die' => $die->qty_die,
                'line' => $die->line,
                'accumulation_stroke' => $die->accumulation_stroke,
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
            'control_stroke' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $die->update($validated);

        return redirect()->route('dies.index')
            ->with('success', 'Die updated successfully.');
    }

    /**
     * Record PPM for the specified die.
     */
    public function recordPpm(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'ppm_date' => 'required|date',
            'pic' => 'required|string|max:100',
            'maintenance_type' => 'required|in:routine,repair,overhaul,emergency',
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
     * Schedule PPM for the specified die (after Red Alert)
     * Flow: Red Alert -> MTN Dies schedules PPM
     */
    public function schedulePpm(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'scheduled_date' => 'nullable|date',
            'plan_week' => 'nullable|string|max:20',
            'pic' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $this->monitoringService->schedulePpm($die, $validated);

        return redirect()->back()
            ->with('success', 'PPM has been scheduled successfully.');
    }

    /**
     * Start PPM Processing for the specified die
     * Flow: MTN Dies starts PPM Processing
     */
    public function startPpmProcessing(DieModel $die)
    {
        $this->monitoringService->startPpmProcessing($die);

        return redirect()->back()
            ->with('success', 'PPM Processing has been started.');
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
}
