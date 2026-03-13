<?php

namespace App\Notifications;

use App\Models\DieModel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Generic notification for all PPM workflow status changes.
 *
 * Events covered:
 * - lot_date_set      → PPIC set last LOT date
 * - ppm_scheduled     → MTN Dies created PPM schedule
 * - schedule_approved → PPIC approved PPM schedule
 * - transferred_to_mtn → PROD transferred dies to MTN Dies
 * - ppm_in_progress   → MTN Dies started PPM processing
 * - additional_repair → MTN Dies flagged additional repair
 * - ppm_completed     → MTN Dies completed PPM (Red → Green)
 * - transferred_back  → PROD transferred dies back to production
 */
class PpmWorkflowNotification extends Notification
{
    use Queueable;

    protected DieModel $die;
    protected string $event;
    protected ?string $actor;
    protected array $extra;

    /**
     * @param DieModel $die
     * @param string   $event  One of the workflow event keys
     * @param string|null $actor  Name of the person who performed the action
     * @param array    $extra  Additional data (e.g. scheduled_date, last_lot_date)
     */
    public function __construct(DieModel $die, string $event, ?string $actor = null, array $extra = [])
    {
        $this->die = $die;
        $this->event = $event;
        $this->actor = $actor ?? auth()->user()?->name ?? 'System';
        $this->extra = $extra;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $config = $this->getEventConfig();
        $label = "{$this->die->part_number} ({$this->die->part_name})";

        $mail = (new MailMessage)
            ->subject("PPM Workflow: {$this->event} — {$this->die->part_number}")
            ->greeting("PPM Dies Workflow Update")
            ->line($config['message'])
            ->line("")
            ->line("**Part Number:** {$this->die->part_number}")
            ->line("**Part Name:** {$this->die->part_name}")
            ->line("**Customer:** " . ($this->die->customer?->code ?? '-'));

        if (in_array($this->event, ['lot_date_set']) && isset($this->extra['last_lot_date'])) {
            $mail->line("**Last LOT Date:** {$this->extra['last_lot_date']}");
        }
        if (in_array($this->event, ['ppm_scheduled']) && isset($this->extra['scheduled_date'])) {
            $mail->line("**Scheduled Date:** {$this->extra['scheduled_date']}");
        }

        $mail->action('View Die Details', url("/dies/{$this->die->encrypted_id}"))
            ->salutation('PPM Dies Monitoring System');

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        $config = $this->getEventConfig();

        return [
            'type' => $this->event,
            'die_id' => $this->die->encrypted_id,
            'part_number' => $this->die->part_number,
            'part_name' => $this->die->part_name,
            'customer' => $this->die->customer?->code,
            'actor' => $this->actor,
            'event' => $this->event,
            'message' => $config['message'],
            'icon' => $config['icon'],
            'color' => $config['color'],
        ];
    }

    protected function getEventConfig(): array
    {
        $pn = $this->die->part_number;
        $name = $this->die->part_name;
        $label = "{$pn} ({$name})";
        $actor = $this->actor;

        return match ($this->event) {
            'lot_date_set' => [
                'message' => "📅 PPIC set Last LOT Date for {$label}" .
                    (isset($this->extra['last_lot_date']) ? " — Date: {$this->extra['last_lot_date']}" : '') .
                    " by {$actor}",
                'icon' => 'fa-calendar-check',
                'color' => 'purple',
            ],
            'ppm_scheduled' => [
                'message' => "🗓️ MTN Dies created PPM Schedule for {$label}" .
                    (isset($this->extra['scheduled_date']) ? " — {$this->extra['scheduled_date']}" : '') .
                    " by {$actor}",
                'icon' => 'fa-calendar-alt',
                'color' => 'blue',
            ],
            'schedule_approved' => [
                'message' => "✅ PPIC approved PPM Schedule for {$label} by {$actor}",
                'icon' => 'fa-check-double',
                'color' => 'cyan',
            ],
            'transferred_to_mtn' => [
                'message' => "🚚 Dies transferred to MTN Dies: {$label} by {$actor}",
                'icon' => 'fa-truck',
                'color' => 'orange',
            ],
            'ppm_in_progress' => [
                'message' => "⚙️ PPM Processing started for {$label} by {$actor}",
                'icon' => 'fa-cogs',
                'color' => 'blue',
            ],
            'additional_repair' => [
                'message' => "🔧 Additional Repair needed for {$label} — flagged by {$actor}",
                'icon' => 'fa-wrench',
                'color' => 'orange',
            ],
            'ppm_completed' => [
                'message' => "✅ PPM Completed for {$label} — Status changed Red → Green by {$actor}",
                'icon' => 'fa-check-circle',
                'color' => 'green',
            ],
            'process_completed' => [
                'message' => "⚙️ Process " .
                    ($this->extra['process_type'] ?? '') . " completed for {$label}" .
                    (isset($this->extra['completed'], $this->extra['total']) ? " ({$this->extra['completed']}/{$this->extra['total']})" : '') .
                    " by {$actor}",
                'icon' => 'fa-check',
                'color' => 'blue',
            ],
            'process_started' => [
                'message' => "▶️ Process " .
                    ($this->extra['process_type'] ?? '') . " started for {$label} by {$actor}",
                'icon' => 'fa-play',
                'color' => 'blue',
            ],
            'transferred_back' => [
                'message' => "🏭 Dies transferred back to Production: {$label} by {$actor}",
                'icon' => 'fa-industry',
                'color' => 'green',
            ],
            default => [
                'message' => "ℹ️ PPM workflow update for {$label} by {$actor}",
                'icon' => 'fa-info-circle',
                'color' => 'blue',
            ],
        };
    }
}
