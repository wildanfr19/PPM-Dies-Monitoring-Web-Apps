<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasEncryptedRouteKey;

class ProductionLog extends Model
{
    use HasFactory, HasEncryptedRouteKey;

    protected $fillable = [
        'die_id',
        'model',
        'production_date',
        'shift',
        'line',
        'running_process',
        'start_time',
        'finish_time',
        'total_hours',
        'total_minutes',
        'break_time',
        'output_qty',
        'month',
        'created_by',
    ];

    protected $casts = [
        'production_date' => 'date:Y-m-d',
        'start_time' => 'string',
        'finish_time' => 'string',
        'total_hours' => 'decimal:2',
    ];

    protected $appends = ['encrypted_id'];

    public function getStartTimeAttribute($value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (! is_string($value)) {
            return $value;
        }

        $value = trim($value);

        return strlen($value) >= 5 ? substr($value, 0, 5) : ($value === '' ? null : $value);
    }

    public function getFinishTimeAttribute($value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (! is_string($value)) {
            return $value;
        }

        $value = trim($value);

        return strlen($value) >= 5 ? substr($value, 0, 5) : ($value === '' ? null : $value);
    }

    public function setStartTimeAttribute($value): void
    {
        $this->attributes['start_time'] = $this->normalizeTimeValue($value);
    }

    public function setFinishTimeAttribute($value): void
    {
        $this->attributes['finish_time'] = $this->normalizeTimeValue($value);
    }

    protected function normalizeTimeValue($value): ?string
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

    public function die()
    {
        return $this->belongsTo(DieModel:: class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
