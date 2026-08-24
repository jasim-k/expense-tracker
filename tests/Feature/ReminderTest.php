<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Reminder;
use App\Models\Transaction;
use App\Models\User;

test('a reminder is auto created from a date custom field flagged for reminders', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create([
        'type' => 'asset_maintenance',
        'custom_field_definitions' => [
            ['key' => 'expiry_date', 'name' => 'Expiry Date', 'type' => 'date', 'reminder' => true, 'reminder_offset' => 30],
            ['key' => 'notes', 'name' => 'Notes', 'type' => 'text', 'reminder' => false],
        ],
    ]);

    $this->actingAs($user)->post(route('transactions.store'), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 20,
        'transaction_date' => now()->toDateString(),
        'dynamic_metadata' => [
            'expiry_date' => now()->addDays(40)->toDateString(),
            'notes' => 'Some note',
        ],
    ])->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('reminders', [
        'user_id' => $user->id,
        'trigger_field_key' => 'expiry_date',
        'reminder_offset_days' => 30,
    ]);
    expect(Reminder::query()->where('user_id', $user->id)->count())->toBe(1);
});

test('updating dynamic metadata without a reminder date removes the stale reminder', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create([
        'type' => 'asset_maintenance',
        'custom_field_definitions' => [
            ['key' => 'expiry_date', 'name' => 'Expiry Date', 'type' => 'date', 'reminder' => true, 'reminder_offset' => 30],
        ],
    ]);

    $this->actingAs($user);

    $response = $this->post(route('transactions.store'), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 20,
        'transaction_date' => now()->toDateString(),
        'dynamic_metadata' => ['expiry_date' => now()->addDays(40)->toDateString()],
    ]);
    $response->assertRedirect(route('dashboard'));

    $transaction = Transaction::query()->where('user_id', $user->id)->firstOrFail();
    expect($transaction->reminders()->count())->toBe(1);

    $this->put(route('transactions.update', $transaction), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 20,
        'transaction_date' => now()->toDateString(),
        'dynamic_metadata' => ['note' => 'expiry cleared'],
    ]);

    expect($transaction->reminders()->count())->toBe(0);
});

test('marking a reminder complete toggles its state', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create(['type' => 'asset_maintenance']);
    $transaction = Transaction::factory()->for($user)->assetLog()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
    ]);
    $reminder = Reminder::factory()->for($user)->for($transaction, 'transaction')->create(['is_completed' => false]);

    $this->actingAs($user)->post(route('reminders.complete', $reminder))->assertRedirect();

    expect($reminder->fresh()->is_completed)->toBeTrue();

    $this->post(route('reminders.complete', $reminder));
    expect($reminder->fresh()->is_completed)->toBeFalse();
});

test('cannot mark another users reminder complete', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $account = Account::factory()->cash()->for($owner)->create();
    $category = Category::factory()->for($owner)->create(['type' => 'asset_maintenance']);
    $transaction = Transaction::factory()->for($owner)->assetLog()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
    ]);
    $reminder = Reminder::factory()->for($owner)->for($transaction, 'transaction')->create();

    $this->actingAs($intruder)->post(route('reminders.complete', $reminder))->assertForbidden();
});

test('the logger form can override a category reminder offset for a single transaction', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create([
        'type' => 'asset_maintenance',
        'custom_field_definitions' => [
            ['key' => 'expiry_date', 'name' => 'Expiry Date', 'type' => 'date', 'reminder' => true, 'reminder_offset' => 30],
        ],
    ]);

    $this->actingAs($user)->post(route('transactions.store'), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 20,
        'transaction_date' => now()->toDateString(),
        'dynamic_metadata' => ['expiry_date' => now()->addDays(120)->toDateString()],
        'reminders' => ['expiry_date' => ['enabled' => true, 'offset_days' => 90]],
    ])->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('reminders', [
        'user_id' => $user->id,
        'trigger_field_key' => 'expiry_date',
        'reminder_offset_days' => 90,
    ]);
});

test('the logger form can opt a single transaction out of a category reminder', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create([
        'type' => 'asset_maintenance',
        'custom_field_definitions' => [
            ['key' => 'expiry_date', 'name' => 'Expiry Date', 'type' => 'date', 'reminder' => true, 'reminder_offset' => 30],
        ],
    ]);

    $this->actingAs($user)->post(route('transactions.store'), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 20,
        'transaction_date' => now()->toDateString(),
        'dynamic_metadata' => ['expiry_date' => now()->addDays(120)->toDateString()],
        'reminders' => ['expiry_date' => ['enabled' => false, 'offset_days' => 30]],
    ])->assertRedirect(route('dashboard'));

    expect(Reminder::query()->where('user_id', $user->id)->count())->toBe(0);
});

test('the logger form can enable a reminder on a date field the category does not flag', function () {
    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create([
        'type' => 'asset_maintenance',
        'custom_field_definitions' => [
            ['key' => 'service_date', 'name' => 'Service Date', 'type' => 'date', 'reminder' => false, 'reminder_offset' => 7],
        ],
    ]);

    $this->actingAs($user)->post(route('transactions.store'), [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 20,
        'transaction_date' => now()->toDateString(),
        'dynamic_metadata' => ['service_date' => now()->addDays(45)->toDateString()],
        'reminders' => ['service_date' => ['enabled' => true, 'offset_days' => 14]],
    ])->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('reminders', [
        'user_id' => $user->id,
        'trigger_field_key' => 'service_date',
        'reminder_offset_days' => 14,
    ]);
});
