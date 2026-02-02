<?php

namespace App\Console\Commands;

use App\Models\DieModel;
use App\Models\User;
use App\Notifications\CriticalDieAlert;
use Illuminate\Console\Command;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;

class TestAlertEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alert:test
                            {--type=orange : Alert type (orange or red)}
                            {--email= : Send to specific email instead of role-based}
                            {--die= : Die ID to use for testing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test sending PPM alert email notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $type = $this->option('type');
        $email = $this->option('email');
        $dieId = $this->option('die');

        // Validate type
        if (!in_array($type, ['orange', 'red'])) {
            $this->error('Invalid alert type. Use --type=orange or --type=red');
            return 1;
        }

        // Get or create test die
        if ($dieId) {
            $die = DieModel::find($dieId);
            if (!$die) {
                $this->error("Die with ID {$dieId} not found.");
                return 1;
            }
        } else {
            // Use first die or create dummy
            $die = DieModel::first();
            if (!$die) {
                $this->error('No dies found in database. Please create a die first or specify --die=ID');
                return 1;
            }
        }

        // Load relations
        $die->load(['customer', 'machineModel']);

        $this->info("Testing {$type} alert for die: {$die->part_number}");
        $this->newLine();

        // Show die info
        $this->table(
            ['Field', 'Value'],
            [
                ['Part Number', $die->part_number],
                ['Part Name', $die->part_name],
                ['Accumulation Stroke', number_format($die->accumulation_stroke ?? 0)],
                ['Standard Stroke', number_format($die->standard_stroke)],
                ['Usage %', round((($die->accumulation_stroke ?? 0) / $die->standard_stroke) * 100, 1) . '%'],
            ]
        );
        $this->newLine();

        // Determine recipients
        if ($email) {
            // Send to specific email using on-demand notification
            $this->info("Sending to: {$email}");

            try {
                Notification::route('mail', $email)
                    ->notify(new CriticalDieAlert($die, $type));

                $this->info("✅ {$type} alert sent successfully to {$email}");
            } catch (\Exception $e) {
                $this->error("❌ Failed to send: " . $e->getMessage());
                return 1;
            }
        } else {
            // Send to role-based recipients
            $recipients = $this->getRecipients($type);

            if ($recipients->isEmpty()) {
                $this->warn("No recipients found for {$type} alert.");
                $this->info("Create users with roles: " . ($type === 'orange' ? 'mgr_gm, md' : 'mgr_gm, md, mtn_dies'));
                return 1;
            }

            $this->info("Recipients for {$type} alert:");
            $this->table(
                ['Name', 'Email', 'Role'],
                $recipients->map(fn($u) => [$u->name, $u->email, $u->role])->toArray()
            );
            $this->newLine();

            if (!$this->confirm('Send alert to these recipients?', true)) {
                $this->info('Cancelled.');
                return 0;
            }

            try {
                Notification::send($recipients, new CriticalDieAlert($die, $type));
                $this->info("✅ {$type} alert sent successfully to " . $recipients->count() . " recipient(s)");
            } catch (\Exception $e) {
                $this->error("❌ Failed to send: " . $e->getMessage());
                return 1;
            }
        }

        $this->newLine();
        $this->info('📧 Check email inbox (and spam folder) for the alert notification.');

        return 0;
    }

    protected function getRecipients($type)
    {
        if ($type === 'orange') {
            return User::where(function($query) {
                $query->where('role', User::ROLE_MGR_GM)
                      ->orWhere('role', User::ROLE_MD);
            })->get();
        } else {
            return User::where(function($query) {
                $query->where('role', User::ROLE_MGR_GM)
                      ->orWhere('role', User::ROLE_MD)
                      ->orWhere('role', User::ROLE_MTN_DIES);
            })->get();
        }
    }
}
