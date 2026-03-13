<?php

namespace App\Http\Controllers;

use App\Models\DieModel;
use App\Services\DieMonitoringService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransferDiesController extends Controller
{
    protected DieMonitoringService $monitoringService;

    public function __construct(DieMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }

    /**
     * Transfer Dies management page.
     * Shows dies pending transfer (to MTN or back to Production).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $tab = $request->input('tab', 'to_mtn');

        // Dies ready to transfer TO MTN (red_alerted status - Production role)
        $toMtn = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->where('ppm_alert_status', 'red_alerted')
            ->get()
            ->map(fn($die) => $this->formatDie($die));

        // Dies ready to transfer BACK to Production (ppm_completed status - MTN Dies role)
        $toProduction = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->where('ppm_alert_status', 'ppm_completed')
            ->get()
            ->map(fn($die) => $this->formatDie($die));

        // Dies currently at MTN Dies (transferred_to_mtn, ppm_in_progress, additional_repair)
        $atMtn = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->whereIn('ppm_alert_status', ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'])
            ->get()
            ->map(fn($die) => $this->formatDie($die));

        // Recent transfer history (last 30 days)
        $recentTransfers = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->whereNotNull('returned_to_production_at')
            ->where('returned_to_production_at', '>=', now()->subDays(30))
            ->orderByDesc('returned_to_production_at')
            ->limit(20)
            ->get()
            ->map(fn($die) => array_merge($this->formatDie($die), [
                'returned_at' => $die->returned_to_production_at?->format('d-M-Y H:i'),
                'ppm_total_days' => $die->ppm_total_days,
            ]));

        return Inertia::render('Transfer/Index', [
            'toMtn' => $toMtn,
            'toProduction' => $toProduction,
            'atMtn' => $atMtn,
            'recentTransfers' => $recentTransfers,
            'tab' => $tab,
            'stats' => [
                'pending_to_mtn' => $toMtn->count(),
                'at_mtn' => $atMtn->count(),
                'pending_to_prod' => $toProduction->count(),
            ],
        ]);
    }

    /**
     * Transfer a single die to MTN Dies
     */
    public function transferToMtn(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'from_location' => 'nullable|string|max:100',
            'to_location' => 'nullable|string|max:100',
            'transferred_by' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->transferDiesToMtn($die, $validated);

        return redirect()->back()
            ->with('success', "Die {$die->part_number} transferred to MTN Dies.");
    }

    /**
     * Transfer a single die Back to Production
     */
    public function transferToProduction(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'to_location' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->transferBackToProduction($die, $validated);

        return redirect()->back()
            ->with('success', "Die {$die->part_number} transferred back to Production.");
    }

    /**
     * Batch transfer dies to MTN
     */
    public function batchTransferToMtn(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
            'transferred_by' => 'nullable|string|max:100',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'red_alerted')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'No dies eligible for transfer to MTN Dies.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->transferDiesToMtn($die, [
                'transferred_by' => $validated['transferred_by'] ?? auth()->user()?->name,
            ]);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} dies transferred to MTN Dies.");
    }

    /**
     * Batch transfer dies back to Production
     */
    public function batchTransferToProduction(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'ppm_completed')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'No dies eligible for transfer back to Production.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->transferBackToProduction($die);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} dies transferred back to Production.");
    }

    private function formatDie(DieModel $die): array
    {
        return [
            'id' => $die->id,
            'encrypted_id' => $die->encrypted_id,
            'part_number' => $die->part_number,
            'part_name' => $die->part_name,
            'customer' => $die->customer?->code,
            'customer_name' => $die->customer?->name,
            'model' => $die->machineModel?->code,
            'tonnage' => $die->machineModel?->tonnageStandard?->tonnage,
            'qty_die' => $die->qty_die,
            'line' => $die->line,
            'location' => $die->location,
            'ppm_status' => $die->ppm_status,
            'ppm_alert_status' => $die->ppm_alert_status,
            'ppm_alert_status_label' => $die->ppm_alert_status_label,
            'transferred_at' => $die->transferred_at?->format('d-M-Y H:i'),
            'transferred_by' => $die->transferred_by,
            'transfer_from_location' => $die->transfer_from_location,
            'red_alerted_at' => $die->red_alerted_at?->format('d-M-Y H:i'),
            'ppm_finished_at' => $die->ppm_finished_at?->format('d-M-Y H:i'),
        ];
    }
}
