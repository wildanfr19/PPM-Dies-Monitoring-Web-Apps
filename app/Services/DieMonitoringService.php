<?php

namespace App\Services;

use App\Models\DieModel;
use App\Models\DieProcess;
use App\Models\ProductionLog;
use App\Models\PpmHistory;
use App\Models\User;
use App\Notifications\CriticalDieAlert;
use App\Notifications\PpmCompleted;
use App\Notifications\PpmWorkflowNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class DieMonitoringService
{
    /**
     * Send a PPM workflow notification to all relevant users.
     */
    protected function sendWorkflowNotification(DieModel $die, string $event, ?string $actor = null, array $extra = []): void
    {
        $die->loadMissing(['customer', 'machineModel']);

        $recipients = User::where('is_active', true)
            ->whereIn('role', [
                User::ROLE_ADMIN,
                User::ROLE_MTN_DIES,
                User::ROLE_MGR_GM,
                User::ROLE_MD,
                User::ROLE_PPIC,
                User::ROLE_PRODUCTION,
            ])
            ->get();

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new PpmWorkflowNotification($die, $event, $actor, $extra));
        }
    }
    /**
     * Get dashboard summary statistics
     */
    public function getDashboardStats(): array
    {
        $dies = DieModel::with(['machineModel.tonnageStandard'])->active()->get();

        $stats = [
            'total' => $dies->count(),
            'ok' => 0,
            'warning' => 0,
            'critical' => 0,
        ];

        foreach ($dies as $die) {
            match ($die->ppm_status) {
                'green' => $stats['ok']++,
                'orange' => $stats['warning']++,
                'red' => $stats['critical']++,
                default => null,
            };
        }

        return $stats;
    }

    /**
     * Get dies grouped by tonnage with statistics
     */
    public function getDiesByTonnage(): array
    {
        $result = [];

        $dies = DieModel::with(['machineModel.tonnageStandard'])
            ->active()
            ->get()
            ->groupBy(fn($die) => $die->machineModel?->tonnageStandard?->tonnage ?? 'Unknown');

        foreach ($dies as $tonnage => $diesGroup) {
            $total = $diesGroup->count();
            if ($total === 0) continue;

            $ok = $diesGroup->filter(fn($d) => $d->ppm_status === 'green')->count();

            $result[] = [
                'tonnage' => $tonnage,
                'total' => $total,
                'ok' => $ok,
                'warning' => $diesGroup->filter(fn($d) => $d->ppm_status === 'orange')->count(),
                'critical' => $diesGroup->filter(fn($d) => $d->ppm_status === 'red')->count(),
                'percentage' => $total > 0 ? round(($ok / $total) * 100, 1) : 0,
            ];
        }

        return $result;
    }

    /**
     * Get critical dies that need immediate attention
     */
    public function getCriticalDies(int $limit = 10)
    {
        return DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->get()
            ->filter(fn($die) => in_array($die->ppm_status, ['red', 'orange']))
            ->sortBy('remaining_strokes')
            ->take($limit)
            ->map(fn($die) => [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'accumulation_stroke' => $die->accumulation_stroke,
                'standard_stroke' => $die->standard_stroke,
                'stroke_percentage' => $die->stroke_percentage,
                'ppm_status' => $die->ppm_status,
                'ppm_status_label' => $die->ppm_status_label,
            ])
            ->values();
    }

    /**
     * Get all dies with filters
     */
    public function getDies(array $filters = [], int $perPage = 15)
    {
        $query = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active();

        // Filter by customer
        if (! empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        // Filter by machine model
        if (!empty($filters['machine_model_id'])) {
            $query->where('machine_model_id', $filters['machine_model_id']);
        }

        // Filter by line/tonnage
        if (!empty($filters['line'])) {
            $query->where('line', $filters['line']);
        }

        // Search by part number or name
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('part_number', 'like', "%{$search}%")
                  ->orWhere('part_name', 'like', "%{$search}%");
            });
        }

        $query->orderByDesc('created_at')->orderByDesc('id');

        // Filter by PPM in-progress status (database column, can filter directly)
        if (!empty($filters['status']) && $filters['status'] === 'ppm') {
            $query->whereIn('ppm_alert_status', [
                'transferred_to_mtn',
                'ppm_in_progress',
                'additional_repair',
                'ppm_completed',
            ]);

            return $query->paginate($perPage);
        }

        // Status (green/orange/red) is a computed attribute — must filter in PHP then manually paginate
        if (!empty($filters['status'])) {
            $dies = $query->get();
            $dies = $dies->filter(fn($die) => $die->ppm_status === $filters['status'])->values();

            $page = (int) request()->input('page', 1);
            $slice = $dies->slice(($page - 1) * $perPage, $perPage)->values();

            return new \Illuminate\Pagination\LengthAwarePaginator(
                $slice, $dies->count(), $perPage, $page,
                ['path' => request()->url(), 'query' => request()->query()]
            );
        }

        return $query->paginate($perPage);
    }

    /**
     * Update accumulation stroke from production logs
     */
    public function updateAccumulationStroke(DieModel $die): DieModel
    {
        $query = ProductionLog::where('die_id', $die->id);

        // Only count production logs AFTER the last PPM date (current cycle)
        if ($die->last_ppm_date) {
            $query->where('production_date', '>=', $die->last_ppm_date);
        }

        $totalStroke = $query->sum('output_qty');

        $die->accumulation_stroke = $totalStroke;
        $die->save();

        return $die->fresh();
    }

    /**
     * Record PPM completion and update tracking
     * - accumulation_stroke reset to 0 (new cycle starts fresh)
     * - stroke_at_last_ppm reset to 0
     * - ppm_count incremented
     * - last_ppm_date set to PPM date (used as filter for next cycle's accumulation)
     */
    public function recordPpm(DieModel $die, array $data): PpmHistory
    {
        return DB::transaction(function () use ($die, $data) {
            $currentAccumulation = $die->accumulation_stroke;
            $ppmCount = ($die->ppm_count ?? 0) + 1;

            $history = PpmHistory::create([
                'die_id' => $die->id,
                'ppm_date' => $data['ppm_date'],
                'stroke_at_ppm' => $currentAccumulation,
                'ppm_number' => $ppmCount, // Track which PPM this is (1st, 2nd, 3rd, etc)
                'process_type' => $data['process_type'] ?? $die->process_type,
                'checklist_results' => $data['checklist_results'] ?? null,
                'pic' => $data['pic'],
                'status' => 'done',
                'maintenance_type' => $data['maintenance_type'] ?? 'routine',
                'work_performed' => $data['work_performed'] ?? null,
                'parts_replaced' => $data['parts_replaced'] ?? null,
                'findings' => $data['findings'] ?? null,
                'recommendations' => $data['recommendations'] ?? null,
                'checked_by' => $data['checked_by'] ?? null,
                'approved_by' => $data['approved_by'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Update tracking
            // Flow: MTN DIES: PPM Completed → SYSTEM: Change Status Red to Green
            $updateData = [
                'ppm_count' => $ppmCount,
                'stroke_at_last_ppm' => 0,
                'last_ppm_date' => $data['ppm_date'],
                'ppm_alert_status' => 'ppm_completed',
                'ppm_finished_at' => now(),
                'ppm_total_days' => $die->red_alerted_at
                    ? (int) $die->red_alerted_at->diffInWeekdays(now())
                    : null,
                // Reset accumulation to 0 (new cycle starts fresh)
                'accumulation_stroke' => 0,
                'last_stroke' => 0,
            ];

            $die->update($updateData);

            // Send PPM Completed notification to MD/GM
            $this->sendPpmCompletedNotification($die, $history);

            // Auto transfer back to production immediately after PPM completed
            $this->transferBackToProduction($die);

            return $history;
        });
    }

    /**
     * Send notification when PPM is completed
     */
    protected function sendPpmCompletedNotification(DieModel $die, PpmHistory $history): void
    {
        // Load relations for notification
        $die->load(['customer', 'machineModel']);
        $history->load('die');

        // Send to all relevant roles per flowchart (status change Red → Green)
        $recipients = User::where('is_active', true)
            ->whereIn('role', [
                User::ROLE_ADMIN,
                User::ROLE_MTN_DIES,
                User::ROLE_MGR_GM,
                User::ROLE_MD,
                User::ROLE_PPIC,
                User::ROLE_PRODUCTION,
            ])
            ->get();

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new PpmCompleted($die, $history));
        }
    }

    /**
     * Mark die as PPM scheduled (by MTN Dies after receiving Orange Alert)
     * Flow: Orange Alert → MTN DIES: Create Schedule of PPM
     */
    public function schedulePpm(DieModel $die, array $data): void
    {
        $die->update([
            'ppm_alert_status' => 'ppm_scheduled',
            'ppm_scheduled_date' => $data['scheduled_date'] ?? null,
            'ppm_scheduled_by' => $data['pic'] ?? auth()->user()?->name,
        ]);

        // Create a PPM schedule record (skip if called from calendar which manages its own record)
        if (!empty($data['scheduled_date']) && empty($data['skip_schedule_record'])) {
            $die->ppmSchedules()->create([
                'year' => Carbon::parse($data['scheduled_date'])->year,
                'month' => Carbon::parse($data['scheduled_date'])->month,
                'week' => Carbon::parse($data['scheduled_date'])->weekOfMonth,
                'plan_week' => $data['plan_week'] ?? null,
                'pic' => $data['pic'] ?? null,
                'notes' => $data['notes'] ?? 'Scheduled after Orange Alert',
            ]);
        }

        // Send notification
        $this->sendWorkflowNotification($die, 'ppm_scheduled', $data['pic'] ?? null, [
            'scheduled_date' => $data['scheduled_date'] ?? null,
        ]);
    }

    /**
     * PPIC: Approve PPM Schedule
     * Flow: Orange Alert → MTN DIES creates schedule (via button or calendar) → PPIC approves it
     */
    public function approvePpmSchedule(DieModel $die, array $data = []): void
    {
        $updateData = [
            'ppm_alert_status' => 'schedule_approved',
            'schedule_approved_at' => now(),
            'schedule_approved_by' => auth()->user()?->name,
        ];

        // If ppm_scheduled_date not yet set on die (schedule was created via calendar only),
        // pull the date from ppm_schedules table and persist it on the die record
        if (!$die->ppm_scheduled_date) {
            $latestSchedule = $die->ppmSchedules()
                ->where(function ($q) {
                    $q->whereNotNull('plan_week')
                      ->orWhereNotNull('ppm_date');
                })
                ->orderByDesc('year')
                ->orderByDesc('month')
                ->orderByDesc('week')
                ->first();

            if ($latestSchedule?->ppm_date) {
                $updateData['ppm_scheduled_date'] = $latestSchedule->ppm_date;
                // Use updated_by or PIC from calendar schedule (MTN Dies user), not the approving PPIC user
                $scheduledBy = $latestSchedule->updated_by ?? $latestSchedule->pic;
                if ($scheduledBy) {
                    $updateData['ppm_scheduled_by'] = $scheduledBy;
                }
            }
        }

        $die->update($updateData);

        // Send notification
        $this->sendWorkflowNotification($die, 'schedule_approved');
    }

    /**
     * Mark die as PPM in progress
     * PPM activity starts (max n+1 from transfer, n+3 total from RED)
     * Now supports multi-process initialization
     */
    public function startPpmProcessing(DieModel $die, array $processTypes = []): void
    {
        $die->update([
            'ppm_alert_status' => 'ppm_in_progress',
            'ppm_started_at' => now(),
        ]);

        // Initialize die processes if process types provided
        if (!empty($processTypes)) {
            $this->initializeDieProcesses($die, $processTypes);
        }

        // Send notification
        $this->sendWorkflowNotification($die, 'ppm_in_progress');
    }

    /**
     * PPIC: Set Last Date of LOT
     * Flow: Orange Alert -> PPIC creates the last date of the current LOT
     * Note: Only advance ppm_alert_status to 'lot_date_set' if it hasn't
     *       already progressed past that point (e.g. ppm_scheduled or later).
     */
    public function setLastLotDate(DieModel $die, array $data): void
    {
        $advancedStatuses = [
            'ppm_scheduled',
            'schedule_approved',
            'ppm_in_progress',
            'additional_repair',
            'ppm_completed',
        ];

        $updateData = [
            'last_lot_date' => $data['last_lot_date'],
            'last_lot_date_set_by' => $data['set_by'] ?? auth()->user()?->name,
        ];

        // Only set status to lot_date_set if not already further in the flow
        if (!in_array($die->ppm_alert_status, $advancedStatuses)) {
            $updateData['ppm_alert_status'] = 'lot_date_set';
        }

        $die->update($updateData);

        // Send notification
        $this->sendWorkflowNotification($die, 'lot_date_set', $data['set_by'] ?? null, [
            'last_lot_date' => $data['last_lot_date'],
        ]);
    }

    /**
     * PROD: Transfer Dies to MTN Dies Location
     * Flow: Red Alert → PROD transfers dies to MTN Dies for PPM Processing
     * Timeline: max = n+1 (1 day after RED alert)
     */
    public function transferDiesToMtn(DieModel $die, array $data): void
    {
        $die->update([
            'transfer_from_location' => $die->location ?? $data['from_location'] ?? 'Production',
            'transfer_to_location' => $data['to_location'] ?? 'MTN Dies',
            'transferred_by' => $data['transferred_by'] ?? auth()->user()?->name,
            'transferred_at' => now(),
            'location' => $data['to_location'] ?? 'MTN Dies',
            'ppm_alert_status' => 'transferred_to_mtn',
        ]);

        // Send notification
        $this->sendWorkflowNotification($die, 'transferred_to_mtn', $data['transferred_by'] ?? null);
    }

    /**
     * PROD: Transfer dies back to production after PPM completion
     * Flow: PPM Completed → Status Red→Green → PROD: Dies Location Back to Production → Finish
     */
    public function transferBackToProduction(DieModel $die, array $data = []): void
    {
        $die->update([
            'location' => $data['to_location'] ?? $die->transfer_from_location ?? 'Production',
            'returned_to_production_at' => now(),
            'ppm_alert_status' => null, // Fully completed - clear all alert status
            'ppm_total_days' => $die->red_alerted_at
                ? (int) $die->red_alerted_at->diffInWeekdays(now())
                : null,
            // Reset ALL flow/timeline fields for next PPM cycle
            'red_alerted_at' => null,
            'ppm_started_at' => null,
            'ppm_finished_at' => null,
            'transferred_at' => null,
            'transferred_by' => null,
            'transfer_from_location' => null,
            'transfer_to_location' => null,
            // Reset schedule fields
            'ppm_scheduled_date' => null,
            'ppm_scheduled_by' => null,
            'schedule_approved_at' => null,
            'schedule_approved_by' => null,
            // Reset PPIC LOT date
            'last_lot_date' => null,
            'last_lot_date_set_by' => null,
        ]);

        // Send notification
        $this->sendWorkflowNotification($die, 'transferred_back');
    }

    /**
     * MTN Dies: Mark additional repair needed during PPM
     * Flow: Processing PPM → "The Process is Normal?" → No → Additional Repair Dies → back to Processing PPM
     */
    public function markAdditionalRepair(DieModel $die, array $data = []): void
    {
        $die->update([
            'ppm_alert_status' => 'additional_repair',
        ]);

        // Send notification
        $this->sendWorkflowNotification($die, 'additional_repair');
    }

    /**
     * MTN Dies: Resume PPM processing after additional repair
     * Flow: Additional Repair Dies → back to Processing PPM
     */
    public function resumePpmAfterRepair(DieModel $die): void
    {
        $die->update([
            'ppm_alert_status' => 'ppm_in_progress',
        ]);
    }

    /**
     * Add production log and update stroke
     */
    public function addProductionLog(array $data): ProductionLog
    {
        // dd($data);
        return DB::transaction(function () use ($data) {
            $log = ProductionLog::create([
                'die_id' => $data['die_id'],
                'production_date' => $data['production_date'],
                'shift' => $data['shift'],
                'line' => $data['line'] ?? null,
                'running_process' => $data['running_process'] ?? 'Auto',
                'start_time' => $data['start_time'] ?? null,
                'finish_time' => $data['finish_time'] ?? null,
                'total_hours' => $data['total_hours'] ?? null,
                'total_minutes' => $data['total_minutes'] ?? null,
                'break_time' => $data['break_time'] ?? null,
                'output_qty' => $data['output_qty'],
                'month' => Carbon::parse($data['production_date'])->format('M'),
                'created_by' => auth()->id(),
            ]);

            $die = DieModel::find($data['die_id']);
            $die->load(['machineModel.tonnageStandard', 'customer']);

            // Remember status before stroke increment
            $previousStatus = $die->ppm_status;

            $die->increment('accumulation_stroke', $data['output_qty']);
            $die->refresh();

            // Check if status changed to orange or red after this production input
            $newStatus = $die->ppm_status;
            $this->checkAndSendInstantAlert($die, $previousStatus, $newStatus);

            return $log;
        });
    }

    /**
     * Get upcoming PPM schedule
     */
    public function getUpcomingPpm(int $days = 30): array
    {
        $dies = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->get();

        $upcoming = [];

        foreach ($dies as $die) {
            if ($die->remaining_lots <= 2 && $die->remaining_lots > 0) {
                $avgDailyStroke = ProductionLog::where('die_id', $die->id)
                    ->where('production_date', '>=', now()->subDays(30))
                    ->avg('output_qty') ?? 0;

                $estimatedDays = $avgDailyStroke > 0
                    ? ceil($die->remaining_strokes / $avgDailyStroke)
                    : null;

                if ($estimatedDays === null || $estimatedDays <= $days) {
                    $upcoming[] = [
                        'die' => [
                            'id' => $die->id,
                            'encrypted_id' => $die->encrypted_id,
                            'part_number' => $die->part_number,
                            'part_name' => $die->part_name,
                            'accumulation_stroke' => $die->accumulation_stroke,
                            'standard_stroke' => $die->standard_stroke,
                            'stroke_percentage' => $die->stroke_percentage,
                            'lot_progress' => $die->lot_progress,
                        ],
                        'estimated_days' => $estimatedDays,
                        'remaining_strokes' => $die->remaining_strokes,
                        'remaining_lots' => $die->remaining_lots,
                    ];
                }
            }
        }

        usort($upcoming, fn($a, $b) => $a['remaining_strokes'] <=> $b['remaining_strokes']);

        return $upcoming;
    }

    /**
     * Check if die status changed after production input and send instant alert.
     * This ensures notifications are sent immediately when a die reaches orange/red,
     * without waiting for the scheduled ppm:check-alerts command.
     */
    protected function checkAndSendInstantAlert(DieModel $die, string $previousStatus, string $newStatus): void
    {
        $this->triggerAlertIfChanged($die, $previousStatus, $newStatus);
    }

    /**
     * Public method to trigger alert when die status changes.
     * Can be called from controllers, imports, etc.
     */
    public function triggerAlertIfChanged(DieModel $die, string $previousStatus, string $newStatus): void
    {
        // No status change, no alert needed
        if ($previousStatus === $newStatus) {
            return;
        }

        // Statuses that should not be overwritten by a new orange/red alert
        $advancedAlertStatuses = [
            'orange_alerted', 'lot_date_set', 'ppm_scheduled', 'schedule_approved',
            'red_alerted', 'transferred_to_mtn', 'ppm_in_progress',
            'additional_repair', 'ppm_completed',
        ];

        if ($newStatus === 'orange') {
            // Send Orange Alert to all relevant users
            $recipients = User::where('is_active', true)
                ->whereIn('role', [
                    User::ROLE_ADMIN, User::ROLE_MTN_DIES, User::ROLE_MGR_GM,
                    User::ROLE_MD, User::ROLE_PPIC, User::ROLE_PRODUCTION,
                ])
                ->get();

            if ($recipients->isNotEmpty()) {
                Notification::send($recipients, new CriticalDieAlert($die));
            }

            // Update ppm_alert_status only if not already further in the flow
            if (!in_array($die->ppm_alert_status, $advancedAlertStatuses)) {
                $die->update(['ppm_alert_status' => 'orange_alerted']);
            }

            // Set cache to prevent duplicate from scheduled command
            cache()->put("ppm_orange_alert_{$die->id}_" . now()->format('Y-m-d'), true, now()->endOfDay());

        } elseif ($newStatus === 'red') {
            // Send Red Alert to all relevant users
            $recipients = User::where('is_active', true)
                ->whereIn('role', [
                    User::ROLE_ADMIN, User::ROLE_MTN_DIES, User::ROLE_MGR_GM,
                    User::ROLE_MD, User::ROLE_PPIC, User::ROLE_PRODUCTION,
                ])
                ->get();

            if ($recipients->isNotEmpty()) {
                Notification::send($recipients, new CriticalDieAlert($die, 'red'));
            }

            // Update ppm_alert_status to red_alerted
            if (!in_array($die->ppm_alert_status, ['red_alerted', 'transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'])) {
                $die->update([
                    'ppm_alert_status' => 'red_alerted',
                    'red_alerted_at' => now(),
                ]);
            }

            // Set cache to prevent duplicate from scheduled command
            cache()->put("ppm_red_alert_{$die->id}_" . now()->format('Y-m-d'), true, now()->endOfDay());
        }
    }

    // ==================== MULTI-PROCESS PPM ====================

    /**
     * Initialize die processes based on qty_die.
     * Called when MTN Dies starts PPM - creates process records for tracking.
     *
     * @param DieModel $die
     * @param array $processTypes Array of process_type values selected via checkboxes
     */
    public function initializeDieProcesses(DieModel $die, array $processTypes): void
    {
        // Clear any existing pending processes from previous cycle
        $die->dieProcesses()->where('ppm_status', '!=', 'completed')->delete();

        foreach ($processTypes as $order => $processType) {
            DieProcess::updateOrCreate(
                [
                    'die_id' => $die->id,
                    'process_type' => $processType,
                    'process_order' => $order + 1,
                ],
                [
                    'ppm_status' => 'pending',
                    'ppm_started_at' => null,
                    'ppm_completed_at' => null,
                    'ppm_history_id' => null,
                    'completed_by' => null,
                ]
            );
        }
    }

    /**
     * Complete a single process within a multi-process PPM.
     * If all processes complete, triggers full PPM completion.
     */
    public function completeProcess(DieProcess $process, array $data): PpmHistory
    {
        return DB::transaction(function () use ($process, $data) {
            $die = $process->die;
            $die->load(['machineModel.tonnageStandard', 'customer']);

            // Record individual process PPM history
            $ppmCount = ($die->ppm_count ?? 0) + 1;
            $history = PpmHistory::create([
                'die_id' => $die->id,
                'ppm_date' => $data['ppm_date'],
                'stroke_at_ppm' => $die->accumulation_stroke,
                'ppm_number' => $ppmCount,
                'process_type' => $process->process_type,
                'checklist_results' => $data['checklist_results'] ?? null,
                'pic' => $data['pic'],
                'status' => 'done',
                'maintenance_type' => $data['maintenance_type'] ?? 'routine',
                'work_performed' => $data['work_performed'] ?? null,
                'parts_replaced' => $data['parts_replaced'] ?? null,
                'findings' => $data['findings'] ?? null,
                'recommendations' => $data['recommendations'] ?? null,
                'checked_by' => $data['checked_by'] ?? null,
                'approved_by' => $data['approved_by'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Mark process as completed
            $process->update([
                'ppm_status' => 'completed',
                'ppm_completed_at' => now(),
                'ppm_history_id' => $history->id,
                'completed_by' => $data['pic'],
            ]);

            // Check if ALL processes for this die are now completed
            $die->refresh();
            $progress = $die->ppm_process_progress;

            if ($progress['all_completed']) {
                // All processes done - complete the full PPM cycle
                $die->update([
                    'ppm_count' => $ppmCount,
                    'stroke_at_last_ppm' => 0,
                    'last_ppm_date' => $data['ppm_date'],
                    'ppm_alert_status' => 'ppm_completed',
                    'ppm_finished_at' => now(),
                    'ppm_total_days' => $die->red_alerted_at
                        ? (int) $die->red_alerted_at->diffInWeekdays(now())
                        : null,
                    'accumulation_stroke' => 0,
                    'last_stroke' => 0,
                ]);

                $this->sendPpmCompletedNotification($die, $history);
                $this->transferBackToProduction($die);
            } else {
                // Partial completion - send workflow notification
                $this->sendWorkflowNotification($die, 'process_completed', $data['pic'], [
                    'process_type' => $process->process_type,
                    'completed' => $progress['completed'],
                    'total' => $progress['total'],
                ]);
            }

            return $history;
        });
    }

    /**
     * Start a specific process within multi-process PPM
     */
    public function startProcess(DieProcess $process): void
    {
        $process->update([
            'ppm_status' => 'in_progress',
            'ppm_started_at' => now(),
        ]);

        $die = $process->die;
        $die->loadMissing(['customer', 'machineModel']);
        $this->sendWorkflowNotification($die, 'process_started', auth()->user()?->name, [
            'process_type' => $process->process_label,
        ]);
    }

    // ==================== SCHEDULE REMARKS ====================

    /**
     * Schedule PPM with remark/reason
     */
    public function schedulePpmWithRemark(DieModel $die, array $data): void
    {
        $die->update([
            'ppm_alert_status' => 'ppm_scheduled',
            'ppm_scheduled_date' => $data['scheduled_date'] ?? null,
            'ppm_scheduled_by' => $data['pic'] ?? auth()->user()?->name,
            'schedule_remark' => $data['schedule_remark'] ?? null,
            'schedule_change_reason' => null, // clear previous change reason
            'schedule_cancelled_at' => null,
            'schedule_cancelled_by' => null,
        ]);

        if (!empty($data['scheduled_date']) && empty($data['skip_schedule_record'])) {
            $die->ppmSchedules()->create([
                'year' => \Carbon\Carbon::parse($data['scheduled_date'])->year,
                'month' => \Carbon\Carbon::parse($data['scheduled_date'])->month,
                'week' => \Carbon\Carbon::parse($data['scheduled_date'])->weekOfMonth,
                'plan_week' => $data['plan_week'] ?? null,
                'pic' => $data['pic'] ?? null,
                'notes' => $data['schedule_remark'] ?? 'Scheduled after Orange Alert',
            ]);
        }

        $this->sendWorkflowNotification($die, 'ppm_scheduled', $data['pic'] ?? null, [
            'scheduled_date' => $data['scheduled_date'] ?? null,
            'remark' => $data['schedule_remark'] ?? null,
        ]);
    }

    /**
     * Cancel PPM schedule with reason
     */
    public function cancelPpmSchedule(DieModel $die, array $data): void
    {
        $die->update([
            'ppm_alert_status' => $die->ppm_status === 'red' ? 'red_alerted' : 'orange_alerted',
            'schedule_change_reason' => $data['reason'],
            'schedule_cancelled_at' => now(),
            'schedule_cancelled_by' => auth()->user()?->name,
            'ppm_scheduled_date' => null,
            'ppm_scheduled_by' => null,
            'schedule_approved_at' => null,
            'schedule_approved_by' => null,
        ]);

        $this->sendWorkflowNotification($die, 'schedule_cancelled', auth()->user()?->name, [
            'reason' => $data['reason'],
        ]);
    }

    /**
     * Reschedule PPM with change reason
     */
    public function reschedulePpm(DieModel $die, array $data): void
    {
        $die->update([
            'ppm_scheduled_date' => $data['scheduled_date'],
            'ppm_scheduled_by' => $data['pic'] ?? auth()->user()?->name,
            'schedule_change_reason' => $data['reason'] ?? null,
            'schedule_remark' => $data['schedule_remark'] ?? $die->schedule_remark,
            'schedule_approved_at' => null, // Needs re-approval
            'schedule_approved_by' => null,
            'ppm_alert_status' => 'ppm_scheduled', // Reset to scheduled
        ]);

        $this->sendWorkflowNotification($die, 'schedule_changed', $data['pic'] ?? null, [
            'new_date' => $data['scheduled_date'],
            'reason' => $data['reason'] ?? null,
        ]);
    }

    /**
     * Update MTN Dies remark on a die
     */
    public function updateMtnRemark(DieModel $die, string $remark): void
    {
        $die->update(['mtn_remark' => $remark]);
    }

    /**
     * Update PPIC remark on a die
     */
    public function updatePpicRemark(DieModel $die, string $remark): void
    {
        $die->update(['ppic_remark' => $remark]);
    }
}
