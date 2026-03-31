<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportLog extends Model
{
    protected $fillable = [
        'type',
        'file_name',
        'status',
        'imported_count',
        'skipped_count',
        'accumulated_count',
        'skipped_rows',
        'error_message',
        'user_id',
    ];

    protected $casts = [
        'skipped_rows' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
