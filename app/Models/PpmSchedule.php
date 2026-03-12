<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PpmSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'die_id',
        'year',
        'month',
        'week',
        'forecast_stroke',
        'plan_week',
        'is_done',
        'actual_stroke',
        'ppm_date',
        'pic',
        'notes',
        'updated_by',
    ];

    protected $casts = [
        'is_done' => 'boolean',
        'ppm_date' => 'date:Y-m-d',
    ];

    public function die()
    {
        return $this->belongsTo(DieModel::class);
    }

    /**
     * Get week label (I, II, III, IV)
     */
    public function getWeekLabelAttribute()
    {
        return match($this->week) {
            1 => 'I',
            2 => 'II',
            3 => 'III',
            4 => 'IV',
            default => $this->week,
        };
    }
}
