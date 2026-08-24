<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Services\LedgerService;
use App\Services\ReminderSynchronizer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $user = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => bcrypt('password'),
        ]);

        $cash = Account::factory()->cash()->for($user)->create(['opening_balance' => 5000, 'current_balance' => 5000]);
        $bank = Account::factory()->bank()->for($user)->create(['opening_balance' => 20000, 'current_balance' => 20000]);

        // Category tree
        $food = Category::factory()->for($user)->create(['name' => 'Food', 'type' => 'expense', 'icon_emoji' => '🍔']);
        $groceries = Category::factory()->for($user)->create(['name' => 'Groceries', 'type' => 'expense', 'icon_emoji' => '🛒', 'parent_id' => $food->id]);
        $restaurants = Category::factory()->for($user)->create(['name' => 'Restaurants', 'type' => 'expense', 'icon_emoji' => '🍽️', 'parent_id' => $food->id]);

        $vehicles = Category::factory()->for($user)->create(['name' => 'Vehicles', 'type' => 'asset_maintenance', 'icon_emoji' => '🚗']);
        $tyre = Category::factory()->for($user)->create([
            'name' => 'Tyre Maintenance', 'type' => 'asset_maintenance', 'icon_emoji' => '🛞', 'parent_id' => $vehicles->id,
            'custom_field_definitions' => [
                ['key' => 'odometer_km', 'name' => 'Odometer (km)', 'type' => 'number', 'reminder' => false, 'reminder_offset' => 0],
                ['key' => 'tyre_change_date', 'name' => 'Tyre Change Date', 'type' => 'date', 'reminder' => true, 'reminder_offset' => 7],
            ],
        ]);
        $servicing = Category::factory()->for($user)->create([
            'name' => 'Servicing', 'type' => 'asset_maintenance', 'icon_emoji' => '🔧', 'parent_id' => $vehicles->id,
            'custom_field_definitions' => [
                ['key' => 'odometer_km', 'name' => 'Odometer (km)', 'type' => 'number', 'reminder' => false, 'reminder_offset' => 0],
                ['key' => 'service_date', 'name' => 'Last Service Date', 'type' => 'date', 'reminder' => true, 'reminder_offset' => 14],
            ],
        ]);

        $documents = Category::factory()->for($user)->create(['name' => 'Documents', 'type' => 'asset_maintenance', 'icon_emoji' => '🛂']);
        $passport = Category::factory()->for($user)->create([
            'name' => 'Passport', 'type' => 'asset_maintenance', 'icon_emoji' => '🛂', 'parent_id' => $documents->id,
            'custom_field_definitions' => [
                ['key' => 'passport_number', 'name' => 'Passport Number', 'type' => 'text', 'reminder' => false, 'reminder_offset' => 0],
                ['key' => 'expiry_date', 'name' => 'Expiry Date', 'type' => 'date', 'reminder' => true, 'reminder_offset' => 60],
            ],
        ]);
        $licence = Category::factory()->for($user)->create([
            'name' => "Driver's Licence", 'type' => 'asset_maintenance', 'icon_emoji' => '🪪', 'parent_id' => $documents->id,
            'custom_field_definitions' => [
                ['key' => 'licence_number', 'name' => 'Licence Number', 'type' => 'text', 'reminder' => false, 'reminder_offset' => 0],
                ['key' => 'expiry_date', 'name' => 'Expiry Date', 'type' => 'date', 'reminder' => true, 'reminder_offset' => 90],
            ],
        ]);

        $income = Category::factory()->for($user)->create(['name' => 'Income', 'type' => 'income', 'icon_emoji' => '💰']);
        $salary = Category::factory()->for($user)->create(['name' => 'Salary', 'type' => 'income', 'icon_emoji' => '🧾', 'parent_id' => $income->id]);
        $freelance = Category::factory()->for($user)->create(['name' => 'Freelance', 'type' => 'income', 'icon_emoji' => '💻', 'parent_id' => $income->id]);

        $ledger = app(LedgerService::class);
        $reminderSync = app(ReminderSynchronizer::class);

        // Salary income, monthly, last 6 months
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i)->startOfMonth()->addDays(1);
            $t = Transaction::factory()->for($user)->income()->create([
                'account_id' => $bank->id,
                'category_id' => $salary->id,
                'amount' => 4500,
                'transaction_date' => $date->toDateString(),
                'description' => 'Monthly salary',
            ]);
            $ledger->applyToBalance($t->fresh(['category']));
        }

        // Freelance income, sporadic
        for ($i = 0; $i < 6; $i++) {
            $date = Carbon::now()->subDays(random_int(1, 180));
            $t = Transaction::factory()->for($user)->income()->create([
                'account_id' => $bank->id,
                'category_id' => $freelance->id,
                'amount' => fake()->randomFloat(2, 200, 1200),
                'transaction_date' => $date->toDateString(),
                'description' => 'Freelance project payment',
            ]);
            $ledger->applyToBalance($t->fresh(['category']));
        }

        // Groceries & restaurants, ~40 transactions
        foreach ([$groceries, $restaurants] as $category) {
            for ($i = 0; $i < 20; $i++) {
                $date = Carbon::now()->subDays(random_int(0, 180));
                $account = fake()->boolean(60) ? $cash : $bank;
                $t = Transaction::factory()->for($user)->expense()->create([
                    'account_id' => $account->id,
                    'category_id' => $category->id,
                    'amount' => fake()->randomFloat(2, 5, 150),
                    'transaction_date' => $date->toDateString(),
                ]);
                $ledger->applyToBalance($t->fresh(['category']));
            }
        }

        // Asset logs with dynamic metadata + reminders
        $passportTx = Transaction::factory()->for($user)->assetLog()->create([
            'account_id' => $bank->id,
            'category_id' => $passport->id,
            'amount' => 150,
            'transaction_date' => Carbon::now()->subDays(30)->toDateString(),
            'description' => 'Passport renewal',
            'dynamic_metadata' => [
                'passport_number' => 'P1234567',
                'expiry_date' => Carbon::now()->addDays(40)->toDateString(),
            ],
        ]);
        $ledger->applyToBalance($passportTx->fresh(['category']));
        $reminderSync->sync($passportTx->fresh(['category']));

        $tyreTx = Transaction::factory()->for($user)->assetLog()->create([
            'account_id' => $cash->id,
            'category_id' => $tyre->id,
            'amount' => 220,
            'transaction_date' => Carbon::now()->subDays(90)->toDateString(),
            'description' => 'Tyre change',
            'dynamic_metadata' => [
                'odometer_km' => 45210,
                'tyre_change_date' => Carbon::now()->addDays(5)->toDateString(),
            ],
        ]);
        $ledger->applyToBalance($tyreTx->fresh(['category']));
        $reminderSync->sync($tyreTx->fresh(['category']));

        $licenceTx = Transaction::factory()->for($user)->assetLog()->create([
            'account_id' => $bank->id,
            'category_id' => $licence->id,
            'amount' => 60,
            'transaction_date' => Carbon::now()->subDays(10)->toDateString(),
            'description' => "Driver's licence renewal",
            'dynamic_metadata' => [
                'licence_number' => 'DL998877',
                'expiry_date' => Carbon::now()->addDays(180)->toDateString(),
            ],
        ]);
        $ledger->applyToBalance($licenceTx->fresh(['category']));
        $reminderSync->sync($licenceTx->fresh(['category']));

        $servicingTx = Transaction::factory()->for($user)->assetLog()->create([
            'account_id' => $bank->id,
            'category_id' => $servicing->id,
            'amount' => 180,
            'transaction_date' => Carbon::now()->subDays(60)->toDateString(),
            'description' => 'Regular service',
            'dynamic_metadata' => [
                'odometer_km' => 44000,
                'service_date' => Carbon::now()->addDays(120)->toDateString(),
            ],
        ]);
        $ledger->applyToBalance($servicingTx->fresh(['category']));
        $reminderSync->sync($servicingTx->fresh(['category']));

        // Budgets for current month
        Budget::factory()->for($user)->create(['category_id' => $groceries->id, 'period_month' => Carbon::now()->startOfMonth(), 'limit_amount' => 400]);
        Budget::factory()->for($user)->create(['category_id' => $restaurants->id, 'period_month' => Carbon::now()->startOfMonth(), 'limit_amount' => 250]);
        Budget::factory()->for($user)->create(['category_id' => $vehicles->id, 'period_month' => Carbon::now()->startOfMonth(), 'limit_amount' => 500]);
        Budget::factory()->for($user)->create(['category_id' => $documents->id, 'period_month' => Carbon::now()->startOfMonth(), 'limit_amount' => 300]);
    }
}
