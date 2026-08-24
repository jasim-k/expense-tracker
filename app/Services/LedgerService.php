<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Http\Requests\TransactionStoreRequest;
use App\Http\Requests\TransactionUpdateRequest;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LedgerService
{
    /**
     * Create a transaction, applying its effect on the owning account balance.
     */
    public function create(User $user, TransactionStoreRequest $request): Transaction
    {
        return DB::transaction(function () use ($user, $request) {
            $category = Category::query()->findOrFail($request->validated('category_id'));

            $transaction = $user->transactions()->create([
                ...$request->validated(),
                'type' => TransactionType::fromCategoryType($category->type)->value,
            ]);

            $this->applyToBalance($transaction);

            return $transaction;
        });
    }

    /**
     * Update a transaction, reversing its previous effect and reapplying the new one.
     */
    public function update(Transaction $transaction, TransactionUpdateRequest $request): Transaction
    {
        return DB::transaction(function () use ($transaction, $request) {
            $this->reverseFromBalance($transaction);

            $category = Category::query()->findOrFail($request->validated('category_id'));

            $transaction->update([
                ...$request->validated(),
                'type' => TransactionType::fromCategoryType($category->type)->value,
            ]);

            $this->applyToBalance($transaction->fresh());

            return $transaction->fresh();
        });
    }

    /**
     * Delete a transaction, reversing its effect on the account balance.
     */
    public function delete(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $this->reverseFromBalance($transaction);
            $transaction->delete();
        });
    }

    /**
     * Apply the transaction's monetary effect to its account's current balance.
     */
    public function applyToBalance(Transaction $transaction): void
    {
        $account = $transaction->account ?? Account::query()->findOrFail($transaction->account_id);
        $delta = $transaction->category->type->isDebit() ? -1 : 1;

        $account->current_balance = bcadd((string) $account->current_balance, bcmul((string) $transaction->amount, (string) $delta, 2), 2);
        $account->save();
    }

    /**
     * Reverse the transaction's previously applied monetary effect from its account's current balance.
     */
    public function reverseFromBalance(Transaction $transaction): void
    {
        $account = $transaction->account ?? Account::query()->findOrFail($transaction->account_id);
        $delta = $transaction->category->type->isDebit() ? 1 : -1;

        $account->current_balance = bcadd((string) $account->current_balance, bcmul((string) $transaction->amount, (string) $delta, 2), 2);
        $account->save();
    }

    /**
     * Recompute an account's current balance from scratch, based on its opening balance and all transactions.
     */
    public function recompute(Account $account): void
    {
        $balance = (float) $account->opening_balance;

        $account->loadMissing('transactions.category');

        foreach ($account->transactions as $transaction) {
            $balance += $transaction->category->type->isDebit() ? -1 * (float) $transaction->amount : (float) $transaction->amount;
        }

        $account->current_balance = $balance;
        $account->save();
    }
}
