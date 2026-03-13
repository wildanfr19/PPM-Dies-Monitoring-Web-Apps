<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasEncryptedRouteKey;

class UserMessage extends Model
{
    use HasFactory, HasEncryptedRouteKey;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'receiver_role',
        'die_id',
        'subject',
        'message',
        'priority',
        'category',
        'parent_id',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    protected $appends = ['encrypted_id'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function die()
    {
        return $this->belongsTo(DieModel::class, 'die_id');
    }

    public function parent()
    {
        return $this->belongsTo(UserMessage::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(UserMessage::class, 'parent_id')->orderBy('created_at');
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForUser($query, $userId, $userRole)
    {
        return $query->where(function ($q) use ($userId, $userRole) {
            $q->where('receiver_id', $userId)
              ->orWhere('receiver_role', $userRole);
        });
    }

    public function getPriorityBadgeAttribute(): string
    {
        return match ($this->priority) {
            'urgent' => '🟠 Urgent',
            'critical' => '🔴 Critical',
            default => '🟢 Normal',
        };
    }
}
