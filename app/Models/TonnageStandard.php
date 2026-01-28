<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TonnageStandard extends Model
{
    use HasFactory;

    protected $fillable = [
        'tonnage',
        'grade',
        'type',
        'standard_stroke',
        'lot_size',
        'description',
    ];

    /**
     * Get machine models using this tonnage standard
     */
    public function machineModels()
    {
        return $this->hasMany(MachineModel::class);
    }

    /**
     * Calculate total lots based on standard stroke
     */
    public function getTotalLotsAttribute()
    {
        return ceil($this->standard_stroke / $this->lot_size);
    }
}
