<?php

namespace App\Imports;

use App\Models\DieModel;
use App\Models\ProductionLog;
use App\Models\User;
use App\Notifications\CriticalDieAlert;
use Carbon\Carbon;
use Illuminate\Support\Facades\Notification;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithCalculatedFormulas;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Validators\Failure;
use Illuminate\Support\Facades\Log;

class ProductionLogImport implements ToModel, WithHeadingRow, WithValidation, WithCalculatedFormulas, SkipsEmptyRows, SkipsOnError, SkipsOnFailure
{
    use Importable, SkipsErrors, SkipsFailures;

    protected int $importedCount = 0;
    protected int $accumulatedCount = 0;
    protected array $skippedRows = [];
    protected array $successRows = [];
    protected array $accumulatedRows = [];
    protected int $currentRow = 1; // heading row = 1, data starts at 2
    protected array $alertsSent = [];

    public function model(array $row)
    {
        $this->currentRow++;
        $rowNum = $this->currentRow;

        // Flexible key lookup for part_number
        $partNumber = $this->cleanValue($row['part_number'] ?? $row['part_no'] ?? $row['partnumber'] ?? null);

        // Skip if no part number
        if (empty($partNumber)) {
            return null;
        }

        // Find die by part number
        $die = DieModel::where('part_number', $partNumber)->first();

        // Flexible key lookup for output qty
        $rawOutput = $row['total_output_prod_pcs'] ?? $row['total_output_prod'] ?? $row['output_qty'] ?? $row['output'] ?? $row['qty'] ?? 0;

        if (!$die) {
            $this->skippedRows[] = [
                'row_number' => $rowNum,
                'part_number' => $partNumber,
                'part_name' => $this->cleanValue($row['part_name'] ?? null, '-'),
                'date' => $row['date'] ?? '-',
                'output' => $rawOutput ?: '-',
                'reason' => "Part number '{$partNumber}' not found in Dies Master",
            ];
            return null;
        }

        // Parse date
        $date = $this->parseDate($row['date'] ?? null);
        if (!$date) {
            $this->skippedRows[] = [
                'row_number' => $rowNum,
                'part_number' => $partNumber,
                'part_name' => $die->part_name,
                'date' => $row['date'] ?? '-',
                'output' => $rawOutput ?: '-',
                'reason' => "Invalid date format: '" . ($row['date'] ?? '') . "'",
            ];
            return null;
        }

        // Parse output qty
        $outputQty = (int) str_replace([',', '.', ' '], '', $rawOutput);

        if ($outputQty <= 0) {
            $this->skippedRows[] = [
                'row_number' => $rowNum,
                'part_number' => $partNumber,
                'part_name' => $die->part_name,
                'date' => $date->format('d-M-Y'),
                'output' => $rawOutput ?: '0',
                'reason' => 'Output qty kosong atau 0',
            ];
            return null;
        }

        $shift = (int) ($row['shift'] ?? 1);
        $line = $this->cleanValue($row['line'] ?? null, $die->line);

        // Update qty_die on die master if provided in import
        $rawQtyDie = $row['qty_die'] ?? $row['qtydie'] ?? $row['qty_dies'] ?? null;
        if (!empty($rawQtyDie)) {
            $qtyDie = (int) str_replace([',', '.', ' '], '', $rawQtyDie);
            if ($qtyDie > 0 && $qtyDie !== (int) $die->qty_die) {
                $die->update(['qty_die' => $qtyDie]);
            }
        }

        // Update die accumulation stroke and check for alert
        $previousStatus = $die->ppm_status;
        $die->increment('accumulation_stroke', $outputQty);
        $die->refresh();
        $die->load(['machineModel.tonnageStandard', 'customer']);
        $this->checkAndSendAlert($die, $previousStatus, $die->ppm_status);

        // Check for existing ProductionLog for this die (accumulate output qty)
        // Priority: 1) same die+date+shift, 2) same die+date, 3) latest record for die
        $existingLog = ProductionLog::where('die_id', $die->id)
            ->where('production_date', $date->format('Y-m-d'))
            ->where('shift', $shift)
            ->first();

        if (!$existingLog) {
            $existingLog = ProductionLog::where('die_id', $die->id)
                ->where('production_date', $date->format('Y-m-d'))
                ->first();
        }

        if (!$existingLog) {
            $existingLog = ProductionLog::where('die_id', $die->id)
                ->orderByDesc('production_date')
                ->orderByDesc('shift')
                ->first();
        }

        if ($existingLog) {
            $oldQty = $existingLog->output_qty;
            $existingLog->increment('output_qty', $outputQty);

            $this->accumulatedCount++;
            $this->accumulatedRows[] = [
                'row_number' => $rowNum,
                'part_number' => $partNumber,
                'part_name' => $die->part_name,
                'date' => $existingLog->production_date->format('d-M-Y'),
                'shift' => $existingLog->shift,
                'old_qty' => $oldQty,
                'added_qty' => $outputQty,
                'new_qty' => $oldQty + $outputQty,
            ];

            return null; // Don't create new record
        }

        $this->importedCount++;

        $this->successRows[] = [
            'row_number' => $rowNum,
            'part_number' => $partNumber,
            'part_name' => $die->part_name,
            'date' => $date->format('d-M-Y'),
            'shift' => $shift,
            'line' => $line,
            'output' => $outputQty,
        ];

        return new ProductionLog([
            'die_id' => $die->id,
            'production_date' => $date,
            'shift' => $shift,
            'line' => $line,
            'running_process' => $this->cleanValue($row['running_process'] ?? null, 'Auto'),
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

    /**
     * Clean cell value - discard Excel formula text, return fallback instead
     */
    protected function cleanValue($value, $fallback = null)
    {
        if (empty($value)) {
            return $fallback;
        }
        if (is_string($value) && str_starts_with(trim($value), '=')) {
            return $fallback;
        }
        return $value;
    }

    public function rules(): array
    {
        return [
            'part_number' => 'nullable|string',
            'date' => 'nullable',
            'shift' => 'nullable|integer|min:1|max:3',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'part_number.string' => 'Part Number harus berupa teks',
            'date.required' => 'Date is required',
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

    public function getSuccessRows(): array
    {
        return $this->successRows;
    }

    public function getAccumulatedCount(): int
    {
        return $this->accumulatedCount;
    }

    public function getAccumulatedRows(): array
    {
        return $this->accumulatedRows;
    }

    public function getAlertsSent(): array
    {
        return $this->alertsSent;
    }

    /**
     * Check if die status changed and send alert notification.
     * Sends orange/red alerts to all relevant roles per flowchart.
     */
    protected function checkAndSendAlert(DieModel $die, string $previousStatus, string $newStatus): void
    {
        if ($previousStatus === $newStatus) {
            return;
        }

        // Prevent duplicate alerts for the same die in this import batch
        $alertKey = "{$die->id}_{$newStatus}";
        if (in_array($alertKey, $this->alertsSent)) {
            return;
        }

        $advancedAlertStatuses = [
            'orange_alerted', 'lot_date_set', 'ppm_scheduled', 'schedule_approved',
            'red_alerted', 'transferred_to_mtn', 'ppm_in_progress',
            'additional_repair', 'ppm_completed',
        ];

        $recipients = User::where('is_active', true)
            ->whereIn('role', [
                User::ROLE_ADMIN, User::ROLE_MTN_DIES, User::ROLE_MGR_GM,
                User::ROLE_MD, User::ROLE_PPIC, User::ROLE_PRODUCTION,
            ])
            ->get();

        if ($recipients->isEmpty()) {
            return;
        }

        if ($newStatus === 'orange') {
            Notification::send($recipients, new CriticalDieAlert($die));

            if (!in_array($die->ppm_alert_status, $advancedAlertStatuses)) {
                $die->update(['ppm_alert_status' => 'orange_alerted']);
            }

            cache()->put("ppm_orange_alert_{$die->id}_" . now()->format('Y-m-d'), true, now()->endOfDay());
            $this->alertsSent[] = $alertKey;

        } elseif ($newStatus === 'red') {
            Notification::send($recipients, new CriticalDieAlert($die, 'red'));

            if (!in_array($die->ppm_alert_status, ['red_alerted', 'transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'])) {
                $die->update([
                    'ppm_alert_status' => 'red_alerted',
                    'red_alerted_at' => now(),
                ]);
            }

            cache()->put("ppm_red_alert_{$die->id}_" . now()->format('Y-m-d'), true, now()->endOfDay());
            $this->alertsSent[] = $alertKey;
        }
    }
}
