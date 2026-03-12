<?php

namespace App\Http\Controllers;

use App\Models\DieModel;
use App\Models\ProductionLog;
use App\Models\PpmHistory;
use App\Models\Customer;
use App\Models\MachineModel;
use App\Services\DieMonitoringService;
use App\Exports\DiesReportExport;
use App\Exports\PpmHistoryReportExport;
use App\Exports\ProductionReportExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    protected DieMonitoringService $monitoringService;

    public function __construct(DieMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }

    /**
     * Show reports page
     */
    public function index()
    {
        return Inertia::render('Reports/Index', [
            'customers' => Customer::active()->get(['id', 'code', 'name']),
            'machineModels' => MachineModel::with([
                'tonnageStandard' => fn($q) => $q->select(['id', 'tonnage']),
            ])
                ->active()
                ->get(['id', 'code', 'name', 'tonnage_standard_id']),
            'stats' => $this->monitoringService->getDashboardStats(),
        ]);
    }

    /**
     * Generate Dies Status Report (Excel)
     */
    public function exportDiesExcel(Request $request)
    {
        $filters = $request->only(['customer_id', 'machine_model_id', 'status']);

        return Excel::download(
            new DiesReportExport($filters),
            'Dies_Status_Report_' . date('Y-m-d_His') . '.xlsx'
        );
    }

    /**
     * Generate Dies Status Report (PDF)
     */
    public function exportDiesPdf(Request $request)
    {
        $filters = $request->only(['customer_id', 'machine_model_id', 'status']);
        $dies = $this->monitoringService->getDies($filters);

        // Transform data
        $diesData = $dies->map(function ($die) {
            return [
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'customer' => $die->customer?->code,
                'model' => $die->machineModel?->code,
                'tonnage' => $die->machineModel?->tonnageStandard?->tonnage,
                'accumulation_stroke' => $die->accumulation_stroke,
                'standard_stroke' => $die->standard_stroke,
                'stroke_percentage' => $die->stroke_percentage,
                'remaining_strokes' => $die->remaining_strokes,
                'ppm_status' => $die->ppm_status,
                'ppm_status_label' => $die->ppm_status_label,
                'last_ppm_date' => $die->last_ppm_date?->format('d-M-Y'),
            ];
        });

        $stats = $this->monitoringService->getDashboardStats();

        $pdf = Pdf::loadView('reports.dies-status', [
            'dies' => $diesData,
            'stats' => $stats,
            'generatedAt' => now()->format('d-M-Y H:i: s'),
            'filters' => $filters,
        ]);

        $pdf->setPaper('a4', 'landscape');

        return $pdf->download('Dies_Status_Report_' . date('Y-m-d_His') . '.pdf');
    }

    /**
     * Generate PPM History Report (Excel)
     */
    public function exportPpmHistoryExcel(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $dateFrom = $request->date_from ? Carbon::parse($request->date_from) : now()->subMonths(3);
        $dateTo = $request->date_to ? Carbon:: parse($request->date_to) : now();

        return Excel::download(
            new PpmHistoryReportExport($dateFrom, $dateTo),
            'PPM_History_Report_' . date('Y-m-d_His') . '.xlsx'
        );
    }

    /**
     * Generate Production Report (Excel)
     */
    public function exportProductionExcel(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $dateFrom = $request->date_from ? Carbon::parse($request->date_from) : null;
        $dateTo = $request->date_to ? Carbon::parse($request->date_to) : null;

        return Excel::download(
            new ProductionReportExport($dateFrom, $dateTo, $request->die_id),
            'Production_Report_' . date('Y-m-d_His') . '.xlsx'
        );
    }

    /**
     * Generate Critical Dies Report (PDF)
     */
    public function exportCriticalPdf()
    {
        $criticalDies = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->get()
            ->filter(fn($die) => in_array($die->ppm_status, ['red', 'orange']))
            ->sortBy('remaining_strokes')
            ->map(function ($die) {
                return [
                    'part_number' => $die->part_number,
                    'part_name' => $die->part_name,
                    'customer' => $die->customer?->code,
                    'model' => $die->machineModel?->code,
                    'tonnage' => $die->machineModel?->tonnageStandard?->tonnage,
                    'accumulation_stroke' => $die->accumulation_stroke,
                    'standard_stroke' => $die->standard_stroke,
                    'stroke_percentage' => $die->stroke_percentage,
                    'remaining_strokes' => $die->remaining_strokes,
                    'ppm_status' => $die->ppm_status,
                    'ppm_status_label' => $die->ppm_status_label,
                    'last_ppm_date' => $die->last_ppm_date?->format('d-M-Y'),
                ];
            });

        $pdf = Pdf::loadView('reports.critical-dies', [
            'dies' => $criticalDies,
            'generatedAt' => now()->format('d-M-Y H:i:s'),
        ]);

        $pdf->setPaper('a4', 'landscape');

        return $pdf->download('Critical_Dies_Report_' .  date('Y-m-d_His') . '.pdf');
    }
}
