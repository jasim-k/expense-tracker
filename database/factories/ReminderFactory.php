<?php

namespace Database\Factories;

use App\Models\Reminder;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reminder>
 */
class ReminderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'transaction_id' => Transaction::factory(),
            'trigger_field_key' => 'target_date',
            'label' => fake()->words(3, true),
            'target_date' => fake()->dateTimeBetween('now', '+6 months')->format('Y-m-d'),
            'reminder_offset_days' => 30,
            'is_completed' => false,
            'last_notified_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_completed' => true,
        ]);
    }

    public function dueInDays(int $days): static
    {
        return $this->state(fn (array $attributes) => [
            'target_date' => now()->addDays($days)->toDateString(),
        ]);
    }
}
