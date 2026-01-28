<?php

namespace App\Notifications;

use App\Models\DieModel;;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CriticalDieAlert extends Notification implements ShouldQueue
{
    use Queueable;

    protected DieModel $die;

    public function __construct(DieModel $die)
    {
        $this->die = $die;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $status = $this->die->ppm_status === 'red' ? '🔴 CRITICAL' :  '🟠 WARNING';
        $percentage = $this->die->stroke_percentage;

        return (new MailMessage)
            ->subject("⚠️ PPM Alert: {$this->die->part_number} - {$status}")
            ->greeting("PPM Dies Alert!")
            ->line("A die requires immediate attention:")
            ->line("")
            ->line("**Part Number:** {$this->die->part_number}")
            ->line("**Part Name:** {$this->die->part_name}")
            ->line("**Customer:** {$this->die->customer?->code}")
            ->line("**Model:** {$this->die->machineModel?->code}")
            ->line("")
            ->line("**Accumulation Stroke:** " . number_format($this->die->accumulation_stroke))
            ->line("**Standard Stroke:** " . number_format($this->die->standard_stroke))
            ->line("**Progress:** {$percentage}%")
            ->line("**Remaining Strokes:** " . number_format($this->die->remaining_strokes))
            ->line("")
            ->line("**Status:** {$status}")
            ->action('View Die Details', url("/dies/{$this->die->id}"))
            ->line('Please schedule PPM immediately to prevent die damage.')
            ->salutation('PPM Dies Monitoring System');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'die_id' => $this->die->id,
            'part_number' => $this->die->part_number,
            'status' => $this->die->ppm_status,
        ];
    }
}
