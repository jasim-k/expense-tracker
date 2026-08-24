<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;

test('every authenticated page renders for a fully seeded account', function (string $routeName) {
    $this->seed(DatabaseSeeder::class);

    $user = User::query()->where('email', 'demo@example.com')->firstOrFail();

    $this->actingAs($user)->get(route($routeName))->assertOk();
})->with([
    'dashboard',
    'transactions.index',
    'transactions.create',
    'categories.index',
    'accounts.index',
    'budgets.index',
    'planner.index',
    'reminders.index',
    'reports.index',
]);

test('the landing page renders for a guest', function () {
    $this->get(route('home'))->assertOk();
});

test('the statement export streams a csv', function () {
    $this->seed(DatabaseSeeder::class);

    $user = User::query()->where('email', 'demo@example.com')->firstOrFail();

    $response = $this->actingAs($user)->get(route('reports.export'));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('text/csv');
});
