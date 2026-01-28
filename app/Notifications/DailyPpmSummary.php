<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class DailyPpmSummary extends Notification implements ShouldQueue
{
    use Queueable;

    protected array $stats;
    protected Collection $criticalDies;

    public function __construct(array $stats, Collection $criticalDies)
    {
        $this->stats = $stats;
        $this->criticalDies = $criticalDies;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject("📊 Daily PPM Summary - " . now()->format('d M Y'))
            ->greeting("Good Morning!")
            ->line("Here is your daily PPM Dies summary:");

        // Stats
        $message->line("")
            ->line("**📈 Overall Status:**")
            ->line("- Total Dies: {$this->stats['total']}")
            ->line("- ✅ OK:  {$this->stats['ok']}")
            ->line("- ⚠️ Warning: {$this->stats['warning']}")
            ->line("- 🔴 Critical: {$this->stats['critical']}");

        // Critical Dies List
        if ($this->criticalDies->count() > 0) {
            $message->line("")
                ->line("**🚨 Dies Requiring Attention:**");

            foreach ($this->criticalDies->take(10) as $die) {
                $message->line("- {$die->part_number} ({$die->customer?->code}) - {$die->stroke_percentage}%");
            }

            if ($this->criticalDies->count() > 10) {
                $message->line("...  and " . ($this->criticalDies->count() - 10) . " more");
            }
        }

        return $message
            ->action('View Dashboard', url('/dashboard'))
            ->line('Have a productive day!')
            ->salutation('PPM Dies Monitoring System');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'stats' => $this->stats,
            'critical_count' => $this->criticalDies->count(),
        ];
    }
}
