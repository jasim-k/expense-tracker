<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Carbon\CarbonImmutable;

class ReminderSynchronizer
{
    /**
     * Sync the transaction's reminders against its category's date custom fields that request a reminder.
     *
     * Per-transaction overrides (sent by the logger form, keyed by custom field key) win over the
     * category-level defaults, so a user can enable, disable, or re-time a reminder for one entry.
     *
     * @param  array<string, array{enabled?: bool, offset_days?: int}>  $overrides
     */
    public function sync(Transaction $transaction, array $overrides = []): void
    {
        /** @var Category $category */
        $category = $transaction->category ?? $transaction->category()->firstOrFail();

        /** @var array<int, array{name: string, key?: string, type: string, reminder?: bool, reminder_offset?: int}> $definitions */
        $definitions = $category->custom_field_definitions ?? [];
        $metadata = $transaction->dynamic_metadata ?? [];

        $activeKeys = [];

        foreach ($definitions as $definition) {
            if (($definition['type'] ?? null) !== 'date') {
                continue;
            }

            $key = Category::fieldKey($definition);
            $override = $overrides[$key] ?? [];

            if (! (bool) ($override['enabled'] ?? $definition['reminder'] ?? false)) {
                continue;
            }

            if (! array_key_exists($key, $metadata) || empty($metadata[$key])) {
                continue;
            }

            $value = $metadata[$key];

            if (! $this->isParseableDate($value)) {
                continue;
            }

            $activeKeys[] = $key;

            $transaction->reminders()->updateOrCreate(
                ['trigger_field_key' => $key],
                [
                    'user_id' => $transaction->user_id,
                    'label' => $definition['name'],
                    'target_date' => Carbon::parse($value)->toDateString(),
                    'reminder_offset_days' => (int) ($override['offset_days'] ?? $definition['reminder_offset'] ?? 7),
                ]
            );
        }

        $query = $transaction->reminders();

        if ($activeKeys !== []) {
            $query->whereNotIn('trigger_field_key', $activeKeys);
        }

        $query->delete();
    }

    private function isParseableDate(mixed $value): bool
    {
        if (! is_string($value) || $value === '') {
            return false;
        }

        try {
            CarbonImmutable::parse($value);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
