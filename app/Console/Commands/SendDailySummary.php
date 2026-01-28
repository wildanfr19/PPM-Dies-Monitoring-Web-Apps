<?php

namespace App\Console\Commands;

use App\Services\AlertService;
use Illuminate\Console\Command;

class SendDailySummary extends Command
{
    protected $signature = 'ppm:daily-summary';
    protected $description = 'Send daily PPM summary email';

    public function handle(AlertService $alertService): int
    {
        $this->info('Sending daily PPM summary.. .');

        $alertService->sendDailySummary();

        $this->info('Daily summary sent successfully!');

        return Command::SUCCESS;
    }
}
