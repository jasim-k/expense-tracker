<?php

namespace App\Services;

use App\Models\Reminder;
use Carbon\Carbon;

class ReminderPresenter
{
    /**
     * Serialize a reminder into the shared AlertItem shape used across the dashboard, planner, and reminders pages.
     *
     * @return array<string, mixed>
     */
    public static function toAlertItem(Reminder $reminder): array
    {
        $daysRemaining = (int) Carbon::today()->diffInDays($reminder->target_date, false);

        return [
            'id' => $reminder->id,
            'transaction_id' => $reminder->transaction_id,
            'label' => $reminder->label ?? $reminder->trigger_field_key,
            'icon_emoji' => $reminder->transaction->category->icon_emoji ?? '🔔',
            'category' => $reminder->transaction->category->name ?? '',
            'target_date' => $reminder->target_date->toDateString(),
            'days_remaining' => $daysRemaining,
            'severity' => self::severity($daysRemaining),
            'is_completed' => $reminder->is_completed,
            'reminder_offset_days' => $reminder->reminder_offset_days,
        ];
    }

    /**
     * critical < 30 days, warning 30-180 days, ok > 180 days.
     */
    public static function severity(int $daysRemaining): string
    {
        return match (true) {
            $daysRemaining < 30 => 'critical',
            $daysRemaining <= 180 => 'warning',
            default => 'ok',
        };
    }
}
