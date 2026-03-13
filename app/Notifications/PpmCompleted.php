<?php

namespace App\Notifications;

use App\Models\DieModel;
use App\Models\PpmHistory;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PpmCompleted extends Notification
{
    use Queueable;

    protected DieModel $die;
    protected PpmHistory $ppmHistory;

    public function __construct(DieModel $die, PpmHistory $ppmHistory)
    {
        $this->die = $die;
        $this->ppmHistory = $ppmHistory;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("✅ PPM Completed: {$this->die->part_number}")
            ->greeting("PPM Notification")
            ->line("PPM has been completed for the following die:")
            ->line("")
            ->line("**Part Number:** {$this->die->part_number}")
            ->line("**Part Name:** {$this->die->part_name}")
            ->line("**Customer:** {$this->die->customer?->code}")
            ->line("")
            ->line("**PPM Details:**")
            ->line("- Date: " . $this->ppmHistory->ppm_date->format('d M Y'))
            ->line("- PIC: {$this->ppmHistory->pic}")
            ->line("- Type: " . ucfirst($this->ppmHistory->maintenance_type))
            ->line("- Stroke Before Reset: " . number_format($this->ppmHistory->stroke_at_ppm))
            ->line("")
            ->line("Stroke counter has been reset to 0.")
            ->action('View Die Details', url("/dies/{$this->die->encrypted_id}"))
            ->salutation('PPM Dies Monitoring System');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'ppm_completed',
            'die_id' => $this->die->encrypted_id,
            'part_number' => $this->die->part_number,
            'part_name' => $this->die->part_name,
            'customer' => $this->die->customer?->code,
            'ppm_date' => $this->ppmHistory->ppm_date->format('d M Y'),
            'pic' => $this->ppmHistory->pic,
            'maintenance_type' => $this->ppmHistory->maintenance_type,
            'stroke_at_ppm' => $this->ppmHistory->stroke_at_ppm,
            'message' => "✅ PPM completed for {$this->die->part_number} ({$this->die->part_name}) by {$this->ppmHistory->pic}",
            'icon' => 'fa-check-circle',
            'color' => 'green',
        ];
    }
}
