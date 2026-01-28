<?php

namespace App\Http\Controllers;

use App\Models\DieModel;
use App\Models\ProductionLog;
use App\Models\PpmHistory;
use App\Models\Customer;
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
            'productionTrend' => $this->getProductionTrendData(),
            'topDiesByStroke' => $this->getTopDiesByStrokeData(),
            'monthlyPpmCount' => $this->getMonthlyPpmCountData(),
            'customerDistribution' => $this->getCustomerDistributionData(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'diesByTonnage' => $diesByTonnage,
            'criticalDies' => $criticalDies,
            'upcomingPpm' => $upcomingPpm,
            'chartData' => $chartData,
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
     * Production trend for last 30 days
     */
    protected function getProductionTrendData(): array
    {
        $days = 30;
        $startDate = now()->subDays($days);

        $production = ProductionLog::select(
                DB::raw('DATE(production_date) as date'),
                DB:: raw('SUM(output_qty) as total_output')
            )
            ->where('production_date', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $labels = [];
        $values = [];

        // Fill all days
        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $labels[] = now()->subDays($i)->format('d M');

            $found = $production->firstWhere('date', $date);
            $values[] = $found ? (int) $found->total_output : 0;
        }

        return [
            'labels' => $labels,
            'values' => $values,
            'datasetLabel' => 'Daily Production Output',
        ];
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
}
