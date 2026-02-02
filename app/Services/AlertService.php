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
     * Check all dies and send alerts based on status
     * Orange Alert -> MGR/GM, MD
     * Red Alert -> MGR/GM, MD, MTN Dies (for PPM Processing)
     */
    public function checkAndSendAlerts(): array
    {
        $orangeAlertsSent = 0;
        $redAlertsSent = 0;

        $dies = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->get();

        // Get Orange Alert Dies (Warning)
        $orangeDies = $dies->filter(fn($die) => $die->ppm_status === 'orange');
        foreach ($orangeDies as $die) {
            $cacheKey = "ppm_orange_alert_{$die->id}_" . now()->format('Y-m-d');

            if (!cache()->has($cacheKey)) {
                // Orange Alert -> MGR/GM, MD only
                $recipients = $this->getOrangeAlertRecipients();
                Notification::send($recipients, new CriticalDieAlert($die));
                cache()->put($cacheKey, true, now()->endOfDay());
                $orangeAlertsSent++;
            }
        }

        // Get Red Alert Dies (Critical - Need PPM Now)
        $redDies = $dies->filter(fn($die) => $die->ppm_status === 'red');
        foreach ($redDies as $die) {
            $cacheKey = "ppm_red_alert_{$die->id}_" . now()->format('Y-m-d');

            if (!cache()->has($cacheKey)) {
                // Red Alert -> MGR/GM, MD + MTN Dies for PPM Processing
                $recipients = $this->getRedAlertRecipients();
                Notification::send($recipients, new CriticalDieAlert($die));
                cache()->put($cacheKey, true, now()->endOfDay());
                $redAlertsSent++;

                // Mark die as needing PPM processing
                $die->update(['ppm_alert_status' => 'red_alerted']);
            }
        }

        return [
            'orange_count' => $orangeDies->count(),
            'red_count' => $redDies->count(),
            'orange_alerts_sent' => $orangeAlertsSent,
            'red_alerts_sent' => $redAlertsSent,
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

        // Send to all alert recipients (MGR/GM, MD, Admin)
        $recipients = $this->getAlertRecipients();

        Notification::send($recipients, new DailyPpmSummary($stats, $criticalDies));
    }

    /**
     * Get users who should receive Orange alerts (MGR/GM, MD, Admin)
     */
    protected function getOrangeAlertRecipients()
    {
        return User::where('is_active', true)
            ->whereIn('role', [User::ROLE_ADMIN, User::ROLE_MGR_GM, User::ROLE_MD])
            ->get();
    }

    /**
     * Get users who should receive Red alerts (MGR/GM, MD, Admin, MTN Dies)
     */
    protected function getRedAlertRecipients()
    {
        return User::where('is_active', true)
            ->whereIn('role', [User::ROLE_ADMIN, User::ROLE_MGR_GM, User::ROLE_MD, User::ROLE_MTN_DIES])
            ->get();
    }

    /**
     * Get all users who should receive alerts
     */
    protected function getAlertRecipients()
    {
        return User::where('is_active', true)
            ->where(function ($q) {
                $q->whereIn('role', [User::ROLE_ADMIN, User::ROLE_MGR_GM, User::ROLE_MD]);
            })
            ->get();
    }

    /**
     * Send instant alert for specific die based on status
     */
    public function sendInstantAlert(DieModel $die): void
    {
        if ($die->ppm_status === 'orange') {
            $recipients = $this->getOrangeAlertRecipients();
            Notification::send($recipients, new CriticalDieAlert($die));
        } elseif ($die->ppm_status === 'red') {
            $recipients = $this->getRedAlertRecipients();
            Notification::send($recipients, new CriticalDieAlert($die));
        }
    }
}
