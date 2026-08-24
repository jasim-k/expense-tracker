<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $stats = $user->transactions()
            ->selectRaw('category_id, count(*) as transactions, sum(amount) as total')
            ->groupBy('category_id')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->category_id => ['transactions' => (int) $row->transactions, 'total' => (float) $row->total]]);

        return Inertia::render('categories/index', [
            'categoryTree' => $this->categoryTree($user->id),
            'stats' => $stats,
        ]);
    }

    public function store(CategoryStoreRequest $request): RedirectResponse
    {
        $request->user()->categories()->create($request->validated());

        return back()->with('success', 'Category created successfully.');
    }

    public function update(CategoryUpdateRequest $request, Category $category): RedirectResponse
    {
        abort_unless($category->user_id === $request->user()->id, 403);

        $category->update($request->validated());

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        abort_unless($category->user_id === $request->user()->id, 403);

        $cascade = $request->string('cascade')->toString() ?: 'reassign';

        DB::transaction(function () use ($category, $cascade, $request) {
            if ($cascade === 'delete') {
                $this->deleteRecursively($category);

                return;
            }

            $uncategorized = $request->user()->categories()->firstOrCreate(
                ['name' => 'Uncategorized', 'parent_id' => null],
                ['type' => $category->type->value, 'icon_emoji' => '🗂️']
            );

            $category->children()->update(['parent_id' => $uncategorized->id]);
            $category->transactions()->update(['category_id' => $uncategorized->id]);
            $category->delete();
        });

        return back()->with('success', 'Category deleted successfully.');
    }

    private function deleteRecursively(Category $category): void
    {
        foreach ($category->children()->get() as $child) {
            $this->deleteRecursively($child);
        }

        $category->transactions()->delete();
        $category->delete();
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
                'custom_field_definitions' => collect($category->custom_field_definitions ?? [])->map(fn (array $definition) => [
                    'key' => Category::fieldKey($definition),
                    'name' => $definition['name'],
                    'type' => $definition['type'],
                    'reminder' => (bool) ($definition['reminder'] ?? false),
                    'reminder_offset' => (int) ($definition['reminder_offset'] ?? 7),
                ])->all(),
                'children' => $categories->where('parent_id', $category->id)->map($normalize)->values()->all(),
            ];
        };

        return $categories->whereNull('parent_id')->map($normalize)->values()->all();
    }
}
