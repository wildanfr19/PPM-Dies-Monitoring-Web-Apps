<?php

namespace App\Imports;

use App\Models\DieModel;
use App\Models\PpmSchedule;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\Importable;
use Carbon\Carbon;

class PpmScheduleImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use Importable, SkipsFailures;

    protected $importedCount = 0;
    protected $updatedCount = 0;
    protected $skippedRows = [];
    protected $year;

    public function __construct($year = null)
    {
        $this->year = $year ?? date('Y');
    }

    public function model(array $row)
    {
        // Skip empty rows or header rows
        if (empty($row['part_number']) || $row['part_number'] === 'PART NUMBER') {
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

        // Process plan data for each month/week
        $plansCreated = 0;
        $plansUpdated = 0;

        // Map column names to month/week
        $monthWeekMap = $this->getMonthWeekMapping();

        foreach ($monthWeekMap as $columnPrefix => $data) {
            $planColumnName = 'plan_' . strtolower($columnPrefix);

            // Check if there's a plan value in this column
            if (isset($row[$planColumnName]) && !empty($row[$planColumnName]) && $row[$planColumnName] !== '-') {
                $weekNumber = (int) $row[$planColumnName];

                if ($weekNumber >= 1 && $weekNumber <= 4) {
                    // Calculate scheduled date based on month and week
                    $scheduledDate = $this->calculateScheduledDate(
                        $this->year,
                        $data['month'],
                        $weekNumber
                    );

                    // Check if schedule already exists
                    $existingSchedule = PpmSchedule::where('die_id', $die->id)
                        ->whereYear('scheduled_date', $this->year)
                        ->whereMonth('scheduled_date', $data['month'])
                        ->first();

                    if ($existingSchedule) {
                        $existingSchedule->update([
                            'scheduled_date' => $scheduledDate,
                            'week_number' => $weekNumber,
                            'updated_at' => now(),
                        ]);
                        $plansUpdated++;
                    } else {
                        PpmSchedule::create([
                            'die_id' => $die->id,
                            'scheduled_date' => $scheduledDate,
                            'week_number' => $weekNumber,
                            'status' => 'scheduled',
                            'created_by' => auth()->id(),
                        ]);
                        $plansCreated++;
                    }
                }
            }
        }

        if ($plansCreated > 0) {
            $this->importedCount += $plansCreated;
        }
        if ($plansUpdated > 0) {
            $this->updatedCount += $plansUpdated;
        }

        return null; // We handle the model creation ourselves
    }

    protected function getMonthWeekMapping()
    {
        $months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        $mapping = [];

        foreach ($months as $index => $month) {
            $mapping[$month] = [
                'month' => $index + 1,
            ];
        }

        return $mapping;
    }

    protected function calculateScheduledDate($year, $month, $week)
    {
        // Get first day of the month
        $date = Carbon::create($year, $month, 1);

        // Move to the appropriate week
        // Week 1: Day 1-7, Week 2: Day 8-14, etc.
        $day = (($week - 1) * 7) + 1;

        // Make sure we don't exceed the month
        $lastDay = $date->daysInMonth;
        if ($day > $lastDay) {
            $day = $lastDay;
        }

        return Carbon::create($year, $month, $day);
    }

    public function rules(): array
    {
        return [
            'part_number' => 'nullable|string',
        ];
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
