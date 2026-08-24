<?php

namespace Database\Factories;

use App\Enums\AccountType;
use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $opening = fake()->randomFloat(2, 500, 5000);

        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['Physical Cash', 'HDFC Bank', 'ICICI Bank', 'Wallet']),
            'type' => fake()->randomElement(AccountType::cases())->value,
            'opening_balance' => $opening,
            'current_balance' => $opening,
            'icon_emoji' => '💰',
        ];
    }

    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Cash',
            'type' => AccountType::Cash->value,
            'icon_emoji' => '💵',
        ]);
    }

    public function bank(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'HDFC Bank',
            'type' => AccountType::Bank->value,
            'icon_emoji' => '🏦',
        ]);
    }
}
