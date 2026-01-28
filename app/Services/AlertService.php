<?php

namespace App\Services;

use App\Models\DieModel;
use App\Models\User;
use App\Notifications\CriticalDieAlert;
use App\Notifications\DailyPpmSummary;
use Illuminate\Support\Facades\Notification;

class AlertService
{
    protected DieMonitoringService $monitoringService;

    public function __construct(DieMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }

    /**
     * Check all dies and send alerts for critical ones
     */
    public function checkAndSendAlerts(): array
    {
        $alertsSent = 0;
        $recipients = $this->getAlertRecipients();

        $criticalDies = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->get()
            ->filter(fn($die) => $die->ppm_status === 'red');

        foreach ($criticalDies as $die) {
            // Check if alert was already sent today
            $cacheKey = "ppm_alert_{$die->id}_" . now()->format('Y-m-d');

            if (! cache()->has($cacheKey)) {
                Notification::send($recipients, new CriticalDieAlert($die));
                cache()->put($cacheKey, true, now()->endOfDay());
                $alertsSent++;
            }
        }

        return [
            'critical_count' => $criticalDies->count(),
            'alerts_sent' => $alertsSent,
        ];
    }

    /**
     * Send daily summary email
     */
    public function sendDailySummary(): void
    {
        $stats = $this->monitoringService->getDashboardStats();

        $criticalDies = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->get()
            ->filter(fn($die) => in_array($die->ppm_status, ['red', 'orange']))
            ->sortBy('remaining_strokes');

        $recipients = $this->getAlertRecipients();

        Notification::send($recipients, new DailyPpmSummary($stats, $criticalDies));
    }

    /**
     * Get users who should receive alerts
     */
    protected function getAlertRecipients()
    {
        // Get all users or specific roles
        return User::all();
    }

    /**
     * Send instant alert for specific die
     */
    public function sendInstantAlert(DieModel $die): void
    {
        if (in_array($die->ppm_status, ['red', 'orange'])) {
            $recipients = $this->getAlertRecipients();
            Notification:: send($recipients, new CriticalDieAlert($die));
        }
    }
}
