<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        [$from, $to, $categoryIds] = $this->resolveFilters($request);

        $transactions = $this->filteredQuery($user, $from, $to, $categoryIds)
            ->with(['category:id,name,icon_emoji,parent_id', 'category.parent:id,name', 'account:id,name,type,icon_emoji'])
            ->orderByDesc('transaction_date')
            ->get();

        $categories = Category::query()->where('user_id', $user->id)->with('parent:id,name')->orderBy('name')->get();

        return Inertia::render('reports/index', [
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'category_ids' => $categoryIds,
            ],
            'categories' => $categories->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'icon_emoji' => $category->icon_emoji,
                'type' => $category->type->value,
                'parent_name' => $category->parent?->name,
            ])->all(),
            'summary' => $this->summary($transactions),
            'breakdown' => $this->breakdown($transactions, $categories),
            'trend' => $this->trend($user, $from, $to, $categoryIds),
            'transactions' => $transactions->map(fn (Transaction $transaction) => $this->serializeTransaction($transaction))->all(),
            'dynamic_columns' => $this->dynamicColumns($categories, $categoryIds),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        /** @var User $user */
        $user = $request->user();
        [$from, $to, $categoryIds] = $this->resolveFilters($request);

        $transactions = $this->filteredQuery($user, $from, $to, $categoryIds)
            ->with(['category:id,name,icon_emoji,parent_id', 'account:id,name,type'])
            ->orderByDesc('transaction_date')
            ->get();

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Date', 'Type', 'Category', 'Account', 'Amount', 'Description']);

            foreach ($transactions as $transaction) {
                fputcsv($handle, [
                    $transaction->transaction_date->toDateString(),
                    $transaction->type->value,
                    $transaction->category->name,
                    $transaction->account->name,
                    (float) $transaction->amount,
                    $transaction->description,
                ]);
            }

            fclose($handle);
        }, 'transactions-report.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array{0: Carbon, 1: Carbon, 2: array<int, int>}
     */
    private function resolveFilters(Request $request): array
    {
        $from = $request->string('from')->toString()
            ? Carbon::parse($request->string('from')->toString())->startOfDay()
            : Carbon::now()->subMonths(5)->startOfMonth();
        $to = $request->string('to')->toString()
            ? Carbon::parse($request->string('to')->toString())->endOfDay()
            : Carbon::now()->endOfDay();

        $categoryIds = collect((array) $request->input('category_ids', []))->filter()->map(fn ($id) => (int) $id)->values()->all();

        return [$from, $to, $categoryIds];
    }

    /**
     * @param  array<int, int>  $categoryIds
     * @return Builder<Transaction>
     */
    private function filteredQuery(User $user, Carbon $from, Carbon $to, array $categoryIds)
    {
        return $user->transactions()
            ->whereBetween('transaction_date', [$from, $to])
            ->when($categoryIds !== [], fn ($query) => $query->whereIn('category_id', $categoryIds));
    }

    /**
     * @return array<string, float>
     */
    private function summary(Collection $transactions): array
    {
        $income = (float) $transactions->where('type', 'income')->sum('amount');
        $expense = (float) $transactions->where('type', 'expense')->sum('amount');
        $assetCost = (float) $transactions->where('type', 'asset_log')->sum('amount');

        return [
            'income' => $income,
            'expense' => $expense,
            'asset_cost' => $assetCost,
            'net' => $income - $expense - $assetCost,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function breakdown(Collection $transactions, Collection $categories): array
    {
        $totals = $transactions->whereIn('type', ['expense', 'asset_log'])
            ->groupBy('category_id')
            ->map(fn ($items) => (float) $items->sum('amount'));

        $rolledUp = [];

        foreach ($categories as $category) {
            $total = (float) ($totals[$category->id] ?? 0);

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
     * @param  array<int, int>  $categoryIds
     * @return array<int, array<string, mixed>>
     */
    private function trend(User $user, Carbon $from, Carbon $to, array $categoryIds): array
    {
        $points = [];
        $cursor = $from->copy()->startOfMonth();
        $end = $to->copy()->startOfMonth();

        while ($cursor->lte($end)) {
            $monthStart = $cursor->copy()->startOfMonth();
            $monthEnd = $cursor->copy()->endOfMonth();

            $base = $user->transactions()
                ->whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->when($categoryIds !== [], fn ($query) => $query->whereIn('category_id', $categoryIds));

            $points[] = [
                'month' => $cursor->format('M Y'),
                'expense' => (float) (clone $base)->where('type', 'expense')->sum('amount'),
                'maintenance' => (float) (clone $base)->where('type', 'asset_log')->sum('amount'),
            ];

            $cursor->addMonth();
        }

        return $points;
    }

    /**
     * @param  array<int, int>  $categoryIds
     * @return array<int, array<string, string>>
     */
    private function dynamicColumns(Collection $categories, array $categoryIds): array
    {
        $filtered = $categoryIds !== [] ? $categories->whereIn('id', $categoryIds) : $categories;

        $columns = [];

        foreach ($filtered as $category) {
            foreach ($category->custom_field_definitions ?? [] as $definition) {
                if (! in_array($definition['type'] ?? null, ['date', 'number', 'text'], true)) {
                    continue;
                }

                $key = Category::fieldKey($definition);
                $columns[$key] = ['key' => $key, 'label' => $definition['name']];
            }
        }

        return array_values($columns);
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
}
