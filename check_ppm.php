<?php

use App\Models\DieModel;

$dies = DieModel::with('machineModel.tonnageStandard')->take(5)->get();

foreach ($dies as $die) {
    echo "=== {$die->part_number} ===\n";
    echo "lot_size (db): " . ($die->attributes['lot_size'] ?? 'null') . "\n";
    echo "lot_size_value: " . $die->lot_size_value . "\n";
    echo "standard_stroke: " . $die->standard_stroke . "\n";
    echo "accumulation_stroke: " . $die->accumulation_stroke . "\n";
    echo "ppm_count: " . ($die->ppm_count ?? 0) . "\n";
    echo "stroke_at_last_ppm: " . ($die->stroke_at_last_ppm ?? 0) . "\n";
    echo "next_ppm_stroke: " . $die->next_ppm_stroke . "\n";
    echo "4 x lot_size: " . (4 * $die->lot_size_value) . "\n";
    echo "total_lots: " . $die->total_lots . "\n";
    echo "\n";
}
