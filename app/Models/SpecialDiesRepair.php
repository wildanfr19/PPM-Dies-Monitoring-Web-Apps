<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasEncryptedRouteKey;

class SpecialDiesRepair extends Model
{
    use HasFactory, HasEncryptedRouteKey;

    protected $table = 'special_dies_repairs';

    const TYPE_URGENT_DELIVERY = 'urgent_delivery';
    const TYPE_SEVERE_DAMAGE = 'severe_damage';
    const TYPE_SPECIAL_REQUEST = 'special_request';

    const STATUS_APPROVED = 'approved';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    const PRIORITY_HIGH = 'high';
    const PRIORITY_CRITICAL = 'critical';
    const PRIORITY_EMERGENCY = 'emergency';

    protected $fillable = [
        'die_id',
        'repair_type',
        'priority',
        'status',
        'reason',
        'description',
        'requested_by',
        'approved_by',
        'requested_at',
        'approved_at',
        'started_at',
        'completed_at',
        'pic',
        'work_performed',
        'parts_replaced',
        'findings',
        'recommendations',
        'is_ppm_interrupted',
        'is_urgent_delivery',
        'delivery_deadline',
        'customer_po',
        'estimated_hours',
        'actual_hours',
        'previous_ppm_status',
        'previous_location',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'delivery_deadline' => 'date',
        'is_ppm_interrupted' => 'boolean',
        'is_urgent_delivery' => 'boolean',
    ];

    protected $appends = ['encrypted_id'];

    // ==================== RELATIONSHIPS ====================

    public function die()
    {
        return $this->belongsTo(DieModel::class, 'die_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ==================== ACCESSORS ====================

    public function getRepairTypeLabelAttribute(): string
    {
        return match ($this->repair_type) {
            self::TYPE_URGENT_DELIVERY => 'Urgent Delivery',
            self::TYPE_SEVERE_DAMAGE => 'Severe Damage',
            self::TYPE_SPECIAL_REQUEST => 'Special Request',
            default => ucfirst(str_replace('_', ' ', $this->repair_type)),
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_APPROVED => 'Open',
            self::STATUS_IN_PROGRESS => 'In Progress',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            default => ucfirst(str_replace('_', ' ', $this->status)),
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_APPROVED => 'blue',
            self::STATUS_IN_PROGRESS => 'orange',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_CANCELLED => 'gray',
            default => 'gray',
        };
    }

    public function getPriorityColorAttribute(): string
    {
        return match ($this->priority) {
            self::PRIORITY_EMERGENCY => 'red',
            self::PRIORITY_CRITICAL => 'orange',
            self::PRIORITY_HIGH => 'yellow',
            default => 'gray',
        };
    }

    public function getDurationHoursAttribute(): ?int
    {
        if ($this->started_at && $this->completed_at) {
            return (int) $this->started_at->diffInHours($this->completed_at);
        }
        return null;
    }

    // ==================== SCOPES ====================

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_COMPLETED, self::STATUS_CANCELLED]);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeUrgentDelivery($query)
    {
        return $query->where('repair_type', self::TYPE_URGENT_DELIVERY);
    }

    public function scopeSevereDamage($query)
    {
        return $query->where('repair_type', self::TYPE_SEVERE_DAMAGE);
    }

    public function scopePpmInterrupted($query)
    {
        return $query->where('is_ppm_interrupted', true);
    }
}
