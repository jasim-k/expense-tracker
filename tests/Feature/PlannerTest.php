<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('planner renders upcoming reminders, asset cards, and checklist', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create([
        'name' => 'Passport',
        'type' => 'asset_maintenance',
        'icon_emoji' => '🛂',
        'custom_field_definitions' => [
            ['key' => 'passport_number', 'name' => 'Passport Number', 'type' => 'text', 'reminder' => false],
            ['key' => 'expiry_date', 'name' => 'Expiry Date', 'type' => 'date', 'reminder' => true, 'reminder_offset' => 60],
        ],
    ]);

    $this->actingAs($user)->post(route('transactions.store'), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 100,
        'transaction_date' => now()->toDateString(),
        'description' => 'Passport renewal',
        'dynamic_metadata' => [
            'passport_number' => 'X1234',
            'expiry_date' => now()->addDays(40)->toDateString(),
        ],
    ]);

    $this->get(route('planner.index'))->assertInertia(fn (Assert $page) => $page
        ->component('planner/index')
        ->has('upcoming', 1)
        ->has('checklist', 1)
        ->has('assets', 1)
        ->has('assets.0', fn (Assert $asset) => $asset
            ->where('title', 'Passport renewal')
            ->where('category', 'Passport')
            ->has('fields', 2)
            ->has('reminders', 1)
            ->etc()
        )
    );
});
