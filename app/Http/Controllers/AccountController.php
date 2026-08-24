<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountStoreRequest;
use App\Http\Requests\AccountUpdateRequest;
use App\Models\Account;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $accounts = $request->user()->accounts()->get()->map(fn (Account $account) => [
            'id' => $account->id,
            'name' => $account->name,
            'type' => $account->type->value,
            'icon_emoji' => $account->icon_emoji,
            'opening_balance' => (float) $account->opening_balance,
            'current_balance' => (float) $account->current_balance,
        ])->all();

        return Inertia::render('accounts/index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(AccountStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['current_balance'] = $data['opening_balance'] ?? 0;

        $request->user()->accounts()->create($data);

        return back()->with('success', 'Account created successfully.');
    }

    public function update(AccountUpdateRequest $request, Account $account): RedirectResponse
    {
        abort_unless($account->user_id === $request->user()->id, 403);

        $account->update($request->validated());

        return back()->with('success', 'Account updated successfully.');
    }

    public function destroy(Request $request, Account $account): RedirectResponse
    {
        abort_unless($account->user_id === $request->user()->id, 403);

        $account->delete();

        return back()->with('success', 'Account deleted successfully.');
    }
}
