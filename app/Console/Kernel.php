<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Check for critical dies every 4 hours
        $schedule->command('ppm:check-alerts')
            ->everyFourHours()
            ->withoutOverlapping();

        // Send daily summary at 7 AM
        $schedule->command('ppm:daily-summary')
            ->dailyAt('07:00')
            ->withoutOverlapping();
    }

    protected function commands(): void
    {
        $this->load(__DIR__. '/Commands');

        require base_path('routes/console.php');
    }
}
