<?php

namespace App\Console\Commands;

use App\Models\Reminder;
use App\Notifications\ReminderDueNotification;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

#[Signature('reminders:send')]
#[Description('Send notifications for reminders that are due within their offset window')]
class SendReminders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $reminders = Reminder::query()
            ->where('is_completed', false)
            ->where(fn ($query) => $query->whereNull('last_notified_at')->orWhere('last_notified_at', '<=', Carbon::now()->subDay()))
            ->with(['user', 'transaction.category'])
            ->get()
            ->filter(fn (Reminder $reminder) => Carbon::today()->diffInDays($reminder->target_date, false) <= $reminder->reminder_offset_days);

        foreach ($reminders as $reminder) {
            $reminder->user->notify(new ReminderDueNotification($reminder));
            $reminder->update(['last_notified_at' => Carbon::now()]);
        }

        $this->info("Sent {$reminders->count()} reminder notification(s).");

        return self::SUCCESS;
    }
}
