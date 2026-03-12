<?php

namespace App\Http\Controllers;

use App\Models\MachineModel;
use App\Models\TonnageStandard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MachineModelController extends Controller
{
    /**
     * Display a listing of machine models.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $machineModels = MachineModel::query()
            ->with('tonnageStandard')
            ->when($search, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            })
            ->withCount('dies')
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Master/MachineModels/Index', [
            'machineModels' => $machineModels,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new machine model.
     */
    public function create()
    {
        return Inertia::render('Master/MachineModels/Create', [
            'tonnageStandards' => TonnageStandard::orderBy('tonnage')->get(),
        ]);
    }

    /**
     * Store a newly created machine model in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:30|unique:machine_models,code',
            'name' => 'required|string|max:100',
            'tonnage_standard_id' => 'required|exists:tonnage_standards,id',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        MachineModel::create($validated);

        return redirect()->route('machine-models.index')
            ->with('success', 'Machine model created successfully.');
    }

    /**
     * Show the form for editing the specified machine model.
     */
    public function edit(MachineModel $machineModel)
    {
        return Inertia::render('Master/MachineModels/Edit', [
            'machineModel' => $machineModel->load('tonnageStandard'),
            'tonnageStandards' => TonnageStandard::orderBy('tonnage')->get(),
        ]);
    }

    /**
     * Update the specified machine model in storage.
     */
    public function update(Request $request, MachineModel $machineModel)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:30|unique:machine_models,code,' . $machineModel->id,
            'name' => 'required|string|max:100',
            'tonnage_standard_id' => 'required|exists:tonnage_standards,id',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $machineModel->update($validated);

        return redirect()->route('machine-models.index')
            ->with('success', 'Machine model updated successfully.');
    }

    /**
     * Remove the specified machine model from storage.
     */
    public function destroy(MachineModel $machineModel)
    {
        // Check if machine model has related dies
        if ($machineModel->dies()->count() > 0) {
            return back()->with('error', 'Cannot delete machine model with existing dies.');
        }

        $machineModel->delete();

        return redirect()->route('machine-models.index')
            ->with('success', 'Machine model deleted successfully.');
    }
}
