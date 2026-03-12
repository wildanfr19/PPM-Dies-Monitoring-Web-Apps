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
                // Orange Alert -> MTN DIES, MGR/GM, MD, PPIC, PROD
                $recipients = $this->getOrangeAlertRecipients();
                Notification::send($recipients, new CriticalDieAlert($die));
                cache()->put($cacheKey, true, now()->endOfDay());
                $orangeAlertsSent++;

                // Update ppm_alert_status to orange_alerted (only if not already further in the flow)
                $advancedStatuses = [
                    'orange_alerted', 'lot_date_set', 'ppm_scheduled', 'schedule_approved',
                    'red_alerted', 'transferred_to_mtn', 'ppm_in_progress',
                    'additional_repair', 'ppm_completed',
                ];
                if (!in_array($die->ppm_alert_status, $advancedStatuses)) {
                    $die->update([
                        'ppm_alert_status' => 'orange_alerted',
                    ]);
                }
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

                // Mark die as needing PPM processing and record timestamp for timeline
                // Jangan downgrade status yang sudah lebih maju
                if (!in_array($die->ppm_alert_status, ['red_alerted', 'transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'])) {
                    $die->update([
                        'ppm_alert_status' => 'red_alerted',
                        'red_alerted_at' => now(),
                    ]);
                }
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
     * Get users who should receive Orange alerts
     * Per flowchart: MTN DIES, MGR/GM, MD, PPIC, PROD
     */
    protected function getOrangeAlertRecipients()
    {
        return User::where('is_active', true)
            ->whereIn('role', [
                User::ROLE_ADMIN,
                User::ROLE_MTN_DIES,
                User::ROLE_MGR_GM,
                User::ROLE_MD,
                User::ROLE_PPIC,
                User::ROLE_PRODUCTION,
            ])
            ->get();
    }

    /**
     * Get users who should receive Red alerts
     * Per flowchart: MTN DIES, MGR/GM, MD, PPIC, PROD
     */
    protected function getRedAlertRecipients()
    {
        return User::where('is_active', true)
            ->whereIn('role', [
                User::ROLE_ADMIN,
                User::ROLE_MTN_DIES,
                User::ROLE_MGR_GM,
                User::ROLE_MD,
                User::ROLE_PPIC,
                User::ROLE_PRODUCTION,
            ])
            ->get();
    }

    /**
     * Get all users who should receive alerts (daily summary)
     */
    protected function getAlertRecipients()
    {
        return User::where('is_active', true)
            ->whereIn('role', [
                User::ROLE_ADMIN,
                User::ROLE_MTN_DIES,
                User::ROLE_MGR_GM,
                User::ROLE_MD,
                User::ROLE_PPIC,
                User::ROLE_PRODUCTION,
            ])
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
