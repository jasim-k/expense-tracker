<?php

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReminderDueNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly Reminder $reminder)
    {
        //
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Reminder: {$this->reminder->label} is due soon")
            ->line("{$this->reminder->label} is due on {$this->reminder->target_date->toFormattedDateString()}.")
            ->line("That's within your {$this->reminder->reminder_offset_days}-day reminder window.")
            ->action('View planner', url('/planner'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'reminder_id' => $this->reminder->id,
            'transaction_id' => $this->reminder->transaction_id,
            'label' => $this->reminder->label,
            'target_date' => $this->reminder->target_date->toDateString(),
            'reminder_offset_days' => $this->reminder->reminder_offset_days,
        ];
    }
}
