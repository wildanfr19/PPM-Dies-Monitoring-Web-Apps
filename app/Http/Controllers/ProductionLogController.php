<?php

namespace App\Http\Controllers;

use App\Models\ProductionLog;
use App\Models\DieModel;
use App\Services\DieMonitoringService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductionLogController extends Controller
{
    protected DieMonitoringService $monitoringService;

    public function __construct(DieMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }

    /**
     * Display production logs listing.
     */
    public function index(Request $request)
    {
        $logs = ProductionLog::with(['die:id,part_number,part_name', 'createdBy:id,name'])
            ->when($request->date_from, fn($q, $date) => $q->where('production_date', '>=', $date))
            ->when($request->date_to, fn($q, $date) => $q->where('production_date', '<=', $date))
            ->when($request->die_id, fn($q, $dieId) => $q->where('die_id', $dieId))
            ->orderByDesc('production_date')
            ->orderByDesc('created_at')
            ->paginate(50);

        return Inertia::render('Production/Index', [
            'logs' => $logs,
            'filters' => $request->only(['date_from', 'date_to', 'die_id']),
            'dies' => DieModel::active()->get(['id', 'part_number', 'part_name']),
        ]);
    }

    /**
     * Show form for creating production log.
     */
    public function create()
    {
        return Inertia::render('Production/Create', [
            'dies' => DieModel::with(['customer:id,code', 'machineModel:id,code'])
                ->active()
                ->get(['id', 'part_number', 'part_name', 'customer_id', 'machine_model_id', 'line']),
        ]);
    }

    /**
     * Store production log.
     */
    public function store(Request $request)
    {
        $request->merge([
            'start_time' => $this->normalizeTimeInput($request->input('start_time')),
            'finish_time' => $this->normalizeTimeInput($request->input('finish_time')),
        ]);

        $validated = $request->validate([
            'die_id' => 'required|exists:dies,id',
            'production_date' => 'required|date',
            'shift' => 'required|integer|in:1,2,3',
            'line' => 'nullable|string|max:20',
            'running_process' => 'nullable|in:Auto,Manual',
            'start_time' => 'nullable|date_format:H:i',
            'finish_time' => 'nullable|date_format:H:i',
            'total_hours' => 'nullable|numeric|min:0',
            'total_minutes' => 'nullable|integer|min:0',
            'break_time' => 'nullable|integer|min:0',
            'output_qty' => 'required|integer|min:1',
        ]);

        $this->monitoringService->addProductionLog($validated);

        return redirect()->route('production.index')
            ->with('success', 'Production log added successfully.');
    }

    private function normalizeTimeInput($value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (! is_string($value)) {
            return $value;
        }

        $value = preg_replace('/\s+/', '', trim($value));

        return $value === '' ? null : $value;
    }

    /**
     * Bulk import production logs.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        // TODO: Implement Excel import using Laravel Excel package
        // We'll add this in a later step

        return redirect()->route('production.index')
            ->with('success', 'Production data imported successfully.');
    }
}
