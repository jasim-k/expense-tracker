<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('reports index renders summary, breakdown, trend, and transactions', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    Transaction::factory()->for($user)->expense()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 50,
        'transaction_date' => now()->toDateString(),
    ]);

    $this->actingAs($user)->get(route('reports.index'))->assertInertia(fn (Assert $page) => $page
        ->component('reports/index')
        ->has('filters', fn (Assert $p) => $p->hasAll(['from', 'to', 'category_ids']))
        ->has('summary', fn (Assert $p) => $p->hasAll(['income', 'expense', 'asset_cost', 'net']))
        ->has('breakdown')
        ->has('trend')
        ->has('transactions', 1)
        ->has('dynamic_columns')
    );
});

test('csv export streams a downloadable file honouring filters', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    Transaction::factory()->for($user)->expense()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 75,
        'transaction_date' => now()->toDateString(),
        'description' => 'Export test',
    ]);

    $response = $this->actingAs($user)->get(route('reports.export'));

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    expect($response->streamedContent())->toContain('Export test');
});
