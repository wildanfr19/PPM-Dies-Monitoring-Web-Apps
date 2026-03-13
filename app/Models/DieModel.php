<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasEncryptedRouteKey;

class DieModel extends Model
{
    use HasFactory, HasEncryptedRouteKey;

    protected $table = 'dies';

    // Process types for PPM inspection checklist
    const PROCESS_TYPES = [
        'blank_pierce',
        'draw',
        'embos',
        'trim',
        'form',
        'flang',
        'restrike',
        'pierce',
        'cam_pierce',
    ];

    protected $fillable = [
        'part_number',
        'part_name',
        'model',              // Model produk (20QX, KS, 5H45, etc)
        'machine_model_id',
        'customer_id',
        'qty_die',
        'line',
        'process_type',       // Process type for PPM checklist (blank_pierce, draw, etc)
        'lot_size',           // Lot size per batch (600, 5000)
        'ppm_standard',       // Standard stroke untuk PPM (6000, 5000) - mengacu pada langkah standar
        'accumulation_stroke',
        'ppm_count',          // Jumlah PPM yang sudah dilakukan
        'stroke_at_last_ppm', // Stroke saat PPM terakhir dilakukan
        'last_stroke',
        'control_stroke',     // Override manual jika diperlukan
        'last_ppm_date',
        'location',
        'status',
        'ppm_alert_status',   // Status alert: null, 'orange_alerted', 'red_alerted', 'lot_date_set', 'transferred_to_mtn', 'ppm_scheduled', 'ppm_in_progress'
        'ppm_scheduled_date',
        'ppm_scheduled_by',
        'schedule_approved_at',
        'schedule_approved_by',
        'notes',
        // PPIC Feature: Last Date of LOT
        'last_lot_date',
        'last_lot_date_set_by',
        // PROD Feature: Transfer Dies
        'transferred_at',
        'transferred_by',
        'transfer_from_location',
        'transfer_to_location',
        // PPM Timeline Tracking
        'red_alerted_at',
        'ppm_started_at',
        'ppm_finished_at',
        'returned_to_production_at',
        'ppm_total_days',
        // Group classification
        'die_group',
        // Special 4-lot check flag
        'is_4lot_check',
        // Schedule remarks
        'schedule_remark',
        'schedule_change_reason',
        'mtn_remark',
        'ppic_remark',
        'schedule_cancelled_at',
        'schedule_cancelled_by',
    ];

    protected $casts = [
        'last_ppm_date' => 'date:Y-m-d',
        'last_lot_date' => 'date:Y-m-d',
        'ppm_scheduled_date' => 'date:Y-m-d',
        'schedule_approved_at' => 'datetime',
        'transferred_at' => 'datetime',
        'red_alerted_at' => 'datetime',
        'ppm_started_at' => 'datetime',
        'ppm_finished_at' => 'datetime',
        'returned_to_production_at' => 'datetime',
        'is_4lot_check' => 'boolean',
        'schedule_cancelled_at' => 'datetime',
    ];

    protected $appends = ['encrypted_id'];

    // ==================== RELATIONSHIPS ====================

