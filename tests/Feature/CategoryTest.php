<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

test('a user can create a nested category', function () {
    $user = User::factory()->create();
    $parent = Category::factory()->for($user)->create(['type' => 'expense']);

    $this->actingAs($user)->post(route('categories.store'), [
        'parent_id' => $parent->id,
        'name' => 'Child Category',
        'type' => 'expense',
        'icon_emoji' => '🧾',
    ])->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'user_id' => $user->id,
        'parent_id' => $parent->id,
        'name' => 'Child Category',
    ]);
});

test('duplicate sibling category names are rejected', function () {
    $user = User::factory()->create();
    $parent = Category::factory()->for($user)->create(['type' => 'expense']);
    Category::factory()->for($user)->create(['parent_id' => $parent->id, 'name' => 'Groceries', 'type' => 'expense']);

    $this->actingAs($user)->post(route('categories.store'), [
        'parent_id' => $parent->id,
        'name' => 'Groceries',
        'type' => 'expense',
    ])->assertSessionHasErrors();
});

test('deleting a category with cascade reassign moves children and transactions to uncategorized', function () {
    $user = User::factory()->create();
    $parent = Category::factory()->for($user)->create(['type' => 'expense']);
    $child = Category::factory()->for($user)->create(['parent_id' => $parent->id, 'type' => 'expense']);
    $transaction = Transaction::factory()->for($user)->expense()->create(['category_id' => $parent->id]);

    $this->actingAs($user)->delete(route('categories.destroy', $parent), ['cascade' => 'reassign'])
        ->assertRedirect();

    $this->assertSoftDeleted('categories', ['id' => $parent->id]);
    $uncategorized = Category::query()->where('user_id', $user->id)->where('name', 'Uncategorized')->first();
    expect($uncategorized)->not->toBeNull();
    expect($child->fresh()->parent_id)->toBe($uncategorized->id);
    expect($transaction->fresh()->category_id)->toBe($uncategorized->id);
});

test('deleting a category with cascade delete removes children and their transactions', function () {
    $user = User::factory()->create();
    $parent = Category::factory()->for($user)->create(['type' => 'expense']);
    $child = Category::factory()->for($user)->create(['parent_id' => $parent->id, 'type' => 'expense']);
    $transaction = Transaction::factory()->for($user)->expense()->create(['category_id' => $child->id]);

    $this->actingAs($user)->delete(route('categories.destroy', $parent), ['cascade' => 'delete'])
        ->assertRedirect();

    $this->assertSoftDeleted('categories', ['id' => $parent->id]);
    $this->assertSoftDeleted('categories', ['id' => $child->id]);
    $this->assertSoftDeleted('transactions', ['id' => $transaction->id]);
});

test('cannot delete another users category', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $category = Category::factory()->for($owner)->create(['type' => 'expense']);

    $this->actingAs($intruder)->delete(route('categories.destroy', $category))->assertForbidden();
});
