<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('budget progress and status thresholds are computed correctly', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    Budget::factory()->for($user)->create([
        'category_id' => $category->id,
        'period_month' => now()->startOfMonth(),
        'limit_amount' => 100,
    ]);

    Transaction::factory()->for($user)->expense()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 80,
        'transaction_date' => now()->toDateString(),
    ]);

    $this->actingAs($user);

    $this->get(route('budgets.index'))->assertInertia(fn (Assert $page) => $page
        ->component('budgets/index')
        ->has('budgets.0', fn (Assert $card) => $card
            ->where('spent', 80)
            ->where('limit_amount', 100)
            ->where('remaining', 20)
            ->where('percentage', 80)
            ->where('status', 'warning')
            ->etc()
        )
    );
});

test('budget status is over when spending reaches the limit', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    Budget::factory()->for($user)->create([
        'category_id' => $category->id,
        'period_month' => now()->startOfMonth(),
        'limit_amount' => 50,
    ]);

    Transaction::factory()->for($user)->expense()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 60,
        'transaction_date' => now()->toDateString(),
    ]);

    $this->actingAs($user);

    $this->get(route('budgets.index'))->assertInertia(fn (Assert $page) => $page
        ->has('budgets.0', fn (Assert $card) => $card->where('status', 'over')->etc())
    );
});

test('budget spending includes child category transactions', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $parent = Category::factory()->for($user)->create(['type' => 'expense']);
    $child = Category::factory()->for($user)->create(['parent_id' => $parent->id, 'type' => 'expense']);

    Budget::factory()->for($user)->create([
        'category_id' => $parent->id,
        'period_month' => now()->startOfMonth(),
        'limit_amount' => 200,
    ]);

    Transaction::factory()->for($user)->expense()->create([
        'account_id' => $account->id,
        'category_id' => $child->id,
        'amount' => 30,
        'transaction_date' => now()->toDateString(),
    ]);

    $this->actingAs($user);

    $this->get(route('budgets.index'))->assertInertia(fn (Assert $page) => $page
        ->has('budgets.0', fn (Assert $card) => $card->where('spent', 30)->etc())
    );
});
