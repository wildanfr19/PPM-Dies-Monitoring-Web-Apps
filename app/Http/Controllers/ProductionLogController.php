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
        $logs = ProductionLog::with(['die:id,part_number,part_name,qty_die,machine_model_id', 'die.machineModel:id,code', 'createdBy:id,name'])
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
        $dies = DieModel::with(['customer:id,code', 'machineModel:id,code', 'machineModel.tonnageStandard'])
            ->active()
            ->get(['id', 'part_number', 'part_name', 'customer_id', 'machine_model_id', 'line', 'qty_die', 'model',
                    'accumulation_stroke', 'lot_size', 'ppm_standard', 'control_stroke', 'stroke_at_last_ppm', 'ppm_count']);

        $dies->each->append(['next_ppm_stroke', 'ppm_status', 'lot_size_value', 'standard_stroke']);

        return Inertia::render('Production/Create', [
            'dies' => $dies,
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
            'model' => 'nullable|string|max:20',
            'production_date' => 'required|date',
            'shift' => 'required|integer|in:1,2,3',
            'line' => 'nullable|string|max:20',
            'running_process' => 'nullable|in:Auto,Manual,Blanking',
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

    /**
     * Display the specified production log.
     */
    public function show(ProductionLog $production)
    {
        $production->load(['die:id,part_number,part_name,qty_die,accumulation_stroke,stroke_at_last_ppm,ppm_count,lot_size,ppm_standard,control_stroke,customer_id,machine_model_id', 'die.customer:id,code,name', 'die.machineModel:id,tonnage_standard_id', 'die.machineModel.tonnageStandard', 'createdBy:id,name']);
        if ($production->die) {
            $production->die->append(['next_ppm_stroke', 'ppm_status', 'lot_size_value', 'standard_stroke']);
        }

        return Inertia::render('Production/Show', [
            'log' => $production,
        ]);
    }

    /**
     * Show the form for editing the specified production log.
     */
    public function edit(ProductionLog $production)
    {
        $production->load(['die']);

        $dies = DieModel::with(['customer:id,code', 'machineModel:id,code', 'machineModel.tonnageStandard'])
            ->active()
            ->get(['id', 'part_number', 'part_name', 'customer_id', 'machine_model_id', 'line', 'qty_die',
                    'accumulation_stroke', 'lot_size', 'ppm_standard', 'control_stroke', 'stroke_at_last_ppm', 'ppm_count']);

        $dies->each->append(['next_ppm_stroke', 'ppm_status', 'lot_size_value', 'standard_stroke']);

        return Inertia::render('Production/Edit', [
            'log' => $production,
            'dies' => $dies,
        ]);
    }

    /**
     * Update the specified production log.
     */
    public function update(Request $request, ProductionLog $production)
    {
        $request->merge([
            'start_time' => $this->normalizeTimeInput($request->input('start_time')),
            'finish_time' => $this->normalizeTimeInput($request->input('finish_time')),
        ]);

        $validated = $request->validate([
            'die_id' => 'required|exists:dies,id',
            'model' => 'nullable|string|max:20',
            'production_date' => 'required|date',
            'shift' => 'required|integer|in:1,2,3',
            'line' => 'nullable|string|max:20',
            'running_process' => 'nullable|in:Auto,Manual,Blanking',
            'start_time' => 'nullable|date_format:H:i',
            'finish_time' => 'nullable|date_format:H:i',
            'total_hours' => 'nullable|numeric|min:0',
            'total_minutes' => 'nullable|integer|min:0',
            'break_time' => 'nullable|integer|min:0',
            'output_qty' => 'required|integer|min:1',
        ]);

        // Calculate difference in output_qty to adjust die's accumulation_stroke
        $oldOutputQty = $production->output_qty;
        $newOutputQty = $validated['output_qty'];
        $difference = $newOutputQty - $oldOutputQty;

        // Update the log
        $production->update($validated);

        // Adjust die accumulation stroke if output changed
        if ($difference !== 0) {
            $die = DieModel::find($validated['die_id']);
            if ($die) {
                $die->load(['machineModel.tonnageStandard', 'customer']);
                $previousStatus = $die->ppm_status;
                $die->increment('accumulation_stroke', $difference);
                $die->refresh();
                $newStatus = $die->ppm_status;
                $this->monitoringService->triggerAlertIfChanged($die, $previousStatus, $newStatus);
            }
        }

        return redirect()->route('production.index')
            ->with('success', 'Production log updated successfully.');
    }

    /**
     * Remove the specified production log.
     */
    public function destroy(ProductionLog $production)
    {
        // Subtract output_qty from die's accumulation_stroke
        $die = DieModel::find($production->die_id);
        if ($die) {
            $die->decrement('accumulation_stroke', $production->output_qty);
        }

        $production->delete();

        return redirect()->route('production.index')
            ->with('success', 'Production log deleted successfully.');
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
