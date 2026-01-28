<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MachineModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'tonnage_standard_id',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the tonnage standard
     */
    public function tonnageStandard(): BelongsTo
    {
        return $this->belongsTo(TonnageStandard::class);
    }

    /**
     * Get all dies using this model
     */
    public function dies(): HasMany
    {
        return $this->hasMany(DieModel::class);
    }

    /**
     * Scope for active models
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
