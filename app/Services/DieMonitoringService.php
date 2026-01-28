<?php

namespace App\Services;

use App\Models\DieModel;
use App\Models\ProductionLog;
use App\Models\PpmHistory;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DieMonitoringService
{
    /**
     * Get dashboard summary statistics
     */
    public function getDashboardStats(): array
    {
        $dies = DieModel::with(['machineModel.tonnageStandard'])->active()->get();

        $stats = [
            'total' => $dies->count(),
            'ok' => 0,
            'warning' => 0,
            'critical' => 0,
        ];

        foreach ($dies as $die) {
            match ($die->ppm_status) {
                'green' => $stats['ok']++,
                'orange' => $stats['warning']++,
                'red' => $stats['critical']++,
                default => null,
            };
        }

        return $stats;
    }

    /**
     * Get dies grouped by tonnage with statistics
     */
    public function getDiesByTonnage(): array
    {
        $result = [];

        $dies = DieModel::with(['machineModel.tonnageStandard'])
            ->active()
            ->get()
            ->groupBy(fn($die) => $die->machineModel?->tonnageStandard?->tonnage ?? 'Unknown');

        foreach ($dies as $tonnage => $diesGroup) {
            $total = $diesGroup->count();
            if ($total === 0) continue;

            $ok = $diesGroup->filter(fn($d) => $d->ppm_status === 'green')->count();

            $result[] = [
                'tonnage' => $tonnage,
                'total' => $total,
                'ok' => $ok,
                'warning' => $diesGroup->filter(fn($d) => $d->ppm_status === 'orange')->count(),
                'critical' => $diesGroup->filter(fn($d) => $d->ppm_status === 'red')->count(),
                'percentage' => $total > 0 ? round(($ok / $total) * 100, 1) : 0,
            ];
        }

        return $result;
    }

    /**
     * Get critical dies that need immediate attention
     */
    public function getCriticalDies(int $limit = 10)
    {
        return DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->get()
            ->filter(fn($die) => in_array($die->ppm_status, ['red', 'orange']))
            ->sortBy('remaining_strokes')
            ->take($limit)
            ->map(fn($die) => [
                'id' => $die->id,
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'accumulation_stroke' => $die->accumulation_stroke,
                'standard_stroke' => $die->standard_stroke,
                'stroke_percentage' => $die->stroke_percentage,
                'ppm_status' => $die->ppm_status,
                'ppm_status_label' => $die->ppm_status_label,
            ])
            ->values();
    }

    /**
     * Get all dies with filters
     */
    public function getDies(array $filters = [])
    {
        $query = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active();

        // Filter by customer
        if (! empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        // Filter by machine model
        if (!empty($filters['machine_model_id'])) {
            $query->where('machine_model_id', $filters['machine_model_id']);
        }

        // Filter by line/tonnage
        if (!empty($filters['line'])) {
            $query->where('line', $filters['line']);
        }

        // Search by part number or name
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('part_number', 'like', "%{$search}%")
                  ->orWhere('part_name', 'like', "%{$search}%");
            });
        }

        $dies = $query->orderBy('part_number')->get();

        // Filter by status if specified
        if (!empty($filters['status'])) {
            $dies = $dies->filter(fn($die) => $die->ppm_status === $filters['status']);
        }

        return $dies;
    }

    /**
     * Update accumulation stroke from production logs
     */
    public function updateAccumulationStroke(DieModel $die): DieModel
    {
        $lastPpmDate = $die->last_ppm_date ??  '1900-01-01';

        $totalStroke = ProductionLog::where('die_id', $die->id)
            ->where('production_date', '>', $lastPpmDate)
            ->sum('output_qty');

        $die->accumulation_stroke = $die->last_stroke + $totalStroke;
        $die->save();

        return $die->fresh();
    }

    /**
     * Record PPM completion and reset stroke
     */
    public function recordPpm(DieModel $die, array $data): PpmHistory
    {
        return DB::transaction(function () use ($die, $data) {
            $history = PpmHistory::create([
                'die_id' => $die->id,
                'ppm_date' => $data['ppm_date'],
                'stroke_at_ppm' => $die->accumulation_stroke,
                'pic' => $data['pic'],
                'status' => 'done',
                'maintenance_type' => $data['maintenance_type'] ?? 'routine',
                'work_performed' => $data['work_performed'] ?? null,
                'parts_replaced' => $data['parts_replaced'] ?? null,
                'findings' => $data['findings'] ??  null,
                'recommendations' => $data['recommendations'] ?? null,
                'checked_by' => $data['checked_by'] ?? null,
                'approved_by' => $data['approved_by'] ?? null,
                'created_by' => auth()->id(),
            ]);

            $die->update([
                'last_stroke' => 0,
                'accumulation_stroke' => 0,
                'last_ppm_date' => $data['ppm_date'],
            ]);

            return $history;
        });
    }

    /**
     * Add production log and update stroke
     */
    public function addProductionLog(array $data): ProductionLog
    {
        return DB::transaction(function () use ($data) {
            $log = ProductionLog:: create([
                'die_id' => $data['die_id'],
                'production_date' => $data['production_date'],
                'shift' => $data['shift'],
                'line' => $data['line'] ?? null,
                'running_process' => $data['running_process'] ?? 'Auto',
                'start_time' => $data['start_time'] ?? null,
                'finish_time' => $data['finish_time'] ?? null,
                'total_hours' => $data['total_hours'] ?? null,
                'total_minutes' => $data['total_minutes'] ?? null,
                'break_time' => $data['break_time'] ?? null,
                'output_qty' => $data['output_qty'],
                'month' => Carbon::parse($data['production_date'])->format('M'),
                'created_by' => auth()->id(),
            ]);

            $die = DieModel::find($data['die_id']);
            $die->increment('accumulation_stroke', $data['output_qty']);

            return $log;
        });
    }

    /**
     * Get upcoming PPM schedule
     */
    public function getUpcomingPpm(int $days = 30): array
    {
        $dies = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->get();

        $upcoming = [];

        foreach ($dies as $die) {
            if ($die->remaining_lots <= 2 && $die->remaining_lots > 0) {
                $avgDailyStroke = ProductionLog::where('die_id', $die->id)
                    ->where('production_date', '>=', now()->subDays(30))
                    ->avg('output_qty') ?? 0;

                $estimatedDays = $avgDailyStroke > 0
                    ? ceil($die->remaining_strokes / $avgDailyStroke)
                    : null;

                if ($estimatedDays === null || $estimatedDays <= $days) {
                    $upcoming[] = [
                        'die' => [
                            'id' => $die->id,
                            'part_number' => $die->part_number,
                            'part_name' => $die->part_name,
                            'accumulation_stroke' => $die->accumulation_stroke,
                            'standard_stroke' => $die->standard_stroke,
                            'stroke_percentage' => $die->stroke_percentage,
                            'lot_progress' => $die->lot_progress,
                        ],
                        'estimated_days' => $estimatedDays,
                        'remaining_strokes' => $die->remaining_strokes,
                        'remaining_lots' => $die->remaining_lots,
                    ];
                }
            }
        }

        usort($upcoming, fn($a, $b) => $a['remaining_strokes'] <=> $b['remaining_strokes']);

        return $upcoming;
    }
}
