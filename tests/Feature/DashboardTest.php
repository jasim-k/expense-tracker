<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Reminder;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard props match the tracker contract shape', function () {
    $user = User::factory()->create();
    $cash = Account::factory()->cash()->for($user)->create(['opening_balance' => 100, 'current_balance' => 100]);
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    Transaction::factory()->for($user)->expense()->create([
        'account_id' => $cash->id,
        'category_id' => $category->id,
        'amount' => 25,
        'transaction_date' => now()->toDateString(),
    ]);

    $reminderCategory = Category::factory()->for($user)->create([
        'type' => 'asset_maintenance',
        'custom_field_definitions' => [
            ['key' => 'expiry_date', 'name' => 'Expiry Date', 'type' => 'date', 'reminder' => true, 'reminder_offset' => 30],
        ],
    ]);
    $assetTx = Transaction::factory()->for($user)->assetLog()->create([
        'account_id' => $cash->id,
        'category_id' => $reminderCategory->id,
        'amount' => 10,
        'transaction_date' => now()->toDateString(),
        'dynamic_metadata' => ['expiry_date' => now()->addDays(10)->toDateString()],
    ]);
    Reminder::factory()->for($user)->for($assetTx, 'transaction')->create([
        'trigger_field_key' => 'expiry_date',
        'target_date' => now()->addDays(10)->toDateString(),
        'reminder_offset_days' => 30,
    ]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('balances', fn (Assert $p) => $p->hasAll(['cash', 'bank', 'credit', 'total']))
        ->has('accounts')
        ->has('monthly', fn (Assert $p) => $p->hasAll(['label', 'income', 'expense', 'net']))
        ->has('alerts')
        ->has('daily_summary')
        ->has('category_breakdown')
        ->has('cash_flow')
    );
});