    public function machineModel()
    {
        return $this->belongsTo(MachineModel::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function productionLogs()
    {
        return $this->hasMany(ProductionLog::class, 'die_id');
    }

    public function ppmSchedules()
    {
        return $this->hasMany(PpmSchedule::class, 'die_id');
    }

    public function ppmHistories()
    {
        return $this->hasMany(PpmHistory::class, 'die_id');
    }

    public function specialRepairs()
    {
        return $this->hasMany(SpecialDiesRepair::class, 'die_id');
    }

    public function dieProcesses()
    {
        return $this->hasMany(DieProcess::class, 'die_id')->orderBy('process_order');
    }

    /**
     * Get count of completed processes vs total processes for current PPM cycle
     */
    public function getPpmProcessProgressAttribute(): array
    {
        $processes = $this->dieProcesses;
        $total = $processes->count();
        $completed = $processes->where('ppm_status', 'completed')->count();
        $inProgress = $processes->where('ppm_status', 'in_progress')->count();

        return [
            'total' => $total,
            'completed' => $completed,
            'in_progress' => $inProgress,
            'pending' => $total - $completed - $inProgress,
            'all_completed' => $total > 0 && $completed === $total,
            'percentage' => $total > 0 ? round(($completed / $total) * 100) : 0,
        ];
    }

    // ==================== ACCESSORS ====================

    /**
     * Get standard stroke untuk PPM
     * Prioritas: control_stroke (manual override) -> ppm_standard -> tonnage standard
     * Ini adalah langkah standar yang ditentukan sebelum cetakan perlu PPM
     */
    public function getStandardStrokeAttribute()
    {
        // 1. Manual override dari control_stroke
        if ($this->control_stroke && $this->control_stroke > 0) {
            return $this->control_stroke;
        }

        // 2. PPM Standard dari data die (dari import Excel)
        if ($this->ppm_standard && $this->ppm_standard > 0) {
            return $this->ppm_standard;
        }

        // 3. Default dari tonnage standard machine model
        return $this->machineModel?->tonnageStandard?->standard_stroke ?? 6000;
    }

    /**
     * Get lot size
     * Prioritas: lot_size dari die -> default dari tonnage standard
     */
    public function getLotSizeValueAttribute()
    {
        if ($this->attributes['lot_size'] && $this->attributes['lot_size'] > 0) {
            return $this->attributes['lot_size'];
        }
        return $this->machineModel?->tonnageStandard?->lot_size ?? 600;
    }

    /**
     * Get remaining strokes until NEXT PPM checkpoint
     * Based on "every 4 lots" rule
     */
    public function getRemainingStrokesAttribute()
    {
        return max(0, $this->standard_stroke - $this->accumulation_stroke);
    }

    /**
     * Get stroke percentage towards standard stroke
     */
    public function getStrokePercentageAttribute()
    {
        $standardStroke = $this->standard_stroke;
        if ($standardStroke <= 0) return 100;

        return round(($this->accumulation_stroke / $standardStroke) * 100, 1);
    }

    /**
     * Get remaining lots until standard stroke
     */
    public function getRemainingLotsAttribute()
    {
        $lotSize = $this->lot_size_value;
        if ($lotSize <= 0) return 0;
        return round($this->remaining_strokes / $lotSize, 1);
    }

    /**
     * Get current lot number (absolute, based on accumulation)
     */
    public function getCurrentLotAttribute()
    {
        $lotSize = $this->lot_size_value;
        if ($lotSize <= 0) return 0;

        return (int) floor($this->accumulation_stroke / $lotSize) + 1;
    }

    /**
     * Get lots per PPM cycle (fixed at 4)
     */
    public function getLotsPerPpmAttribute()
    {
        return 4; // PPM required every 4 lots
    }

    /**
     * Get next PPM stroke checkpoint
     * PPM is required every 4 lots
     */
    public function getNextPpmStrokeAttribute()
    {
        $lotSize = $this->lot_size_value;
        if ($lotSize <= 0) return $this->standard_stroke;

        // Next PPM = stroke_at_last_ppm + (4 lots * lot_size)
        $lastPpmStroke = $this->stroke_at_last_ppm ?? 0;
        $nextCheckpoint = $lastPpmStroke + ($this->lots_per_ppm * $lotSize);

        // Cap at standard_stroke only if last PPM was before standard_stroke
        // After PPM at/past standard, next checkpoint is the full cycle from new base
        if ($lastPpmStroke < $this->standard_stroke) {
            return min($nextCheckpoint, $this->standard_stroke);
        }

        // Last PPM was at or past standard stroke - don't cap
        return $nextCheckpoint;
    }

    /**
     * Get total PPM checkpoints needed to reach standard
     */
    public function getTotalPpmCheckpointsAttribute()
    {
        $lotSize = $this->lot_size_value;
        if ($lotSize <= 0) return 1;

        $totalLots = ceil($this->standard_stroke / $lotSize);
        return ceil($totalLots / $this->lots_per_ppm);
    }

    /**
     * Get total lots
     */
    public function getTotalLotsAttribute()
    {
        $lotSize = $this->lot_size_value;
        if ($lotSize <= 0) return 0;
        return (int) ceil($this->standard_stroke / $lotSize);
    }

    /**
     * Get PPM status (green/orange/red)
     *
     * NEW LOGIC - Based on "Every 4 Lots" Rule:
     *
     * Example: Standard 6000, Lot Size 375, Total 16 lots
     * PPM Checkpoints: Lot 4 (1500), Lot 8 (3000), Lot 12 (4500), Lot 16 (6000)
     *
     * After each PPM, stroke_at_last_ppm is updated, ppm_count incremented
     *
     * Status Logic (relative to NEXT checkpoint):
     * - GREEN: Current lot 1-2 of 4-lot cycle (< 75% to next checkpoint)
     * - ORANGE: Current lot 3 of 4-lot cycle (75-99% to next checkpoint)
     * - RED: Current lot 4+ (>= next checkpoint, PPM overdue!)
     */
    public function getPpmStatusAttribute()
    {
        $lotSize = $this->lot_size_value;
        $standardStroke = $this->standard_stroke;

        if ($lotSize <= 0 || $standardStroke <= 0) return 'green';

        // Orange threshold = standard_stroke - lot_size
        $orangeThreshold = $standardStroke - $lotSize;

        // RED: Accumulation has reached or exceeded standard stroke
        if ($this->accumulation_stroke >= $standardStroke) {
            return 'red';
        }

        // ORANGE: Within 1 lot of standard stroke
        if ($this->accumulation_stroke >= $orangeThreshold) {
            return 'orange';
        }

        // GREEN: OK, still safe
        return 'green';
    }

    /**
     * Get status label sesuai flow PPM Dies Controlling
     */
    public function getPpmStatusLabelAttribute()
    {
        $ppmNumber = ($this->ppm_count ?? 0) + 1;
        $standardStroke = number_format($this->standard_stroke);

        return match($this->ppm_status) {
            'red' => "🔴 CRITICAL - PPM #{$ppmNumber} Required! (at {$standardStroke} strokes)",
            'orange' => "🟠 WARNING - Approaching PPM #{$ppmNumber} (at {$standardStroke} strokes)",
            'green' => '🟢 OK - Within Normal Limit',
            default => 'Unknown',
        };
    }

    /**
     * Get alert status label
     * Per Flow PPM Dies Controlling System
     */
    public function getPpmAlertStatusLabelAttribute()
    {
        return match($this->ppm_alert_status) {
            'orange_alerted' => 'Orange Alert Sent',
            'lot_date_set' => 'PPIC: Last LOT Date Set',
            'ppm_scheduled' => 'MTN Dies: PPM Scheduled',
            'schedule_approved' => 'PPIC: Schedule Approved',
            'red_alerted' => 'Red Alert Sent - Awaiting Transfer',
            'transferred_to_mtn' => 'PROD: Dies Transferred to MTN',
            'ppm_in_progress' => 'MTN Dies: PPM In Progress',
            'additional_repair' => 'MTN Dies: Additional Repair Needed',
            'ppm_completed' => 'PPM Completed - Awaiting Transfer Back',
            'special_repair' => 'Special Repair In Progress',
            default => null,
        };
    }

    /**
     * Get PPM trigger condition info
     * Kondisi 1: PPM karena mencapai Standard Stroke (akhir lifecycle)
     * Kondisi 2: PPM karena setiap 4 lot (checkpoint periodik)
     *
     * Returns which condition will trigger PPM first
     */
    public function getPpmTriggerConditionAttribute()
    {
        $nextPpmStroke = $this->next_ppm_stroke;
        $standardStroke = $this->standard_stroke;

        return [
            'type' => 'standard',
            'label' => 'Standard Stroke',
            'description' => 'PPM at standard stroke limit',
        ];
    }

    /**
     * Get PPM conditions info for display
     * Shows both conditions with their targets
     */
    public function getPpmConditionsInfoAttribute()
    {
        $lotSize = $this->lot_size_value;
        $standardStroke = $this->standard_stroke;
        $accumulation = $this->accumulation_stroke;
        $ppmCount = $this->ppm_count ?? 0;

        // Kondisi 1: Target Standard Stroke (Red / PPM Required)
        $condition1 = [
            'name' => 'PPM Target',
            'description' => 'Standard Stroke',
            'target' => $standardStroke,
            'remaining' => max(0, $standardStroke - $accumulation),
            'percentage' => $standardStroke > 0 ? round(($accumulation / $standardStroke) * 100, 1) : 0,
            'is_active' => true,
        ];

        // Kondisi 2: Warning Threshold (Orange = standard_stroke - lot_size)
        $orangeThreshold = $standardStroke - $lotSize;
        $condition2 = [
            'name' => 'Warning Threshold',
            'description' => 'Orange alert at ' . number_format($orangeThreshold) . ' strokes',
            'target' => $orangeThreshold,
            'remaining' => max(0, $orangeThreshold - $accumulation),
            'percentage' => $orangeThreshold > 0 ? round(($accumulation / $orangeThreshold) * 100, 1) : 0,
            'is_active' => $accumulation >= $orangeThreshold,
        ];

        return [
            'condition_1' => $condition1,
            'condition_2' => $condition2,
        ];
    }

    /**
     * Get lot progress for visualization
     *
     * Berdasarkan ilustrasi whiteboard:
     * - Standard: 10,000 strokes, Lot Size: 2,500
     * - 10,000 / 2,500 = 4 lots
     *
     * Signal/Alert Logic berdasarkan ZONA (bukan status completed):
     * - Lot #1, #2: Green zone (aman)
     * - Lot #3 (5,000-7,500): Orange zone - Remaining 1 lot size (Warning)
     * - Lot #4 (7,500-10,000): Red zone - Mendekati/melebihi standard (Critical)
     *
     * Visualisasi (selalu menunjukkan zona):
     * | Lot #1 | Lot #2 | Lot #3 | Lot #4 |
     * |  Gn    |   Gn   |  Ora   |  Red   |
     */
    public function getLotProgressAttribute()
    {
        $lots = [];
        $totalLots = $this->total_lots;
        $lotSize = $this->lot_size_value;
        $standardStroke = $this->standard_stroke;
        $accumulationStroke = $this->accumulation_stroke;

        if ($totalLots <= 0) {
            return $lots;
        }

        for ($i = 1; $i <= $totalLots; $i++) {
            $lotStrokeStart = ($i - 1) * $lotSize;
            $lotStrokeEnd = min($i * $lotSize, $standardStroke);

            // Tentukan ZONA lot ini (warna tetap berdasarkan posisi, bukan progress)
            // Lot terakhir = Red zone
            // Lot sebelum terakhir = Orange zone
            // Lot lainnya = Green zone
            $isLastLot = ($i === $totalLots);
            $isSecondLastLot = ($i === $totalLots - 1);

            // Warna zona (tetap tidak berubah)
            if ($isLastLot) {
                $zoneColor = 'red';
            } elseif ($isSecondLastLot) {
                $zoneColor = 'orange';
            } else {
                $zoneColor = 'green';
            }

            // Tentukan status lot (completed, current, atau empty)
            $isCompleted = ($accumulationStroke >= $lotStrokeEnd);
            $isCurrent = (!$isCompleted && $accumulationStroke >= $lotStrokeStart);
            $isEmpty = (!$isCompleted && !$isCurrent);

            $lotData = [
                'lot' => $i,
                'zone' => $zoneColor,           // Warna zona tetap
                'status' => $zoneColor,         // Status = zona untuk backward compatibility
                'completed' => $isCompleted,
                'current' => $isCurrent,
                'stroke_start' => $lotStrokeStart,
                'stroke_end' => $lotStrokeEnd,
            ];

            // Jika empty, tambahkan suffix untuk styling
            if ($isEmpty) {
                $lotData['status'] = $zoneColor . '-empty';
            }

            // Jika current lot, tambahkan info progress
            if ($isCurrent) {
                $lotData['current_stroke'] = $accumulationStroke;
                $progressInLot = $accumulationStroke - $lotStrokeStart;
                $lotData['lot_percentage'] = round(($progressInLot / $lotSize) * 100, 1);
            }

            $lots[] = $lotData;
        }

        return $lots;
    }

    // ==================== SCOPES ====================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for dies needing PPM (red status)
     */
    public function scopeCritical($query)
    {
        return $query->whereRaw('accumulation_stroke >= COALESCE(
            control_stroke,
            ppm_standard,
            (SELECT standard_stroke FROM tonnage_standards ts
             JOIN machine_models mm ON mm.tonnage_standard_id = ts.id
             WHERE mm.id = dies.machine_model_id)
        )');
    }

    /**
     * Scope for dies in warning status (orange)
     */
    public function scopeWarning($query)
    {
        return $query->whereRaw('accumulation_stroke >= COALESCE(
            control_stroke,
            ppm_standard,
            (SELECT standard_stroke FROM tonnage_standards ts
             JOIN machine_models mm ON mm.tonnage_standard_id = ts.id
             WHERE mm.id = dies.machine_model_id)
        ) - COALESCE(
            dies.lot_size,
            (SELECT lot_size FROM tonnage_standards ts
             JOIN machine_models mm ON mm.tonnage_standard_id = ts.id
             WHERE mm.id = dies.machine_model_id),
            600
        )');
    }

    /**
     * Scope for dies needing attention (orange or red)
     */
    public function scopeNeedsAttention($query)
    {
        // Dies where remaining strokes is less than 1 lot
        return $query->whereRaw('accumulation_stroke >= COALESCE(
            control_stroke,
            ppm_standard,
            (SELECT standard_stroke FROM tonnage_standards ts
             JOIN machine_models mm ON mm.tonnage_standard_id = ts.id
             WHERE mm.id = dies.machine_model_id)
        ) - COALESCE(
            dies.lot_size,
            (SELECT lot_size FROM tonnage_standards ts
             JOIN machine_models mm ON mm.tonnage_standard_id = ts.id
             WHERE mm.id = dies.machine_model_id),
            600
        )');
    }
}
