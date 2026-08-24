<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetStoreRequest;
use App\Http\Requests\BudgetUpdateRequest;
use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $periodMonth = $request->string('period_month')->toString() ?: Carbon::now()->startOfMonth()->toDateString();
        $month = Carbon::parse($periodMonth)->startOfMonth();

        $budgets = $user->budgets()
            ->with('category:id,name,icon_emoji,parent_id')
            ->whereDate('period_month', $month->toDateString())
            ->get();

        $cards = $budgets->map(function (Budget $budget) use ($user, $month) {
            $categoryIds = $this->categoryAndDescendantIds($budget->category);

            $spent = (float) $user->transactions()
                ->whereIn('category_id', $categoryIds)
                ->whereIn('type', ['expense', 'asset_log'])
                ->whereBetween('transaction_date', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
                ->sum('amount');

            $limit = (float) $budget->limit_amount;
            $percentage = $limit > 0 ? round($spent / $limit * 100, 1) : 0;

            return [
                'id' => $budget->id,
                'category' => [
                    'id' => $budget->category->id,
                    'name' => $budget->category->name,
                    'icon_emoji' => $budget->category->icon_emoji,
                ],
                'limit_amount' => $limit,
                'spent' => $spent,
                'remaining' => $limit - $spent,
                'percentage' => $percentage,
                'status' => match (true) {
                    $percentage >= 100 => 'over',
                    $percentage >= 70 => 'warning',
                    default => 'ok',
                },
            ];
        })->values();

        return Inertia::render('budgets/index', [
            'budgets' => $cards->all(),
            'categories' => Category::query()->where('user_id', $user->id)->with('parent:id,name')->orderBy('name')->get()->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'icon_emoji' => $category->icon_emoji,
                'type' => $category->type->value,
                'parent_name' => $category->parent?->name,
            ])->all(),
            'period_month' => $month->toDateString(),
            'totals' => [
                'limit' => (float) $cards->sum('limit_amount'),
                'spent' => (float) $cards->sum('spent'),
            ],
        ]);
    }

    public function store(BudgetStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['period_month'] = Carbon::parse($data['period_month'])->startOfMonth()->toDateString();

        $request->user()->budgets()->create($data);

        return back()->with('success', 'Budget created successfully.');
    }

    public function update(BudgetUpdateRequest $request, Budget $budget): RedirectResponse
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        $data = $request->validated();
        $data['period_month'] = Carbon::parse($data['period_month'])->startOfMonth()->toDateString();

        $budget->update($data);

        return back()->with('success', 'Budget updated successfully.');
    }

    public function destroy(Request $request, Budget $budget): RedirectResponse
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        $budget->delete();

        return back()->with('success', 'Budget deleted successfully.');
    }

    /**
     * @return array<int, int>
     */
    private function categoryAndDescendantIds(Category $category): array
    {
        $ids = [$category->id];

        foreach ($category->children()->get() as $child) {
            $ids = [...$ids, ...$this->categoryAndDescendantIds($child)];
        }

        return $ids;
    }
}
