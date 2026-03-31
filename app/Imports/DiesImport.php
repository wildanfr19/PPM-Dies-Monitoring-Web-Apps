<?php

namespace App\Imports;

use App\Models\DieModel;
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
    protected array $skippedRows = [];
    protected array $successRows = [];
    protected int $currentRow = 1;

    public function model(array $row)
    {
        $this->currentRow++;

        // Skip if essential fields are empty (template rows with only "No" filled)
        if (empty($row['part_number']) || empty($row['model']) || empty($row['customer'])) {
            return null;
        }

        // Check if die already exists (duplicate)
        $existingDie = DieModel::where('part_number', $row['part_number'])->first();
        if ($existingDie) {
            $this->skippedRows[] = [
                'row_number' => $this->currentRow,
                'part_number' => $row['part_number'],
                'part_name' => $row['part_name'] ?? '-',
                'model' => $row['model'] ?? '-',
                'reason' => "Part number '{$row['part_number']}' already exists in Dies Master.",
            ];
            return null;
        }

        // Find or get customer
        $customer = Customer::where('code', $row['customer'])->first();
        if (!$customer) {
            $customer = Customer::create([
                'code' => $row['customer'],
                'name' => $row['customer'],
            ]);
        }

        // Find or get machine model
        $model = MachineModel::where('code', $row['model'])->first();
        if (!$model) {
            $this->skippedRows[] = [
                'row_number' => $this->currentRow,
                'part_number' => $row['part_number'] ?? '-',
                'part_name' => $row['part_name'] ?? '-',
                'model' => $row['model'] ?? '-',
                'reason' => "Machine model '{$row['model']}' not found. Please create it first.",
            ];
            return null;
        }

        $this->importedCount++;
        $this->successRows[] = [
            'row_number' => $this->currentRow,
            'part_number' => $row['part_number'],
            'part_name' => $row['part_name'] ?? 'Unknown',
            'model' => $row['model'] ?? '-',
            'customer' => $row['customer'] ?? '-',
        ];

        return new DieModel([
            'part_number' => $row['part_number'],
            'part_name' => $row['part_name'] ?? 'Unknown',
            'machine_model_id' => $model->id,
            'customer_id' => $customer->id,
            'qty_die' => (int) ($row['qty_dies'] ?? $row['total_die'] ?? 1),
            'line' => $row['line'] ?? null,
            'model' => $row['model'] ?? null,
            'lot_size' => (int) ($row['lot_size'] ?? 600),
            'accumulation_stroke' => 0,
            'last_stroke' => (int) ($row['last_stroke'] ?? 0),
            'ppm_standard' => (int) ($row['ppm_standard'] ?? 6000),
            'last_ppm_date' => $this->parseDate($row['last_ppm_dies'] ?? $row['last_ppm_date'] ?? null),
            'status' => 'active',
        ]);
    }

    public function rules(): array
    {
        return [
            'part_number' => 'nullable|string',
            'model' => 'nullable|string',
            'customer' => 'nullable|string',
            'line' => 'nullable|string',
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

    public function getSkippedRows(): array
    {
        return $this->skippedRows;
    }

    public function getSuccessRows(): array
    {
        return $this->successRows;
    }
}
