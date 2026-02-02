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

        $this->info("Orange dies found: {$result['orange_count']}");
        $this->info("Red dies found: {$result['red_count']}");
        $this->info("Orange alerts sent: {$result['orange_alerts_sent']}");
        $this->info("Red alerts sent: {$result['red_alerts_sent']}");

        return Command::SUCCESS;
    }
}
