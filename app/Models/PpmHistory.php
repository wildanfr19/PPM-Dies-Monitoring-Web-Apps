<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PpmHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'die_id',
        'ppm_date',
        'stroke_at_ppm',
        'ppm_number',
        'process_type',
        'checklist_results',
        'pic',
        'status',
        'maintenance_type',
        'work_performed',
        'parts_replaced',
        'findings',
        'recommendations',
        'checked_by',
        'approved_by',
        'created_by',
    ];

    protected $casts = [
        'ppm_date' => 'date:Y-m-d',
        'checklist_results' => 'array',
    ];

    public function die()
    {
        return $this->belongsTo(DieModel::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
