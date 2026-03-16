<?php

namespace Database\Seeders;

use App\Models\DieModel;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DiesUpdateSeeder extends Seeder
{
    public function run(): void
    {
        $files = glob(database_path('seeders/dies_data_*.php'));
        $totalUpdated = 0;
        $totalCreated = 0;
        $notFound = [];

        foreach ($files as $file) {
            $data = require $file;
            foreach ($data as $row) {
                // If customer is provided in array, attach it, else ignore or set default
                $customer = $row['customer'] ?? null;
                $customerId = null;
                if ($customer) {
                    $cust = \App\Models\Customer::where('code', $customer)->orWhere('name', $customer)->first();
                    $customerId = $cust ? $cust->id : null;
                }

                if (!$customerId) {
                    $fallbackCust = \App\Models\Customer::first();
                    $customerId = $fallbackCust ? $fallbackCust->id : 1;
                }

                $machineId = 1;
                $fallbackMachine = \App\Models\MachineModel::where('name', $row['line'])->first();
                if ($fallbackMachine) {
                    $machineId = $fallbackMachine->id;
                } else {
                    $fallbackMachine = \App\Models\MachineModel::first();
                    if ($fallbackMachine) {
                        $machineId = $fallbackMachine->id;
                    }
                }

                $die = DieModel::where('part_number', $row['part_number'])->first();
                if ($die) {
                    $updateData = [
                        'part_name' => $row['part_name'],
                        'qty_die' => $row['qty_die'],
                        'line' => $row['line'],
                        'machine_model_id' => $machineId,
                        'model' => $row['model'],
                        'lot_size' => $row['lot_size'],
                        'last_ppm_date' => Carbon::parse($row['last_ppm_date']),
                        'last_stroke' => $row['last_stroke'],
                        'ppm_standard' => $row['ppm_standard'],
                    ];
                    if ($customerId) {
                        $updateData['customer_id'] = $customerId;
                    }
                    $die->update($updateData);
                    $totalUpdated++;
                } else {
                    DieModel::create([
                        'part_number' => $row['part_number'],
                        'part_name' => $row['part_name'],
                        'qty_die' => $row['qty_die'],
                        'line' => $row['line'],
                        'machine_model_id' => $machineId,
                        'model' => $row['model'],
                        'customer_id' => $customerId,
                        'lot_size' => $row['lot_size'],
                        'last_ppm_date' => Carbon::parse($row['last_ppm_date']),
                        'last_stroke' => $row['last_stroke'],
                        'ppm_standard' => $row['ppm_standard'],
                    ]);
                    $totalCreated++;
                }
            }
        }

        $this->command->info("Updated: {$totalUpdated}");
        $this->command->info("Created: {$totalCreated}");
        if (count($notFound) > 0) {
            $this->command->warn("Not found: " . implode(', ', $notFound));
        }
    }
}
