<?php

namespace App\Models;

use Database\Factories\ReminderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $transaction_id
 * @property string $trigger_field_key
 * @property string|null $label
 * @property Carbon $target_date
 * @property int $reminder_offset_days
 * @property bool $is_completed
 * @property Carbon|null $last_notified_at
 */
#[Fillable(['user_id', 'transaction_id', 'trigger_field_key', 'label', 'target_date', 'reminder_offset_days', 'is_completed', 'last_notified_at'])]
class Reminder extends Model
{
    /** @use HasFactory<ReminderFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_date' => 'date',
            'reminder_offset_days' => 'integer',
            'is_completed' => 'boolean',
            'last_notified_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Transaction, $this>
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * The date the alert first becomes active.
     */
    public function notifyOn(): Carbon
    {
        return $this->target_date->copy()->subDays($this->reminder_offset_days);
    }

    public function daysRemaining(): int
    {
        return (int) Carbon::today()->diffInDays($this->target_date, false);
    }
}
