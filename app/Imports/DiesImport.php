<?php

namespace App\Imports;

use App\Models\Die;
use App\Models\Customer;
use App\Models\MachineModel;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;

class DiesImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows, SkipsOnError
{
    use Importable, SkipsErrors;

    protected int $importedCount = 0;
    protected int $updatedCount = 0;
    protected array $skippedRows = [];

    public function model(array $row)
    {
        // Skip if no part number
        if (empty($row['part_number'])) {
            return null;
        }

        // Find or get customer
        $customer = Customer::where('code', $row['customer'])->first();
        if (!$customer) {
            // Create customer if not exists
            $customer = Customer::create([
                'code' => $row['customer'],
                'name' => $row['customer'],
            ]);
        }

        // Find or get machine model
        $model = MachineModel::where('code', $row['model'])->first();
        if (!$model) {
            $this->skippedRows[] = [
                'row' => $row,
                'reason' => "Machine model '{$row['model']}' not found.  Please create it first.",
            ];
            return null;
        }

        // Check if die already exists
        $existingDie = DieModel::where('part_number', $row['part_number'])->first();

        if ($existingDie) {
            // Update existing die (accumulation_stroke NOT imported — computed from production logs)
            $existingDie->update([
                'part_name' => $row['part_name'] ?? $existingDie->part_name,
                'machine_model_id' => $model->id,
                'customer_id' => $customer->id,
                'qty_die' => (int) ($row['total_die'] ?? $existingDie->qty_die),
                'line' => $row['line'] ?? $existingDie->line,
                'last_stroke' => (int) ($row['last_stroke'] ?? $existingDie->last_stroke),
                'control_stroke' => ! empty($row['control_stroke']) ? (int) $row['control_stroke'] : null,
                'last_ppm_date' => $this->parseDate($row['last_ppm_date'] ?? null),
                'location' => $row['location'] ??  $existingDie->location,
                'notes' => $row['notes'] ??  $existingDie->notes,
            ]);
            $this->updatedCount++;
            return null;
        }

        $this->importedCount++;

        // accumulation_stroke starts at 0 — computed from production logs only
        return new DieModel([
            'part_number' => $row['part_number'],
            'part_name' => $row['part_name'] ?? 'Unknown',
            'machine_model_id' => $model->id,
            'customer_id' => $customer->id,
            'qty_die' => (int) ($row['total_die'] ?? 1),
            'line' => $row['line'] ?? null,
            'accumulation_stroke' => 0,
            'last_stroke' => (int) ($row['last_stroke'] ?? 0),
            'control_stroke' => ! empty($row['control_stroke']) ? (int) $row['control_stroke'] : null,
            'last_ppm_date' => $this->parseDate($row['last_ppm_date'] ?? null),
            'location' => $row['location'] ?? null,
            'notes' => $row['notes'] ?? null,
            'status' => 'active',
        ]);
    }

    public function rules(): array
    {
        return [
            'part_number' => 'required|string',
            'model' => 'required|string',
            'customer' => 'required|string',
        ];
    }

    protected function parseDate($value): ?Carbon
    {
        if (empty($value)) {
            return null;
        }

        try {
            if (is_numeric($value)) {
                return Carbon::createFromTimestamp(($value - 25569) * 86400);
            }
            return Carbon::parse($value);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getUpdatedCount(): int
    {
        return $this->updatedCount;
    }

    public function getSkippedRows(): array
    {
        return $this->skippedRows;
    }
}
