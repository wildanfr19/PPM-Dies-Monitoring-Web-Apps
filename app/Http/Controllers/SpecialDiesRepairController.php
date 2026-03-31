<?php

namespace App\Http\Controllers;

use App\Models\SpecialDiesRepair;
use App\Models\DieModel;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SpecialDiesRepairController extends Controller
{
    public function index(Request $request)
    {
        $query = SpecialDiesRepair::with(['die.customer', 'die.machineModel.tonnageStandard', 'creator']);

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('repair_type')) {
            $query->where('repair_type', $request->repair_type);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('die', function ($q) use ($search) {
                $q->where('part_number', 'like', "%{$search}%")
                  ->orWhere('part_name', 'like', "%{$search}%");
            });
        }

        $repairs = $query->orderByDesc('created_at')->get()->map(function ($repair) {
            return [
                'id' => $repair->id,
                'encrypted_id' => $repair->encrypted_id,
                'die_id' => $repair->die_id,
                'part_number' => $repair->die?->part_number,
                'part_name' => $repair->die?->part_name,
                'customer' => $repair->die?->customer?->code,
                'tonnage' => $repair->die?->machineModel?->tonnageStandard?->tonnage,
                'repair_type' => $repair->repair_type,
                'repair_type_label' => $repair->repair_type_label,
                'priority' => $repair->priority,
                'priority_color' => $repair->priority_color,
                'status' => $repair->status,
                'status_label' => $repair->status_label,
                'status_color' => $repair->status_color,
                'reason' => $repair->reason,
                'description' => $repair->description,
                'requested_by' => $repair->requested_by,
                'approved_by' => $repair->approved_by,
                'pic' => $repair->pic,
                'requested_at' => $repair->requested_at?->format('d-M-Y H:i'),
                'approved_at' => $repair->approved_at?->format('d-M-Y H:i'),
                'started_at' => $repair->started_at?->format('d-M-Y H:i'),
                'completed_at' => $repair->completed_at?->format('d-M-Y H:i'),
                'is_ppm_interrupted' => $repair->is_ppm_interrupted,
                'is_urgent_delivery' => $repair->is_urgent_delivery,
                'delivery_deadline' => $repair->delivery_deadline?->format('d-M-Y'),
                'customer_po' => $repair->customer_po,
                'estimated_hours' => $repair->estimated_hours,
                'actual_hours' => $repair->actual_hours,
                'duration_hours' => $repair->duration_hours,
                'work_performed' => $repair->work_performed,
                'parts_replaced' => $repair->parts_replaced,
                'findings' => $repair->findings,
                'notes' => $repair->notes,
                'created_by' => $repair->creator?->name,
                'created_at' => $repair->created_at?->format('d-M-Y H:i'),
            ];
        });

        // Stats
        $stats = [
            'total' => SpecialDiesRepair::count(),
            'active' => SpecialDiesRepair::active()->count(),
            'completed' => SpecialDiesRepair::completed()->count(),
            'urgent_delivery' => SpecialDiesRepair::urgentDelivery()->active()->count(),
            'severe_damage' => SpecialDiesRepair::severeDamage()->active()->count(),
            'ppm_interrupted' => SpecialDiesRepair::ppmInterrupted()->active()->count(),
        ];

        return Inertia::render('SpecialRepair/Index', [
            'repairs' => $repairs,
            'stats' => $stats,
            'filters' => $request->only(['status', 'repair_type', 'search']),
        ]);
    }

    public function create()
    {
        $dies = DieModel::with(['customer:id,code', 'machineModel.tonnageStandard'])
            ->active()
            ->get(['id', 'part_number', 'part_name', 'customer_id', 'machine_model_id', 'accumulation_stroke', 'ppm_alert_status', 'location']);

        return Inertia::render('SpecialRepair/Create', [
            'dies' => $dies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'die_id' => 'required|exists:dies,id',
            'repair_type' => 'required|in:urgent_delivery,severe_damage,special_request',
            'priority' => 'required|in:high,critical,emergency',
            'reason' => 'required|string|max:1000',
            'description' => 'nullable|string|max:2000',
            'pic' => 'nullable|string|max:100',
            'is_urgent_delivery' => 'boolean',
            'delivery_deadline' => 'nullable|date',
            'customer_po' => 'nullable|string|max:100',
            'estimated_hours' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $die = DieModel::findOrFail($validated['die_id']);

        $isPpmInterrupted = in_array($die->ppm_alert_status, ['ppm_scheduled', 'ppm_in_progress']);

        $repair = SpecialDiesRepair::create([
            ...$validated,
            'status' => SpecialDiesRepair::STATUS_APPROVED,
            'requested_by' => auth()->user()->name,
            'approved_by' => auth()->user()->name,
            'requested_at' => now(),
            'approved_at' => now(),
            'is_ppm_interrupted' => $isPpmInterrupted,
            'previous_ppm_status' => $die->ppm_alert_status,
            'previous_location' => $die->location,
            'created_by' => auth()->id(),
        ]);

        // If PPM was in progress, pause it
        if ($isPpmInterrupted) {
            $die->update([
                'ppm_alert_status' => 'special_repair',
            ]);
        }

        return redirect()->route('special-repair.index')
            ->with('success', 'Special repair request created successfully.');
    }

    public function show(SpecialDiesRepair $specialRepair)
    {
        $specialRepair->load(['die.customer', 'die.machineModel.tonnageStandard', 'creator']);

        return Inertia::render('SpecialRepair/Show', [
            'repair' => [
                'id' => $specialRepair->id,
                'encrypted_id' => $specialRepair->encrypted_id,
                'die' => [
                    'id' => $specialRepair->die->id,
                    'encrypted_id' => $specialRepair->die->encrypted_id,
                    'part_number' => $specialRepair->die->part_number,
                    'part_name' => $specialRepair->die->part_name,
                    'customer' => $specialRepair->die->customer,
                    'tonnage' => $specialRepair->die->machineModel?->tonnageStandard?->tonnage,
                    'accumulation_stroke' => $specialRepair->die->accumulation_stroke,
                    'ppm_status' => $specialRepair->die->ppm_status,
                    'ppm_alert_status' => $specialRepair->die->ppm_alert_status,
                    'location' => $specialRepair->die->location,
                ],
                'repair_type' => $specialRepair->repair_type,
                'repair_type_label' => $specialRepair->repair_type_label,
                'priority' => $specialRepair->priority,
                'priority_color' => $specialRepair->priority_color,
                'status' => $specialRepair->status,
                'status_label' => $specialRepair->status_label,
                'status_color' => $specialRepair->status_color,
                'reason' => $specialRepair->reason,
                'description' => $specialRepair->description,
                'requested_by' => $specialRepair->requested_by,
                'approved_by' => $specialRepair->approved_by,
                'pic' => $specialRepair->pic,
                'requested_at' => $specialRepair->requested_at?->format('d-M-Y H:i'),
                'approved_at' => $specialRepair->approved_at?->format('d-M-Y H:i'),
                'started_at' => $specialRepair->started_at?->format('d-M-Y H:i'),
                'completed_at' => $specialRepair->completed_at?->format('d-M-Y H:i'),
                'is_ppm_interrupted' => $specialRepair->is_ppm_interrupted,
                'is_urgent_delivery' => $specialRepair->is_urgent_delivery,
                'delivery_deadline' => $specialRepair->delivery_deadline?->format('d-M-Y'),
                'customer_po' => $specialRepair->customer_po,
                'estimated_hours' => $specialRepair->estimated_hours,
                'actual_hours' => $specialRepair->actual_hours,
                'duration_hours' => $specialRepair->duration_hours,
                'work_performed' => $specialRepair->work_performed,
                'parts_replaced' => $specialRepair->parts_replaced,
                'findings' => $specialRepair->findings,
                'recommendations' => $specialRepair->recommendations,
                'previous_ppm_status' => $specialRepair->previous_ppm_status,
                'previous_location' => $specialRepair->previous_location,
                'notes' => $specialRepair->notes,
                'created_by' => $specialRepair->creator?->name,
                'created_at' => $specialRepair->created_at?->format('d-M-Y H:i'),
            ],
        ]);
    }

    /**
     * Start the repair process
     */
    public function startRepair(Request $request, SpecialDiesRepair $specialRepair)
    {
        if ($specialRepair->status !== SpecialDiesRepair::STATUS_APPROVED) {
            return redirect()->back()->with('error', 'Only approved repairs can be started.');
        }

        $validated = $request->validate([
            'pic' => 'nullable|string|max:100',
        ]);

        $specialRepair->update([
            'status' => SpecialDiesRepair::STATUS_IN_PROGRESS,
            'started_at' => now(),
            'pic' => $validated['pic'] ?? $specialRepair->pic,
        ]);

        return redirect()->back()->with('success', 'Repair process started.');
    }

    /**
     * Complete the repair
     */
    public function completeRepair(Request $request, SpecialDiesRepair $specialRepair)
    {
        if ($specialRepair->status !== SpecialDiesRepair::STATUS_IN_PROGRESS) {
            return redirect()->back()->with('error', 'Only in-progress repairs can be completed.');
        }

        $validated = $request->validate([
            'work_performed' => 'required|string',
            'parts_replaced' => 'nullable|string',
            'findings' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'actual_hours' => 'nullable|integer|min:0',
        ]);

        $specialRepair->update([
            ...$validated,
            'status' => SpecialDiesRepair::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        // Restore PPM status if it was interrupted
        if ($specialRepair->is_ppm_interrupted) {
            $die = $specialRepair->die;
            if ($die) {
                $previousStatus = $specialRepair->previous_ppm_status;
                $die->update([
                    'ppm_alert_status' => $previousStatus ?: 'ppm_in_progress',
                    'location' => $specialRepair->previous_location ?: $die->location,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Repair completed successfully.');
    }



    /**
     * Handle urgent delivery during PPM
     * This creates a special repair with type 'urgent_delivery' and pauses PPM
     */
    public function handleUrgentDelivery(Request $request)
    {
        $validated = $request->validate([
            'die_id' => 'required|exists:dies,id',
            'delivery_deadline' => 'required|date',
            'customer_po' => 'nullable|string|max:100',
            'reason' => 'required|string|max:1000',
            'estimated_hours' => 'nullable|integer|min:1',
        ]);

        $die = DieModel::findOrFail($validated['die_id']);

        // Create special repair record
        $repair = SpecialDiesRepair::create([
            'die_id' => $die->id,
            'repair_type' => SpecialDiesRepair::TYPE_URGENT_DELIVERY,
            'priority' => SpecialDiesRepair::PRIORITY_EMERGENCY,
            'status' => SpecialDiesRepair::STATUS_APPROVED, // Auto-approved for urgent
            'reason' => $validated['reason'],
            'requested_by' => auth()->user()->name,
            'approved_by' => 'Auto-approved (Urgent Delivery)',
            'requested_at' => now(),
            'approved_at' => now(),
            'is_ppm_interrupted' => in_array($die->ppm_alert_status, ['ppm_scheduled', 'ppm_in_progress']),
            'is_urgent_delivery' => true,
            'delivery_deadline' => $validated['delivery_deadline'],
            'customer_po' => $validated['customer_po'],
            'estimated_hours' => $validated['estimated_hours'],
            'previous_ppm_status' => $die->ppm_alert_status,
            'previous_location' => $die->location,
            'created_by' => auth()->id(),
        ]);

        // Pause PPM and transfer back to production temporarily
        if (in_array($die->ppm_alert_status, ['ppm_scheduled', 'ppm_in_progress'])) {
            $die->update([
                'ppm_alert_status' => 'special_repair',
                'location' => 'Production (Urgent Delivery)',
            ]);
        }

        return redirect()->route('special-repair.show', $repair)
            ->with('success', 'Urgent delivery handling initiated. PPM has been paused.');
    }

    /**
     * Handle severe damage during PPM
     */
    public function handleSevereDamage(Request $request)
    {
        $validated = $request->validate([
            'die_id' => 'required|exists:dies,id',
            'description' => 'required|string|max:2000',
            'reason' => 'required|string|max:1000',
            'estimated_hours' => 'nullable|integer|min:1',
        ]);

        $die = DieModel::findOrFail($validated['die_id']);

        $repair = SpecialDiesRepair::create([
            'die_id' => $die->id,
            'repair_type' => SpecialDiesRepair::TYPE_SEVERE_DAMAGE,
            'priority' => SpecialDiesRepair::PRIORITY_CRITICAL,
            'status' => SpecialDiesRepair::STATUS_APPROVED,
            'reason' => $validated['reason'],
            'description' => $validated['description'],
            'requested_by' => auth()->user()->name,
            'requested_at' => now(),
            'is_ppm_interrupted' => in_array($die->ppm_alert_status, ['ppm_scheduled', 'ppm_in_progress']),
            'previous_ppm_status' => $die->ppm_alert_status,
            'previous_location' => $die->location,
            'approved_by' => auth()->user()->name,
            'approved_at' => now(),
            'estimated_hours' => $validated['estimated_hours'],
            'created_by' => auth()->id(),
        ]);

        // Keep dies at maintenance for extended repair
        if (in_array($die->ppm_alert_status, ['ppm_scheduled', 'ppm_in_progress'])) {
            $die->update([
                'ppm_alert_status' => 'special_repair',
            ]);
        }

        return redirect()->route('special-repair.show', $repair)
            ->with('success', 'Severe damage report created.');
    }

    public function destroy(SpecialDiesRepair $specialRepair)
    {
        if (!in_array($specialRepair->status, [SpecialDiesRepair::STATUS_APPROVED, SpecialDiesRepair::STATUS_CANCELLED])) {
            return redirect()->back()->with('error', 'Only open or cancelled repairs can be deleted.');
        }

        $specialRepair->delete();

        return redirect()->route('special-repair.index')
            ->with('success', 'Special repair deleted.');
    }
}
