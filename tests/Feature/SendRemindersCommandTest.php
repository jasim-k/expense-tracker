<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Reminder;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\ReminderDueNotification;
use Illuminate\Support\Facades\Notification;

test('reminders due within their offset window are sent and not resent within a day', function () {
    Notification::fake();

    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create(['type' => 'asset_maintenance']);
    $transaction = Transaction::factory()->for($user)->assetLog()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
    ]);

    $due = Reminder::factory()->for($user)->for($transaction, 'transaction')->create([
        'target_date' => now()->addDays(5)->toDateString(),
        'reminder_offset_days' => 7,
        'is_completed' => false,
    ]);

    $notDue = Reminder::factory()->for($user)->for($transaction, 'transaction')->create([
        'target_date' => now()->addDays(60)->toDateString(),
        'reminder_offset_days' => 7,
        'is_completed' => false,
    ]);

    $completed = Reminder::factory()->for($user)->for($transaction, 'transaction')->create([
        'target_date' => now()->addDays(1)->toDateString(),
        'reminder_offset_days' => 7,
        'is_completed' => true,
    ]);

    $this->artisan('reminders:send')->assertSuccessful();

    Notification::assertSentTo($user, ReminderDueNotification::class, fn ($notification) => $notification->reminder->is($due));
    Notification::assertSentToTimes($user, ReminderDueNotification::class, 1);

    expect($due->fresh()->last_notified_at)->not->toBeNull();
    expect($notDue->fresh()->last_notified_at)->toBeNull();
    expect($completed->fresh()->last_notified_at)->toBeNull();
});

test('a reminder already notified within the last 24 hours is not resent', function () {
    Notification::fake();

    $user = User::factory()->create();
    $account = Account::factory()->cash()->for($user)->create();
    $category = Category::factory()->for($user)->create(['type' => 'asset_maintenance']);
    $transaction = Transaction::factory()->for($user)->assetLog()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
    ]);

    Reminder::factory()->for($user)->for($transaction, 'transaction')->create([
        'target_date' => now()->addDays(2)->toDateString(),
        'reminder_offset_days' => 7,
        'is_completed' => false,
        'last_notified_at' => now()->subHours(2),
    ]);

    $this->artisan('reminders:send')->assertSuccessful();

    Notification::assertNothingSent();
});
