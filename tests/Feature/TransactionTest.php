<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Services\LedgerService;

test('creating an expense transaction decrements the account balance', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create(['opening_balance' => 100, 'current_balance' => 100]);
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    $this->actingAs($user)->post(route('transactions.store'), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 40,
        'transaction_date' => now()->toDateString(),
        'description' => 'Groceries',
    ])->assertRedirect(route('dashboard'));

    expect($account->fresh()->current_balance)->toEqual('60.00');
    expect(Transaction::query()->where('user_id', $user->id)->first()->type->value)->toBe('expense');
});

test('creating an income transaction increments the account balance', function () {
    $user = User::factory()->create();
    $account = Account::factory()->bank()->for($user)->create(['opening_balance' => 100, 'current_balance' => 100]);
    $category = Category::factory()->for($user)->create(['type' => 'income']);

    $this->actingAs($user)->post(route('transactions.store'), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 500,
        'transaction_date' => now()->toDateString(),
    ]);

    expect($account->fresh()->current_balance)->toEqual('600.00');
});

test('updating a transaction reverses the old effect and reapplies the new one', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create(['opening_balance' => 100, 'current_balance' => 100]);
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    $this->actingAs($user);

    $transaction = Transaction::factory()->for($user)->expense()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 40,
        'transaction_date' => now()->toDateString(),
    ]);
    app(LedgerService::class)->applyToBalance($transaction->fresh(['category']));

    expect($account->fresh()->current_balance)->toEqual('60.00');

    $this->put(route('transactions.update', $transaction), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 10,
        'transaction_date' => now()->toDateString(),
    ])->assertRedirect(route('transactions.index'));

    expect($account->fresh()->current_balance)->toEqual('90.00');
});

test('deleting a transaction reverses its effect on the balance', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create(['opening_balance' => 100, 'current_balance' => 100]);
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    $this->actingAs($user);

    $transaction = Transaction::factory()->for($user)->expense()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 40,
        'transaction_date' => now()->toDateString(),
    ]);
    app(LedgerService::class)->applyToBalance($transaction->fresh(['category']));

    expect($account->fresh()->current_balance)->toEqual('60.00');

    $this->delete(route('transactions.destroy', $transaction))
        ->assertRedirect(route('transactions.index'));

    expect($account->fresh()->current_balance)->toEqual('100.00');
    expect(Transaction::query()->find($transaction->id))->toBeNull();
});

test('amount must be strictly greater than zero', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    $this->actingAs($user)->post(route('transactions.store'), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 0,
        'transaction_date' => now()->toDateString(),
    ])->assertSessionHasErrors('amount');
});

test('cannot use another users account', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $foreignAccount = Account::factory()->cash()->for($otherUser)->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    $this->actingAs($user)->post(route('transactions.store'), [
        'account_id' => $foreignAccount->id,
        'category_id' => $category->id,
        'amount' => 10,
        'transaction_date' => now()->toDateString(),
    ])->assertSessionHasErrors('account_id');
});

test('cannot use another users category', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $foreignCategory = Category::factory()->for($otherUser)->create(['type' => 'expense']);

    $this->actingAs($user)->post(route('transactions.store'), [
        'account_id' => $account->id,
        'category_id' => $foreignCategory->id,
        'amount' => 10,
        'transaction_date' => now()->toDateString(),
    ])->assertSessionHasErrors('category_id');
});

test('cannot update another users transaction', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $account = Account::factory()->cash()->for($owner)->create();
    $category = Category::factory()->for($owner)->create(['type' => 'expense']);
    $transaction = Transaction::factory()->for($owner)->expense()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
    ]);

    $intruderAccount = Account::factory()->cash()->for($intruder)->create();
    $intruderCategory = Category::factory()->for($intruder)->create(['type' => 'expense']);

    $this->actingAs($intruder)->put(route('transactions.update', $transaction), [
        'account_id' => $intruderAccount->id,
        'category_id' => $intruderCategory->id,
        'amount' => 10,
        'transaction_date' => now()->toDateString(),
    ])->assertForbidden();
});
