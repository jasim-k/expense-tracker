<?php

namespace Database\Factories;

use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'category_id' => Category::factory(),
            'type' => TransactionType::Expense->value,
            'amount' => fake()->randomFloat(2, 5, 500),
            'transaction_date' => fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'description' => fake()->sentence(4),
            'dynamic_metadata' => null,
        ];
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => TransactionType::Expense->value,
        ]);
    }

    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => TransactionType::Income->value,
            'amount' => fake()->randomFloat(2, 500, 5000),
        ]);
    }

    public function assetLog(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => TransactionType::AssetLog->value,
        ]);
    }
}
