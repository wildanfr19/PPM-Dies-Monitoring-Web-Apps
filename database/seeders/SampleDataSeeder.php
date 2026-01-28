<?php

namespace Database\Seeders;

use App\Models\MachineModel;
use App\Models\DieModel;
use App\Models\ProductionLog;
use App\Models\PpmHistory;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create Machine Models
        $this->createMachineModels();

        // Create Dies
        $this->createDies();

        // Create Production Logs
        $this->createProductionLogs();

        // Create PPM History
        $this->createPpmHistory();
    }

    private function createMachineModels(): void
    {
        $models = [
            ['code' => 'KS', 'name' => 'KS Series (Grade B)', 'tonnage_standard_id' => 2],
            ['code' => '4L45W', 'name' => '4L45W Series', 'tonnage_standard_id' => 2],
            ['code' => '2SJ', 'name' => '2SJ Series', 'tonnage_standard_id' => 3],
            ['code' => '2SK', 'name' => '2SK Series', 'tonnage_standard_id' => 3],
            ['code' => 'T64', 'name' => 'T64 Series', 'tonnage_standard_id' => 3],
            ['code' => 'YHA', 'name' => 'YHA Series', 'tonnage_standard_id' => 4],
            ['code' => '2JX', 'name' => '2JX (LHD) Series', 'tonnage_standard_id' => 4],
            ['code' => '560B', 'name' => '560B Series', 'tonnage_standard_id' => 2],
        ];

        foreach ($models as $model) {
            MachineModel::create($model);
        }
    }

    private function createDies(): void
    {
        $dies = [
            // ==================== HMMI - 800T (Critical & Warning) ====================
            [
                'part_number' => '71142-I6000',
                'part_name' => 'REINF-FR PILLAR OTR LWR,RH',
                'machine_model_id' => 1, // KS
                'customer_id' => 1, // HMMI
                'qty_die' => 4,
                'line' => '800T',
                'accumulation_stroke' => 6500, // Over limit (6000) - CRITICAL
                'last_ppm_date' => Carbon::now()->subMonths(3),
            ],
            [
                'part_number' => '71132-I6000',
                'part_name' => 'REINF-FR PILLAR OTR LWR,LH',
                'machine_model_id' => 1,
                'customer_id' => 1,
                'qty_die' => 4,
                'line' => '800T',
                'accumulation_stroke' => 6200, // Over limit - CRITICAL
                'last_ppm_date' => Carbon::now()->subMonths(3),
            ],
            [
                'part_number' => '65122-I6000',
                'part_name' => 'PNL CTR FLOOR SIDE,RH',
                'machine_model_id' => 1,
                'customer_id' => 1,
                'qty_die' => 4,
                'line' => '800T',
                'accumulation_stroke' => 5116, // Warning (remaining < 1 lot)
                'last_ppm_date' => Carbon::now()->subMonths(2),
            ],
            [
                'part_number' => '65112-I6000',
                'part_name' => 'PNL CTR FLOOR SIDE,LH',
                'machine_model_id' => 1,
                'customer_id' => 1,
                'qty_die' => 4,
                'line' => '800T',
                'accumulation_stroke' => 5340, // Warning
                'last_ppm_date' => Carbon::now()->subMonths(2),
            ],
            [
                'part_number' => '63111-I6900',
                'part_name' => 'PNL CTR FLOOR SIDE LOWER,LH',
                'machine_model_id' => 1,
                'customer_id' => 1,
                'qty_die' => 4,
                'line' => '800T',
                'accumulation_stroke' => 4240, // OK but close
                'last_ppm_date' => Carbon::now()->subMonths(2),
            ],
            [
                'part_number' => '71176-I6000',
                'part_name' => 'BRKT FR PILLAR OTR,LH/RH',
                'machine_model_id' => 1,
                'customer_id' => 1,
                'qty_die' => 4,
                'line' => '800T',
                'accumulation_stroke' => 689, // OK - Low
                'last_ppm_date' => Carbon::now()->subMonths(1),
            ],
            [
                'part_number' => '71362-I6000',
                'part_name' => 'REINF CTR PLR OTR UPR,RH',
                'machine_model_id' => 1,
                'customer_id' => 1,
                'qty_die' => 4,
                'line' => '1200T',
                'accumulation_stroke' => 2500, // OK
                'last_ppm_date' => Carbon::now()->subMonths(1),
            ],
            [
                'part_number' => '71352-I6000',
                'part_name' => 'REINF CTR PLR OTR UPR,LH',
                'machine_model_id' => 1,
                'customer_id' => 1,
                'qty_die' => 4,
                'line' => '1200T',
                'accumulation_stroke' => 2100, // OK
                'last_ppm_date' => Carbon:: now()->subMonths(1),
            ],

            // ==================== ATS - 800T ====================
            [
                'part_number' => '5240B908/909',
                'part_name' => 'BRACE DASH SIDE RH',
                'machine_model_id' => 2, // 4L45W
                'customer_id' => 2, // ATS
                'qty_die' => 3,
                'line' => '800T',
                'accumulation_stroke' => 1800, // OK
                'last_ppm_date' => Carbon:: now()->subWeeks(3),
            ],
            [
                'part_number' => '5253AT11/AT12',
                'part_name' => 'REINF F/FLR SIDE SILL INR LH',
                'machine_model_id' => 2,
                'customer_id' => 2,
                'qty_die' => 4,
                'line' => '800T',
                'accumulation_stroke' => 3200, // OK
                'last_ppm_date' => Carbon:: now()->subWeeks(4),
            ],
            [
                'part_number' => '5253AH61',
                'part_name' => 'SILL F/FLR SIDE INR LH',
                'machine_model_id' => 2,
                'customer_id' => 2,
                'qty_die' => 4,
                'line' => '1200T',
                'accumulation_stroke' => 4800, // Warning for 1200T (std:  5000)
                'last_ppm_date' => Carbon::now()->subMonths(2),
            ],
            [
                'part_number' => '5253AH62',
                'part_name' => 'SILL F/FLR SIDE INR RH',
                'machine_model_id' => 2,
                'customer_id' => 2,
                'qty_die' => 4,
                'line' => '1200T',
                'accumulation_stroke' => 4650, // Warning
                'last_ppm_date' => Carbon::now()->subMonths(2),
            ],

            // ==================== UPIN - 250T ====================
            [
                'part_number' => '60415-TSEY-X000-H1',
                'part_name' => 'STIFF R, BHD SIDE MBR',
                'machine_model_id' => 3, // 2SJ
                'customer_id' => 3, // UPIN
                'qty_die' => 3,
                'line' => '250T',
                'accumulation_stroke' => 3500, // OK (std: 10000)
                'last_ppm_date' => Carbon::now()->subMonths(1),
            ],
            [
                'part_number' => '60842TG1T00050HM',
                'part_name' => 'BRKT, BPR BEAM EXTN OUT',
                'machine_model_id' => 3,
                'customer_id' => 3,
                'qty_die' => 3,
                'line' => '250T',
                'accumulation_stroke' => 8500, // Warning (std: 10000)
                'last_ppm_date' => Carbon::now()->subMonths(3),
            ],
            [
                'part_number' => '60843-TSEY-X100-H1',
                'part_name' => 'BRKT R, FR BPR EXTN',
                'machine_model_id' => 3,
                'customer_id' => 3,
                'qty_die' => 5,
                'line' => '250T',
                'accumulation_stroke' => 9800, // Critical (std: 10000)
                'last_ppm_date' => Carbon::now()->subMonths(4),
            ],
            [
                'part_number' => '60837-TSEY-X000-H1',
                'part_name' => 'BRKT R, FR SUB FRM FR',
                'machine_model_id' => 3,
                'customer_id' => 3,
                'qty_die' => 4,
                'line' => '250T',
                'accumulation_stroke' => 5200, // OK
                'last_ppm_date' => Carbon::now()->subMonths(2),
            ],
            [
                'part_number' => '60937-TSEY-X000-H1',
                'part_name' => 'BRKT L, FR SUB FRM FR',
                'machine_model_id' => 3,
                'customer_id' => 3,
                'qty_die' => 4,
                'line' => '250T',
                'accumulation_stroke' => 5100, // OK
                'last_ppm_date' => Carbon:: now()->subMonths(2),
            ],
            [
                'part_number' => '60934TSAK000H1',
                'part_name' => 'BHD RR L, FR SIDE FRM',
                'machine_model_id' => 4, // 2SK
                'customer_id' => 3,
                'qty_die' => 1,
                'line' => '250T',
                'accumulation_stroke' => 2300, // OK
                'last_ppm_date' => Carbon:: now()->subWeeks(2),
            ],

            // ==================== G-TIM - 250T ====================
            [
                'part_number' => '63212-TG2-K000',
                'part_name' => 'R RNFCT CTR PLR STIFF TG2',
                'machine_model_id' => 5, // T64
                'customer_id' => 4, // G-TIM
                'qty_die' => 3,
                'line' => '250T',
                'accumulation_stroke' => 4500, // OK
                'last_ppm_date' => Carbon:: now()->subMonths(1),
            ],
            [
                'part_number' => '63612-TG2-K000',
                'part_name' => 'L RNFCT CTR PLR STIFF TG2',
                'machine_model_id' => 5,
                'customer_id' => 4,
                'qty_die' => 3,
                'line' => '250T',
                'accumulation_stroke' => 4200, // OK
                'last_ppm_date' => Carbon::now()->subMonths(1),
            ],
            [
                'part_number' => '65318-T86-P000-H1',
                'part_name' => 'STIFF L, FRM CTR TNL',
                'machine_model_id' => 6, // YHA
                'customer_id' => 4,
                'qty_die' => 1,
                'line' => '250T',
                'accumulation_stroke' => 6800, // Warning (std: 7000 for Tandem)
                'last_ppm_date' => Carbon::now()->subMonths(2),
            ],

            // ==================== SIM - 800T ====================
            [
                'part_number' => '64113-72S00',
                'part_name' => 'REINF ROOF RAIL FR R',
                'machine_model_id' => 6,
                'customer_id' => 5, // SIM
                'qty_die' => 2,
                'line' => '250T',
                'accumulation_stroke' => 3200, // OK
                'last_ppm_date' => Carbon::now()->subWeeks(3),
            ],
            [
                'part_number' => '64514/114-72S00',
                'part_name' => 'REINF ROOF RAIL CTR L',
                'machine_model_id' => 6,
                'customer_id' => 5,
                'qty_die' => 1,
                'line' => '250T',
                'accumulation_stroke' => 2800, // OK
                'last_ppm_date' => Carbon::now()->subWeeks(2),
            ],

            // ==================== TMMIN - 800T ====================
            [
                'part_number' => 'T/O 77697-VT010-00',
                'part_name' => 'INSULATOR, FUEL TANK HEAT NO.  1',
                'machine_model_id' => 8, // 560B
                'customer_id' => 6, // TMMIN
                'qty_die' => 1,
                'line' => '800T',
                'accumulation_stroke' => 1500, // OK
                'last_ppm_date' => Carbon:: now()->subWeeks(1),
            ],
            [
                'part_number' => '67412 W000P',
                'part_name' => 'C/ MBR DASH',
                'machine_model_id' => 2,
                'customer_id' => 6,
                'qty_die' => 4,
                'line' => '1200T',
                'accumulation_stroke' => 3800, // OK
                'last_ppm_date' => Carbon:: now()->subMonths(1),
            ],
        ];

        foreach ($dies as $die) {
            DieModel::create($die);
        }
    }

    private function createProductionLogs(): void
    {
        $dies = DieModel::all();

        foreach ($dies as $die) {
            // Generate production logs for last 30 days
            $numDays = rand(15, 30);

            for ($i = 0; $i < $numDays; $i++) {
                $date = Carbon::now()->subDays(rand(1, 60));
                $shift = rand(1, 3);

                // Random output between 200-1000
                $output = rand(200, 800);

                // Random times
                $startHour = $shift === 1 ? rand(6, 8) : ($shift === 2 ? rand(14, 16) : rand(22, 23));
                $duration = rand(4, 8);

                ProductionLog::create([
                    'die_id' => $die->id,
                    'production_date' => $date->format('Y-m-d'),
                    'shift' => $shift,
                    'line' => $die->line,
                    'running_process' => rand(0, 10) > 2 ? 'Auto' : 'Manual',
                    'start_time' => sprintf('%02d:00', $startHour),
                    'finish_time' => sprintf('%02d:00', ($startHour + $duration) % 24),
                    'total_hours' => $duration,
                    'total_minutes' => $duration * 60,
                    'break_time' => rand(0, 3) > 0 ? rand(10, 30) : 0,
                    'output_qty' => $output,
                    'month' => $date->format('M'),
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
        }
    }

    private function createPpmHistory(): void
    {
        $dies = DieModel::whereNotNull('last_ppm_date')->get();

        $pics = ['Rydha RG', 'Mr. Kammee', 'Mr. Manop', 'Budi Santoso', 'Ahmad Yani'];
        $checkers = ['Mr. Kammee', 'Mr. Manop', 'Supervisor A'];
        $approvers = ['Mr. Manop', 'Manager B', 'Dept Head'];

        $workPerformed = [
            'Routine cleaning and inspection',
            'Full service and lubrication',
            'Replaced worn components',
            'Adjusted alignment and clearance',
            'Deep cleaning and rust prevention',
            'Spring replacement and adjustment',
            'Die surface polishing',
            'Punch and die inspection',
        ];

        $findings = [
            'Normal wear condition',
            'Minor scratches on die surface',
            'Spring tension needs adjustment',
            'Some rust spots found - treated',
            'Punch showing wear - monitoring',
            'All components in good condition',
            'Minor alignment issue - corrected',
            null,
        ];

        foreach ($dies as $die) {
            // Create 1-3 PPM history records per die
            $numRecords = rand(1, 3);

            for ($i = 0; $i < $numRecords; $i++) {
                $ppmDate = Carbon::parse($die->last_ppm_date)->subMonths($i * 2);

                if ($ppmDate->lt(Carbon::now()->subYear())) {
                    continue; // Skip if more than 1 year ago
                }

                PpmHistory::create([
                    'die_id' => $die->id,
                    'ppm_date' => $ppmDate,
                    'stroke_at_ppm' => rand(4000, 6000),
                    'pic' => $pics[array_rand($pics)],
                    'status' => 'done',
                    'maintenance_type' => $i === 0 ? 'routine' : ['routine', 'repair', 'overhaul'][array_rand(['routine', 'repair', 'overhaul'])],
                    'work_performed' => $workPerformed[array_rand($workPerformed)],
                    'parts_replaced' => rand(0, 3) > 1 ? 'Spring set, Guide pins' : null,
                    'findings' => $findings[array_rand($findings)],
                    'recommendations' => rand(0, 2) > 0 ? 'Continue regular monitoring' : 'Schedule overhaul in next PPM',
                    'checked_by' => $checkers[array_rand($checkers)],
                    'approved_by' => $approvers[array_rand($approvers)],
                    'created_at' => $ppmDate,
                    'updated_at' => $ppmDate,
                ]);
            }
        }
    }
}
