<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionStoreRequest;
use App\Http\Requests\TransactionUpdateRequest;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Services\LedgerService;
use App\Services\ReminderSynchronizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function __construct(
        private readonly LedgerService $ledger,
        private readonly ReminderSynchronizer $reminderSynchronizer,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = $user->transactions()
            ->with(['category:id,name,icon_emoji,parent_id', 'category.parent:id,name', 'account:id,name,type,icon_emoji']);

        if ($search = $request->string('search')->toString()) {
            $query->where('description', 'like', "%{$search}%");
        }

        if ($categoryId = $request->integer('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($accountId = $request->integer('account_id')) {
            $query->where('account_id', $accountId);
        }

        if ($type = $request->string('type')->toString()) {
            $query->where('type', $type);
        }

        if ($from = $request->string('from')->toString()) {
            $query->whereDate('transaction_date', '>=', $from);
        }

        if ($to = $request->string('to')->toString()) {
            $query->whereDate('transaction_date', '<=', $to);
        }

        $totalsQuery = clone $query;

        $transactions = $query->orderByDesc('transaction_date')->orderByDesc('id')->paginate(20)->withQueryString();

        return Inertia::render('transactions/index', [
            'transactions' => [
                'data' => $transactions->getCollection()->map(fn (Transaction $transaction) => $this->serializeTransaction($transaction))->all(),
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'links' => $transactions->linkCollection()->toArray(),
            ],
            'filters' => [
                'search' => $request->string('search')->toString() ?: null,
                'category_id' => $request->integer('category_id') ?: null,
                'account_id' => $request->integer('account_id') ?: null,
                'type' => $request->string('type')->toString() ?: null,
                'from' => $request->string('from')->toString() ?: null,
                'to' => $request->string('to')->toString() ?: null,
            ],
            'accounts' => $user->accounts()->get()->map(fn ($account) => $this->serializeAccount($account))->all(),
            'categories' => $this->categoryOptions($user->id),
            'totals' => [
                'income' => (float) (clone $totalsQuery)->where('type', 'income')->sum('amount'),
                'expense' => (float) (clone $totalsQuery)->whereIn('type', ['expense', 'asset_log'])->sum('amount'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('transactions/create', [
            'accounts' => $user->accounts()->get()->map(fn ($account) => $this->serializeAccount($account))->all(),
            'categoryTree' => $this->categoryTree($user->id),
            'transaction' => null,
        ]);
    }

    public function store(TransactionStoreRequest $request): RedirectResponse
    {
        $transaction = $this->ledger->create($request->user(), $request);
        $this->reminderSynchronizer->sync($transaction, $request->validated('reminders') ?? []);

        return redirect()->route('dashboard')->with('success', 'Transaction registered and balanced successfully.');
    }

    public function show(Request $request, Transaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        return redirect()->route('transactions.edit', $transaction);
    }

    public function edit(Request $request, Transaction $transaction): Response
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        $user = $request->user();
        $transaction->load(['category:id,name,icon_emoji,parent_id', 'category.parent:id,name', 'account:id,name,type,icon_emoji']);

        return Inertia::render('transactions/edit', [
            'accounts' => $user->accounts()->get()->map(fn ($account) => $this->serializeAccount($account))->all(),
            'categoryTree' => $this->categoryTree($user->id),
            'transaction' => $this->serializeTransaction($transaction),
        ]);
    }

    public function update(TransactionUpdateRequest $request, Transaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        $transaction = $this->ledger->update($transaction, $request);
        $this->reminderSynchronizer->sync($transaction, $request->validated('reminders') ?? []);

        return redirect()->route('transactions.index')->with('success', 'Transaction updated and balances reconciled.');
    }

    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        $this->ledger->delete($transaction);

        return redirect()->route('transactions.index')->with('success', 'Transaction deleted and balance reversed.');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeTransaction(Transaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'type' => $transaction->type->value,
            'amount' => (float) $transaction->amount,
            'transaction_date' => $transaction->transaction_date->toDateString(),
            'description' => $transaction->description,
            'category' => [
                'id' => $transaction->category->id,
                'name' => $transaction->category->name,
                'icon_emoji' => $transaction->category->icon_emoji,
                'parent_name' => $transaction->category->parent?->name,
            ],
            'account' => [
                'id' => $transaction->account->id,
                'name' => $transaction->account->name,
                'type' => $transaction->account->type->value,
                'icon_emoji' => $transaction->account->icon_emoji,
            ],
            'dynamic_metadata' => $transaction->dynamic_metadata,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeAccount(Account $account): array
    {
        return [
            'id' => $account->id,
            'name' => $account->name,
            'type' => $account->type->value,
            'icon_emoji' => $account->icon_emoji,
            'opening_balance' => (float) $account->opening_balance,
            'current_balance' => (float) $account->current_balance,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function categoryOptions(int $userId): array
    {
        return Category::query()
            ->where('user_id', $userId)
            ->with('parent:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'icon_emoji' => $category->icon_emoji,
                'type' => $category->type->value,
                'parent_name' => $category->parent?->name,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function categoryTree(int $userId): array
    {
        $categories = Category::query()->where('user_id', $userId)->orderBy('name')->get();

        $normalize = function (Category $category) use (&$normalize, $categories) {
            return [
                'id' => $category->id,
                'parent_id' => $category->parent_id,
                'name' => $category->name,
                'type' => $category->type->value,
                'icon_emoji' => $category->icon_emoji,
                'custom_field_definitions' => $this->normalizeFieldDefinitions($category->custom_field_definitions ?? []),
                'children' => $categories->where('parent_id', $category->id)->map($normalize)->values()->all(),
            ];
        };

        return $categories->whereNull('parent_id')->map($normalize)->values()->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $definitions
     * @return array<int, array<string, mixed>>
     */
    private function normalizeFieldDefinitions(array $definitions): array
    {
        return collect($definitions)->map(fn (array $definition) => [
            'key' => Category::fieldKey($definition),
            'name' => $definition['name'],
            'type' => $definition['type'],
            'reminder' => (bool) ($definition['reminder'] ?? false),
            'reminder_offset' => (int) ($definition['reminder_offset'] ?? 7),
        ])->all();
    }
}
