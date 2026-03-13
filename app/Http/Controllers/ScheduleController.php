<?php

namespace App\Http\Controllers;

use App\Models\DieModel;
use App\Models\Customer;
use App\Models\MachineModel;
use App\Models\PpmSchedule;
use App\Models\TonnageStandard;
use App\Services\DieMonitoringService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    protected DieMonitoringService $monitoringService;

    public function __construct(DieMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }

    /**
     * Show schedule calendar view
     */
    public function index(Request $request)
    {
        $year = $request->get('year', now()->year);
        $customerId = $request->get('customer_id');
        $tonnageId = $request->get('tonnage_id');

        // Get filters data
        $customers = Customer::active()->get(['id', 'code', 'name']);
        $tonnages = TonnageStandard::all(['id', 'tonnage', 'grade', 'standard_stroke']);

        // Build query
        $query = DieModel::with([
            'machineModel.tonnageStandard',
            'customer',
            'ppmSchedules' => fn($q) => $q->where('year', $year),
            'ppmHistories' => fn($q) => $q->whereYear('ppm_date', $year),
        ])->active();

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        if ($tonnageId) {
            $query->whereHas('machineModel', function ($q) use ($tonnageId) {
                $q->where('tonnage_standard_id', $tonnageId);
            });
        }

        $dies = $query->orderBy('part_number')->get();

        // Transform data for calendar view
        $scheduleData = $this->transformToScheduleData($dies, $year);

        return Inertia::render('Schedule/Index', [
            'year' => (int) $year,
            'scheduleData' => $scheduleData,
            'customers' => $customers,
            'tonnages' => $tonnages,
            'filters' => [
                'customer_id' => $customerId,
                'tonnage_id' => $tonnageId,
            ],
        ]);
    }

    /**
     * Transform dies data to schedule format
     */
    protected function transformToScheduleData($dies, $year): array
    {
        $grouped = [];

        foreach ($dies as $die) {
            $customerCode = $die->customer?->code ?? 'Unknown';
            $tonnage = $die->machineModel?->tonnageStandard?->tonnage ?? 'Unknown';
            $groupKey = "{$customerCode} ({$tonnage})";

            if (!isset($grouped[$groupKey])) {
                $grouped[$groupKey] = [
                    'customer' => $customerCode,
                    'tonnage' => $tonnage,
                    'dies' => [],
                ];
            }

            // Build monthly data
            $monthlyData = [];
            for ($month = 1; $month <= 12; $month++) {
                $monthlyData[$month] = [
                    'forecast' => [null, null, null, null],
                    'plan' => [null, null, null, null],
                    'actual' => [null, null, null, null],
                    'stroke' => [null, null, null, null],
                    'ppm_date' => [null, null, null, null],
                    'pic' => [null, null, null, null],
                ];
            }

            // Fill from ppmSchedules
            foreach ($die->ppmSchedules as $schedule) {
                $month = $schedule->month;
                $week = $schedule->week - 1; // 0-indexed

                if (isset($monthlyData[$month])) {
                    $monthlyData[$month]['forecast'][$week] = $schedule->forecast_stroke;
                    $monthlyData[$month]['plan'][$week] = $schedule->plan_week;
                    $monthlyData[$month]['actual'][$week] = $schedule->is_done;
                    $monthlyData[$month]['stroke'][$week] = $schedule->actual_stroke;
                    $monthlyData[$month]['ppm_date'][$week] = $schedule->ppm_date?->format('d/m');
                    $monthlyData[$month]['pic'][$week] = $schedule->pic;
                }
            }

            // Fill from ppmHistories
            foreach ($die->ppmHistories as $history) {
                $month = $history->ppm_date->month;
                $week = (int) ceil($history->ppm_date->day / 7) - 1;
                $week = min($week, 3); // Max week index is 3

                if (isset($monthlyData[$month])) {
                    $monthlyData[$month]['actual'][$week] = true;
                    $monthlyData[$month]['stroke'][$week] = $history->stroke_at_ppm;
                    $monthlyData[$month]['ppm_date'][$week] = $history->ppm_date->format('d/m');
                    $monthlyData[$month]['pic'][$week] = $history->pic;
                }
            }

            $grouped[$groupKey]['dies'][] = [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'model' => $die->machineModel?->code,
                'total_die' => $die->qty_die,
                'accumulation_stroke' => $die->accumulation_stroke,
                'last_stroke' => $die->last_stroke,
                'control_stroke' => $die->control_stroke ??  $die->standard_stroke,
                'standard_stroke' => $die->standard_stroke,
                'stroke_percentage' => $die->stroke_percentage,
                'ppm_status' => $die->ppm_status,
                'last_ppm_date' => $die->last_ppm_date?->format('d-M-Y'),
                'monthly_data' => $monthlyData,
                // PPM Conditions Info
                'ppm_trigger_condition' => $die->ppm_trigger_condition,
                'ppm_conditions_info' => $die->ppm_conditions_info,
                'next_ppm_stroke' => $die->next_ppm_stroke,
                'ppm_count' => $die->ppm_count ?? 0,
                'total_ppm_checkpoints' => $die->total_ppm_checkpoints,
                'lot_size' => $die->lot_size_value,
                // Scheduling info for MTN Dies
                'last_lot_date' => $die->last_lot_date?->format('d-M-Y'),
                'last_lot_date_set_by' => $die->last_lot_date_set_by,
                'ppm_alert_status' => $die->ppm_alert_status,
                'ppm_scheduled_date' => $die->ppm_scheduled_date?->format('d-M-Y'),
                'ppm_scheduled_by' => $die->ppm_scheduled_by,
                'schedule_approved_at' => $die->schedule_approved_at?->format('d-M-Y H:i'),
                'needs_scheduling' => $die->last_lot_date && !$die->ppm_scheduled_date && in_array($die->ppm_alert_status, ['lot_date_set', 'orange_alerted', null]),
            ];
        }

        return array_values($grouped);
    }

    /**
     * Update schedule cell
     */
    public function updateCell(Request $request)
    {
        $validated = $request->validate([
            'die_id' => 'required|exists:dies,id',
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
            'week' => 'required|integer|min:1|max:4',
            'field' => 'required|in:forecast,plan,actual,stroke,ppm_date,pic',
            'value' => 'nullable',
        ]);

        $updateFields = [
            $this->mapFieldToColumn($validated['field']) => $validated['value'],
            'updated_by' => auth()->user()?->name,
        ];

        // When setting ppm_date via calendar, auto-fill pic and update die record
        if ($validated['field'] === 'ppm_date' && $validated['value']) {
            $existing = PpmSchedule::where([
                'die_id' => $validated['die_id'],
                'year' => $validated['year'],
                'month' => $validated['month'],
                'week' => $validated['week'],
            ])->first();

            if (!$existing || !$existing->pic) {
                $updateFields['pic'] = auth()->user()?->name;
            }

            // Use monitoring service to update die record, set ppm_alert_status, and send notifications
            $die = DieModel::find($validated['die_id']);
            if ($die) {
                $this->monitoringService->schedulePpm($die, [
                    'scheduled_date' => $validated['value'],
                    'pic' => auth()->user()?->name,
                    'skip_schedule_record' => true, // Calendar manages its own PpmSchedule record below
                ]);
            }
        }

        $schedule = PpmSchedule::updateOrCreate(
            [
                'die_id' => $validated['die_id'],
                'year' => $validated['year'],
                'month' => $validated['month'],
                'week' => $validated['week'],
            ],
            $updateFields
        );

        return back()->with('success', 'Schedule updated successfully');
    }

    /**
     * Map field name to database column
     */
    protected function mapFieldToColumn(string $field): string
    {
        return match ($field) {
            'forecast' => 'forecast_stroke',
            'plan' => 'plan_week',
            'actual' => 'is_done',
            'stroke' => 'actual_stroke',
            'ppm_date' => 'ppm_date',
            'pic' => 'pic',
            default => $field,
        };
    }
}
