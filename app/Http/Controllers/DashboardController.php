<?php

namespace App\Http\Controllers;

use App\Models\DieModel;
use App\Models\ProductionLog;
use App\Models\PpmHistory;
use App\Models\Customer;
use App\Models\SpecialDiesRepair;
use App\Services\DieMonitoringService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
     protected DieMonitoringService $monitoringService;

    public function __construct(DieMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }

    public function index()
    {
        $stats = $this->monitoringService->getDashboardStats();
        $diesByTonnage = $this->monitoringService->getDiesByTonnage();
        $criticalDies = $this->monitoringService->getCriticalDies(10);
        $upcomingPpm = $this->monitoringService->getUpcomingPpm(14);

        // Chart Data
        $chartData = [
            'statusDistribution' => $this->getStatusDistributionData($stats),
            'diesByTonnage' => $this->getDiesByTonnageChartData($diesByTonnage),
            'topDiesByGroup' => $this->getTopDiesByGroupData(),
            'topDiesByStroke' => $this->getTopDiesByStrokeData(),
            'monthlyPpmCount' => $this->getMonthlyPpmCountData(),
            'customerDistribution' => $this->getCustomerDistributionData(),
        ];

        // PPM Timeline Tracking Table (RED alert max 1 week = 5 days)
        $ppmTimeline = $this->getPpmTimelineData();

        // Active Special Repairs
        $activeSpecialRepairs = SpecialDiesRepair::with(['die.customer'])
            ->active()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'encrypted_id' => $r->encrypted_id,
                'part_number' => $r->die?->part_number,
                'repair_type_label' => $r->repair_type_label,
                'priority' => $r->priority,
                'priority_color' => $r->priority_color,
                'status_label' => $r->status_label,
                'status_color' => $r->status_color,
                'requested_at' => $r->requested_at?->format('d-M-Y'),
                'delivery_deadline' => $r->delivery_deadline?->format('d-M-Y'),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'diesByTonnage' => $diesByTonnage,
            'criticalDies' => $criticalDies,
            'upcomingPpm' => $upcomingPpm,
            'chartData' => $chartData,
            'ppmTimeline' => $ppmTimeline,
            'activeSpecialRepairs' => $activeSpecialRepairs,
        ]);
    }

    /**
     * Status distribution for doughnut chart
     */
    protected function getStatusDistributionData(array $stats): array
    {
        return [
            'labels' => ['OK', 'Warning', 'Critical'],
            'values' => [$stats['ok'], $stats['warning'], $stats['critical']],
        ];
    }

    /**
     * Dies by tonnage for bar chart
     */
    protected function getDiesByTonnageChartData(array $diesByTonnage): array
    {
        $labels = [];
        $ok = [];
        $warning = [];
        $critical = [];

        foreach ($diesByTonnage as $item) {
            $labels[] = $item['tonnage'];
            $ok[] = $item['ok'];
            $warning[] = $item['warning'];
            $critical[] = $item['critical'];
        }

        return [
            'labels' => $labels,
            'ok' => $ok,
            'warning' => $warning,
            'critical' => $critical,
        ];
    }

    /**
     * TOP 10 dies by stroke progress, grouped by A1, A2, B1, B2
     * Groups are based on lot position in the 4-lot PPM cycle:
     * A1 = Lot 1 (0-25%), A2 = Lot 2 (25-50%), B1 = Lot 3 (50-75% / Orange), B2 = Lot 4 (75-100% / Red)
     */
    protected function getTopDiesByGroupData(): array
    {
        $dies = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->get();

        $groups = [
            'A1' => ['label' => 'A1 (Lot 1 - Safe)', 'color' => '#22c55e', 'dies' => []],
            'A2' => ['label' => 'A2 (Lot 2 - Normal)', 'color' => '#3b82f6', 'dies' => []],
            'B1' => ['label' => 'B1 (Lot 3 - Warning)', 'color' => '#f97316', 'dies' => []],
            'B2' => ['label' => 'B2 (Lot 4 - Critical)', 'color' => '#ef4444', 'dies' => []],
        ];

        foreach ($dies as $die) {
            $currentLot = $die->current_lot;
            $lotInCycle = (($currentLot - 1) % 4) + 1; // Position within current 4-lot cycle

            $group = match (true) {
                $die->ppm_status === 'red' => 'B2',
                $die->ppm_status === 'orange' => 'B1',
                $lotInCycle <= 1 => 'A1',
                $lotInCycle <= 2 => 'A2',
                $lotInCycle <= 3 => 'B1',
                default => 'B2',
            };

            // Override with explicit die_group if set
            if ($die->die_group && isset($groups[$die->die_group])) {
                $group = $die->die_group;
            }

            $groups[$group]['dies'][] = [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'customer' => $die->customer?->code,
                'stroke_percentage' => $die->stroke_percentage,
                'accumulation_stroke' => $die->accumulation_stroke,
                'standard_stroke' => $die->standard_stroke,
                'current_lot' => $currentLot,
                'ppm_status' => $die->ppm_status,
            ];
        }

        // Sort each group by stroke percentage descending and take top 10
        foreach ($groups as $key => &$group) {
            usort($group['dies'], fn($a, $b) => $b['stroke_percentage'] <=> $a['stroke_percentage']);
            $group['dies'] = array_slice($group['dies'], 0, 10);
            $group['count'] = count($group['dies']);
        }

        return $groups;
    }

    /**
     * Top 10 dies by stroke percentage
     */
    protected function getTopDiesByStrokeData(): array
    {
        $dies = DieModel::with(['machineModel.tonnageStandard'])
            ->active()
            ->get()
            ->sortByDesc(fn($die) => $die->stroke_percentage)
            ->take(10)
            ->values();

        $labels = [];
        $values = [];
        $maxValues = [];

        foreach ($dies as $die) {
            $labels[] = $die->part_number;
            $values[] = $die->accumulation_stroke;
            $maxValues[] = $die->standard_stroke;
        }

        return [
            'labels' => $labels,
            'values' => $values,
            'maxValues' => $maxValues,
        ];
    }

    /**
     * Monthly PPM count for current year
     */
    protected function getMonthlyPpmCountData(): array
    {
        $year = now()->year;

        $ppmCounts = PpmHistory::select(
                DB::raw('MONTH(ppm_date) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->whereYear('ppm_date', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $values = [];

        for ($month = 1; $month <= 12; $month++) {
            $values[] = $ppmCounts->get($month)?->count ?? 0;
        }

        return [
            'labels' => $labels,
            'values' => $values,
            'datasetLabel' => 'PPM Completed',
        ];
    }

    /**
     * Customer distribution
     */
    protected function getCustomerDistributionData(): array
    {
        $customers = Customer::withCount(['dies' => fn($q) => $q->active()])
            ->having('dies_count', '>', 0)
            ->orderByDesc('dies_count')
            ->get();

        return [
            'labels' => $customers->pluck('code')->toArray(),
            'values' => $customers->pluck('dies_count')->toArray(),
        ];
    }

    /**
     * PPM Timeline Data - Track RED alert to completion (max 5 days)
     *
     * Timeline:
     * n   = RED alert triggered
     * n+1 = PROD transfers dies to MTN (max 1 day)
     * n+3 = PPM activity completed (max 3 days from transfer)
     * n+4 = PPM finish & transfer back to production (max 4 days from RED)
     * Total max = 5 working days (1 week)
     */
    protected function getPpmTimelineData(): array
    {
        $dies = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->whereNotNull('ppm_alert_status')
            ->whereIn('ppm_alert_status', [
                'red_alerted', 'transferred_to_mtn', 'ppm_scheduled',
                'schedule_approved', 'ppm_in_progress', 'additional_repair',
                'ppm_completed', 'special_repair',
            ])
            ->get();

        $timeline = [];

        foreach ($dies as $die) {
            $redAlertedAt = $die->red_alerted_at;
            $now = now();

            // Calculate days since RED alert
            $daysSinceRed = $redAlertedAt ? (int) $redAlertedAt->diffInWeekdays($now) : null;

            // Check SLA compliance
            $transferSla = null; // max n+1
            $ppmActivitySla = null; // max n+3
            $ppmFinishSla = null; // max n+4
            $totalSla = null; // max 5 days

            if ($redAlertedAt) {
                $transferDays = $die->transferred_at
                    ? (int) $redAlertedAt->diffInWeekdays($die->transferred_at)
                    : null;
                $transferSla = $transferDays !== null ? ($transferDays <= 1 ? 'on_track' : 'overdue') : 'pending';

                $ppmDays = $die->ppm_started_at
                    ? (int) $redAlertedAt->diffInWeekdays($die->ppm_started_at)
                    : null;

                $finishDays = $die->ppm_finished_at
                    ? (int) $redAlertedAt->diffInWeekdays($die->ppm_finished_at)
                    : null;
                $ppmFinishSla = $finishDays !== null ? ($finishDays <= 4 ? 'on_track' : 'overdue') : 'pending';

                $totalSla = $daysSinceRed !== null ? ($daysSinceRed <= 5 ? 'on_track' : 'overdue') : 'pending';
            }

            $timeline[] = [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'customer' => $die->customer?->code,
                'ppm_alert_status' => $die->ppm_alert_status,
                'ppm_alert_status_label' => $die->ppm_alert_status_label,
                'red_alerted_at' => $redAlertedAt?->format('d-M-Y H:i'),
                'transferred_at' => $die->transferred_at?->format('d-M-Y H:i'),
                'ppm_started_at' => $die->ppm_started_at?->format('d-M-Y H:i'),
                'ppm_finished_at' => $die->ppm_finished_at?->format('d-M-Y H:i'),
                'returned_to_production_at' => $die->returned_to_production_at?->format('d-M-Y H:i'),
                'days_since_red' => $daysSinceRed,
                'ppm_total_days' => $die->ppm_total_days,
                'transfer_sla' => $transferSla,
                'ppm_finish_sla' => $ppmFinishSla,
                'total_sla' => $totalSla,
                'is_overdue' => $daysSinceRed !== null && $daysSinceRed > 5,
            ];
        }

        return $timeline;
    }
}
