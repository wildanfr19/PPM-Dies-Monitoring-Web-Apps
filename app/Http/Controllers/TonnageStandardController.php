<?php

namespace App\Http\Controllers;

use App\Models\TonnageStandard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TonnageStandardController extends Controller
{
    /**
     * Display a listing of tonnage standards.
     */
    public function index()
    {
        $tonnageStandards = TonnageStandard::withCount('machineModels')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($ts) {
                return [
                    'id' => $ts->id,
                    'tonnage' => $ts->tonnage,
                    'grade' => $ts->grade,
                    'type' => $ts->type,
                    'standard_stroke' => $ts->standard_stroke,
                    'lot_size' => $ts->lot_size,
                    'total_lots' => $ts->total_lots,
                    'ppm_checkpoints' => ceil($ts->total_lots / 4),
                    'description' => $ts->description,
                    'machine_models_count' => $ts->machine_models_count,
                ];
            });

        return Inertia::render('TonnageStandard/Index', [
            'tonnageStandards' => $tonnageStandards,
        ]);
    }

    /**
     * Show the form for creating a new tonnage standard.
     */
    public function create()
    {
        return Inertia::render('TonnageStandard/Create');
    }

    /**
     * Store a newly created tonnage standard.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tonnage' => 'required|string|max:50',
            'grade' => 'nullable|string|max:20',
            'type' => 'nullable|string|max:50',
            'standard_stroke' => 'required|integer|min:1',
            'lot_size' => 'required|integer|min:1',
            'description' => 'nullable|string|max:255',
        ]);

        TonnageStandard::create($validated);

        return redirect()->route('tonnage-standards.index')
            ->with('success', 'Tonnage Standard created successfully.');
    }

    /**
     * Show the form for editing the specified tonnage standard.
     */
    public function edit(TonnageStandard $tonnageStandard)
    {
        return Inertia::render('TonnageStandard/Edit', [
            'tonnageStandard' => $tonnageStandard,
        ]);
    }

    /**
     * Update the specified tonnage standard.
     */
    public function update(Request $request, TonnageStandard $tonnageStandard)
    {
        $validated = $request->validate([
            'tonnage' => 'required|string|max:50',
            'grade' => 'nullable|string|max:20',
            'type' => 'nullable|string|max:50',
            'standard_stroke' => 'required|integer|min:1',
            'lot_size' => 'required|integer|min:1',
            'description' => 'nullable|string|max:255',
        ]);

        $tonnageStandard->update($validated);

        return redirect()->route('tonnage-standards.index')
            ->with('success', 'Tonnage Standard updated successfully.');
    }

    /**
     * Remove the specified tonnage standard.
     */
    public function destroy(TonnageStandard $tonnageStandard)
    {
        // Check if being used by machine models
        if ($tonnageStandard->machineModels()->exists()) {
            return back()->with('error', 'Cannot delete. This tonnage standard is being used by machine models.');
        }

        $tonnageStandard->delete();

        return redirect()->route('tonnage-standards.index')
            ->with('success', 'Tonnage Standard deleted successfully.');
    }
}
