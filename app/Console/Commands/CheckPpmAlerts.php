<?php

namespace App\Console\Commands;

use App\Services\AlertService;
use Illuminate\Console\Command;

class CheckPpmAlerts extends Command
{
    protected $signature = 'ppm:check-alerts';
    protected $description = 'Check for critical dies and send email alerts';

    public function handle(AlertService $alertService): int
    {
        $this->info('Checking for critical dies...');

        $result = $alertService->checkAndSendAlerts();

        $this->info("Critical dies found: {$result['critical_count']}");
        $this->info("Alerts sent: {$result['alerts_sent']}");

        return Command::SUCCESS;
    }
}
