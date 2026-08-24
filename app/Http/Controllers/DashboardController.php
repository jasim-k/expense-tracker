<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Reminder;
use App\Models\Transaction;
use App\Models\User;
use App\Services\ReminderPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('dashboard', [
            'balances' => $this->balances($user),
            'accounts' => $user->accounts()->get()->map(fn ($account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type->value,
                'icon_emoji' => $account->icon_emoji,
                'opening_balance' => (float) $account->opening_balance,
                'current_balance' => (float) $account->current_balance,
            ])->all(),
            'monthly' => $this->monthly($user),
            'alerts' => $this->alerts($user),
            'daily_summary' => $this->dailySummary($user),
            'category_breakdown' => $this->categoryBreakdown($user),
            'cash_flow' => $this->cashFlow($user),
        ]);
    }

    /**
     * @return array<string, float>
     */
    private function balances(User $user): array
    {
        $sums = $user->accounts()->selectRaw('type, sum(current_balance) as total')->groupBy('type')->pluck('total', 'type');

        return [
            'cash' => (float) ($sums['cash'] ?? 0),
            'bank' => (float) ($sums['bank'] ?? 0),
            'credit' => (float) ($sums['credit'] ?? 0),
            'total' => (float) $user->accounts()->sum('current_balance'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function monthly(User $user): array
    {
        $now = Carbon::now();
        $income = (float) $user->transactions()
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
            ->sum('amount');
        $expense = (float) $user->transactions()
            ->whereIn('type', ['expense', 'asset_log'])
            ->whereBetween('transaction_date', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
            ->sum('amount');

        return [
            'label' => $now->format('F Y'),
            'income' => $income,
            'expense' => $expense,
            'net' => $income - $expense,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function alerts(User $user): array
    {
        $reminders = Reminder::query()
            ->where('user_id', $user->id)
            ->where('is_completed', false)
            ->with(['transaction.category'])
            ->orderBy('target_date')
            ->get();

        $due = $reminders->filter(fn (Reminder $reminder) => Carbon::today()->diffInDays($reminder->target_date, false) <= $reminder->reminder_offset_days);
        $nearest = $reminders->take(5);

        $selected = $due->merge($nearest)->unique('id')->sortBy('target_date')->values();

        return $selected->map(fn (Reminder $reminder) => ReminderPresenter::toAlertItem($reminder))->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function dailySummary(User $user): array
    {
        $from = Carbon::today()->subDays(13);

        $transactions = $user->transactions()
            ->with(['category:id,name,icon_emoji,parent_id', 'category.parent:id,name', 'account:id,name,type,icon_emoji'])
            ->whereDate('transaction_date', '>=', $from)
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->get();

        return $transactions->groupBy(fn (Transaction $transaction) => $transaction->transaction_date->toDateString())
            ->sortKeysDesc()
            ->map(function ($items, string $date) {
                $items = $items->values();

                return [
                    'date' => $date,
                    'label' => $this->dateLabel(Carbon::parse($date)),
                    'total_income' => (float) $items->where('type', 'income')->sum('amount'),
                    'total_expense' => (float) $items->whereIn('type', ['expense', 'asset_log'])->sum('amount'),
                    'items' => $items->map(fn (Transaction $transaction) => [
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
                    ])->all(),
                ];
            })
            ->values()
            ->all();
    }

    private function dateLabel(Carbon $date): string
    {
        if ($date->isToday()) {
            return 'Today';
        }

        if ($date->isYesterday()) {
            return 'Yesterday';
        }

        return $date->format('D, j M');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function categoryBreakdown(User $user): array
    {
        $now = Carbon::now();

        $categories = Category::query()->where('user_id', $user->id)->get();

        $expenseTotals = $user->transactions()
            ->whereIn('type', ['expense', 'asset_log'])
            ->whereBetween('transaction_date', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
            ->selectRaw('category_id, sum(amount) as total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        $rolledUp = [];

        foreach ($categories as $category) {
            $total = (float) ($expenseTotals[$category->id] ?? 0);

            if ($total <= 0) {
                continue;
            }

            $rootId = $category->parent_id ?? $category->id;
            $rolledUp[$rootId] ??= ['total' => 0.0, 'children' => []];
            $rolledUp[$rootId]['total'] += $total;

            if ($category->parent_id !== null) {
                $rolledUp[$rootId]['children'][] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'icon_emoji' => $category->icon_emoji,
                    'total' => $total,
                ];
            }
        }

        $grandTotal = array_sum(array_column($rolledUp, 'total'));

        return collect($rolledUp)
            ->map(function (array $entry, int $rootId) use ($categories, $grandTotal) {
                $root = $categories->firstWhere('id', $rootId);

                return [
                    'id' => $rootId,
                    'name' => $root->name,
                    'icon_emoji' => $root->icon_emoji,
                    'total' => $entry['total'],
                    'percentage' => $grandTotal > 0 ? round($entry['total'] / $grandTotal * 100, 1) : 0,
                    'children' => $entry['children'],
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function cashFlow(User $user): array
    {
        $points = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $income = (float) $user->transactions()
                ->where('type', 'income')
                ->whereBetween('transaction_date', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
                ->sum('amount');
            $expense = (float) $user->transactions()
                ->whereIn('type', ['expense', 'asset_log'])
                ->whereBetween('transaction_date', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
                ->sum('amount');

            $points[] = [
                'month' => $month->format('M Y'),
                'income' => $income,
                'expense' => $expense,
            ];
        }

        return $points;
    }
}
