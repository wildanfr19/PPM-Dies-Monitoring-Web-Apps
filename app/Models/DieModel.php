<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DieModel extends Model
{
    use HasFactory;

    protected $table = 'dies';

    protected $fillable = [
        'part_number',
        'part_name',
        'machine_model_id',
        'customer_id',
        'qty_die',
        'line',
        'accumulation_stroke',
        'last_stroke',
        'control_stroke',
        'last_ppm_date',
        'location',
        'status',
        'notes',
    ];

    protected $casts = [
        'last_ppm_date' => 'date:Y-m-d',
    ];

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

    // ==================== ACCESSORS ====================

    /**
     * Get standard stroke (from control_stroke or tonnage standard)
     */
    public function getStandardStrokeAttribute()
    {
        return $this->control_stroke
            ?? ($this->machineModel?->tonnageStandard?->standard_stroke ?? 0);
    }

    /**
     * Get lot size from tonnage standard
     */
    public function getLotSizeAttribute()
    {
        return $this->machineModel?->tonnageStandard?->lot_size ??  2500;
    }

    /**
     * Get remaining strokes until PPM needed
     */
    public function getRemainingStrokesAttribute()
    {
        return $this->standard_stroke - $this->accumulation_stroke;
    }

    /**
     * Get stroke percentage
     */
    public function getStrokePercentageAttribute()
    {
        if ($this->standard_stroke <= 0) return 0;
        return round(($this->accumulation_stroke / $this->standard_stroke) * 100, 1);
    }

    /**
     * Get remaining lots
     */
    public function getRemainingLotsAttribute()
    {
        if ($this->lot_size <= 0) return 0;
        return round($this->remaining_strokes / $this->lot_size, 2);
    }

    /**
     * Get current lot number
     */
    public function getCurrentLotAttribute()
    {
        if ($this->lot_size <= 0) return 0;
        return floor($this->accumulation_stroke / $this->lot_size) + 1;
    }

    /**
     * Get total lots
     */
    public function getTotalLotsAttribute()
    {
        if ($this->lot_size <= 0) return 0;
        return ceil($this->standard_stroke / $this->lot_size);
    }

    /**
     * Get status (green/orange/red)
     */
    public function getPpmStatusAttribute()
    {
        if ($this->remaining_strokes <= 0) {
            return 'red';
        } elseif ($this->remaining_lots <= 1) {
            return 'orange';
        }
        return 'green';
    }

    /**
     * Get status label
     */
    public function getPpmStatusLabelAttribute()
    {
        return match($this->ppm_status) {
            'red' => 'Critical - Need PPM Now! ',
            'orange' => 'Warning - Plan PPM Soon',
            'green' => 'OK',
            default => 'Unknown',
        };
    }

    /**
     * Get lot progress for visualization
     */
    public function getLotProgressAttribute()
    {
        $lots = [];
        $totalLots = $this->total_lots;
        $currentLot = $this->current_lot;
        $remainingLots = $this->remaining_lots;

        for ($i = 1; $i <= $totalLots; $i++) {
            $lotStrokeEnd = $i * $this->lot_size;

            if ($this->accumulation_stroke >= $lotStrokeEnd) {
                // Lot completed
                $status = ($remainingLots <= 0) ? 'red' : 'green';
                $lots[] = ['lot' => $i, 'status' => $status, 'completed' => true];
            } elseif ($this->accumulation_stroke >= ($i - 1) * $this->lot_size) {
                // Current lot (in progress)
                $status = ($remainingLots <= 1) ? 'orange' : 'green';
                $lots[] = ['lot' => $i, 'status' => $status, 'completed' => false];
            } else {
                // Future lot
                $lots[] = ['lot' => $i, 'status' => 'empty', 'completed' => false];
            }
        }

        return $lots;
    }

    // ==================== SCOPES ====================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCritical($query)
    {
        return $query->whereRaw('accumulation_stroke >= COALESCE(control_stroke,
            (SELECT standard_stroke FROM tonnage_standards ts
             JOIN machine_models mm ON mm.tonnage_standard_id = ts.id
             WHERE mm.id = dies.machine_model_id))');
    }

    public function scopeWarning($query)
    {
        return $query->whereRaw('accumulation_stroke >= COALESCE(control_stroke,
            (SELECT standard_stroke - lot_size FROM tonnage_standards ts
             JOIN machine_models mm ON mm.tonnage_standard_id = ts.id
             WHERE mm.id = dies.machine_model_id))');
    }
}
