<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasEncryptedRouteKey;

class DieProcess extends Model
{
    use HasFactory, HasEncryptedRouteKey;

    protected $fillable = [
        'die_id',
        'process_type',
        'process_order',
        'ppm_status',
        'ppm_started_at',
        'ppm_completed_at',
        'ppm_history_id',
        'completed_by',
        'notes',
    ];

    protected $casts = [
        'ppm_started_at' => 'datetime',
        'ppm_completed_at' => 'datetime',
    ];

    protected $appends = ['encrypted_id'];

    public function die()
    {
        return $this->belongsTo(DieModel::class, 'die_id');
    }

    public function ppmHistory()
    {
        return $this->belongsTo(PpmHistory::class);
    }

    public function getProcessLabelAttribute(): string
    {
        $labels = [
            'blank_pierce' => 'BLANK + PIERCE',
            'draw' => 'DRAW',
            'embos' => 'EMBOS',
            'trim' => 'TRIM',
            'form' => 'FORM',
            'flang' => 'FLANG',
            'restrike' => 'RESTRIKE',
            'pierce' => 'PIERCE',
            'cam_pierce' => 'CAM-PIERCE',
        ];

        return $labels[$this->process_type] ?? strtoupper($this->process_type);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->ppm_status) {
            'pending' => '⏳ Pending',
            'in_progress' => '🔧 In Progress',
            'completed' => '✅ Completed',
            default => 'Unknown',
        };
    }

    public function scopePending($query)
    {
        return $query->where('ppm_status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('ppm_status', 'completed');
    }
}
