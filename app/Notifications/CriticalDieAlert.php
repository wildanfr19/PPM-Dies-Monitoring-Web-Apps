<?php

namespace App\Notifications;

use App\Models\DieModel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CriticalDieAlert extends Notification
{
    use Queueable;

    protected DieModel $die;
    protected ?string $forceAlertType;

    /**
     * Create a new notification instance.
     *
     * @param DieModel $die
     * @param string|null $forceAlertType Force alert type for testing ('orange' or 'red')
     */
    public function __construct(DieModel $die, ?string $forceAlertType = null)
    {
        $this->die = $die;
        $this->forceAlertType = $forceAlertType;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        // Use forced alert type if provided, otherwise use die's actual status
        $isRed = $this->forceAlertType
            ? $this->forceAlertType === 'red'
            : $this->die->ppm_status === 'red';
        $status = $isRed ? '🔴 RED ALERT - CRITICAL' : '🟠 ORANGE ALERT - WARNING';
        $percentage = $this->die->stroke_percentage;
        $subject = $isRed
            ? "🔴 RED ALERT: {$this->die->part_number} - Stroke Exceeded Limit!"
            : "🟠 ORANGE ALERT: {$this->die->part_number} - Approaching PPM Limit";

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting("PPM Dies Alert - {$status}")
            ->line("The following die requires immediate attention:");

        if ($isRed) {
            $message->line("")
                ->line("⚠️ **WARNING: STROKE HAS EXCEEDED THE STANDARD LIMIT!**")
                ->line("⚠️ **PERFORM PPM IMMEDIATELY TO PREVENT DIE DAMAGE!**")
                ->line("");
        }

        $message->line("**Part Number:** {$this->die->part_number}")
            ->line("**Part Name:** {$this->die->part_name}")
            ->line("**Customer:** {$this->die->customer?->code}")
            ->line("**Machine Model:** {$this->die->machineModel?->code}")
            ->line("")
            ->line("**Accumulation Stroke:** " . number_format($this->die->accumulation_stroke))
            ->line("**Standard Stroke (PPM):** " . number_format($this->die->standard_stroke))
            ->line("**Progress:** {$percentage}%")
            ->line("**Remaining Strokes:** " . number_format($this->die->remaining_strokes))
            ->line("**Remaining Lots:** {$this->die->remaining_lots}")
            ->line("")
            ->line("**Status:** {$status}");

        if ($isRed) {
            $message->line("")
                ->line("📋 **REQUIRED ACTIONS:**")
                ->line("1. MTN Dies: Schedule PPM immediately")
                ->line("2. Stop using the die if possible")
                ->line("3. Perform PPM Processing according to procedure")
                ->action('View Details & Process PPM', url("/dies/{$this->die->encrypted_id}"))
                ->line('⚠️ Ignoring this warning may cause die damage and high repair costs.');
        } else {
            $message->line("")
                ->line("📋 **RECOMMENDED ACTIONS:**")
                ->line("1. Plan PPM schedule in the near future")
                ->line("2. Prepare resources for maintenance")
                ->line("3. Monitor die usage")
                ->action('View Die Details', url("/dies/{$this->die->encrypted_id}"))
                ->line('Schedule PPM before reaching critical limit to prevent issues.');
        }

        return $message->salutation('PPM Dies Monitoring System');
    }

    public function toArray(object $notifiable): array
    {
        $isRed = $this->forceAlertType
            ? $this->forceAlertType === 'red'
            : $this->die->ppm_status === 'red';

        return [
            'type' => $isRed ? 'red_alert' : 'orange_alert',
            'die_id' => $this->die->encrypted_id,
            'part_number' => $this->die->part_number,
            'part_name' => $this->die->part_name,
            'customer' => $this->die->customer?->code,
            'status' => $isRed ? 'red' : 'orange',
            'accumulation_stroke' => $this->die->accumulation_stroke,
            'standard_stroke' => $this->die->standard_stroke,
            'stroke_percentage' => $this->die->stroke_percentage,
            'message' => $isRed
                ? "🔴 CRITICAL: {$this->die->part_number} ({$this->die->part_name}) exceeded stroke limit ({$this->die->stroke_percentage}%)"
                : "🟠 WARNING: {$this->die->part_number} ({$this->die->part_name}) approaching PPM limit ({$this->die->stroke_percentage}%)",
            'icon' => $isRed ? 'fa-exclamation-circle' : 'fa-exclamation-triangle',
            'color' => $isRed ? 'red' : 'orange',
        ];
    }
}
