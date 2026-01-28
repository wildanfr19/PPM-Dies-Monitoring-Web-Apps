<?php

namespace Database\Seeders;

use App\Models\DieModel;
use App\Models\PpmSchedule;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ScheduleDataSeeder extends Seeder
{
    public function run(): void
    {
        $dies = DieModel::all();
        $year = 2025;

        foreach ($dies as $die) {
            // Generate forecast data for each month
            for ($month = 1; $month <= 12; $month++) {
                // Generate random forecast for week 1 of each month
                $forecast = rand(800, 2500);

                // Random plan week (some months)
                $planWeek = (rand(1, 10) > 6) ? rand(1, 4) : null;

                // Random actual for past months
                $isPast = Carbon::create($year, $month, 1)->isPast();
                $isDone = $isPast && rand(1, 10) > 5;

                PpmSchedule::create([
                    'die_id' => $die->id,
                    'year' => $year,
                    'month' => $month,
                    'week' => 1,
                    'forecast_stroke' => $forecast,
                    'plan_week' => $planWeek,
                    'is_done' => $isDone,
                    'actual_stroke' => $isDone ? rand(4000, 6000) : null,
                    'ppm_date' => $isDone ? Carbon::create($year, $month, rand(1, 7)) : null,
                    'pic' => $isDone ? ['Rydha RG', 'Mr. Kammee', 'Mr. Manop'][rand(0, 2)] : null,
                ]);

                // Add some data for other weeks occasionally
                if (rand(1, 10) > 7) {
                    $week = rand(2, 4);
                    PpmSchedule::create([
                        'die_id' => $die->id,
                        'year' => $year,
                        'month' => $month,
                        'week' => $week,
                        'forecast_stroke' => rand(500, 1500),
                        'plan_week' => null,
                        'is_done' => false,
                    ]);
                }
            }
        }
    }
}
