<?php

namespace App\Imports;

use App\Models\DieModel;
use App\Models\ProductionLog;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Illuminate\Support\Facades\Log;

class ProductionLogImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows, SkipsOnError
{
    use Importable, SkipsErrors;

    protected int $importedCount = 0;
    protected array $skippedRows = [];

    public function model(array $row)
    {
        // Skip if no part number
        if (empty($row['part_number'])) {
            return null;
        }

        // Find die by part number
        $die = DieModel::where('part_number', $row['part_number'])->first();

        if (!$die) {
            $this->skippedRows[] = [
                'row' => $row,
                'reason' => "Die with part number '{$row['part_number']}' not found",
            ];
            return null;
        }

        // Parse date
        $date = $this->parseDate($row['date']);
        if (!$date) {
            $this->skippedRows[] = [
                'row' => $row,
                'reason' => "Invalid date format: '{$row['date']}'",
            ];
            return null;
        }

        // Parse output qty
        $outputQty = (int) str_replace([',', '. '], '', $row['total_output_prod_pcs'] ?? $row['total_output_prod'] ?? 0);

        if ($outputQty <= 0) {
            return null;
        }

        // Update die accumulation stroke
        $die->increment('accumulation_stroke', $outputQty);

        $this->importedCount++;

        return new ProductionLog([
            'die_id' => $die->id,
            'production_date' => $date,
            'shift' => (int) ($row['shift'] ?? 1),
            'line' => $row['line'] ?? $die->line,
            'running_process' => $row['running_process'] ?? 'Auto',
            'start_time' => $this->parseTime($row['start'] ?? null),
            'finish_time' => $this->parseTime($row['finish'] ?? null),
            'total_hours' => $this->parseHours($row['total_hr'] ?? null),
            'total_minutes' => (int) ($row['total_min'] ?? 0),
            'break_time' => (int) ($row['break_time_min'] ?? 0),
            'output_qty' => $outputQty,
            'month' => $date->format('M'),
            'created_by' => auth()->id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'part_number' => 'required|string',
            'date' => 'required',
            'shift' => 'nullable|integer|min:1|max:3',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'part_number.required' => 'Part Number is required',
            'date. required' => 'Date is required',
        ];
    }

    protected function parseDate($value): ?Carbon
    {
        if (empty($value)) {
            return null;
        }

        try {
            // Try different date formats
            $formats = ['d-M-y', 'd-M-Y', 'Y-m-d', 'd/m/Y', 'd/m/y', 'm/d/Y'];

            foreach ($formats as $format) {
                try {
                    return Carbon::createFromFormat($format, $value);
                } catch (\Exception $e) {
                    continue;
                }
            }

            // Try Excel serial date
            if (is_numeric($value)) {
                return Carbon::createFromTimestamp(($value - 25569) * 86400);
            }

            return Carbon::parse($value);
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function parseTime($value): ?string
    {
        if (empty($value)) {
            return null;
        }

        try {
            if (is_numeric($value)) {
                // Excel time (fraction of day)
                $hours = floor($value * 24);
                $minutes = round(($value * 24 - $hours) * 60);
                return sprintf('%02d:%02d', $hours, $minutes);
            }

            return Carbon::parse($value)->format('H:i');
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function parseHours($value): ?float
    {
        if (empty($value)) {
            return null;
        }

        if (is_numeric($value)) {
            return (float) $value;
        }

        // Parse time format like "1:27"
        if (strpos($value, ':') !== false) {
            $parts = explode(':', $value);
            return (float) $parts[0] + ((float) ($parts[1] ??  0) / 60);
        }

        return null;
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getSkippedRows(): array
    {
        return $this->skippedRows;
    }
}
