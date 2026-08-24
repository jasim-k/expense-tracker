<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Reminder;
use App\Models\Transaction;
use App\Models\User;
use App\Services\ReminderPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlannerController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $reminders = Reminder::query()
            ->where('user_id', $user->id)
            ->with('transaction.category')
            ->orderBy('target_date')
            ->get();

        return Inertia::render('planner/index', [
            'upcoming' => $reminders->where('is_completed', false)->map(fn (Reminder $reminder) => ReminderPresenter::toAlertItem($reminder))->values()->all(),
            'assets' => $this->assets($user),
            'checklist' => $reminders->map(fn (Reminder $reminder) => ReminderPresenter::toAlertItem($reminder))->values()->all(),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function assets(User $user): array
    {
        $transactions = $user->transactions()
            ->whereHas('category', fn ($query) => $query->where('type', 'asset_maintenance'))
            ->whereNotNull('dynamic_metadata')
            ->with(['category.parent', 'reminders'])
            ->orderByDesc('transaction_date')
            ->get();

        return $transactions->map(function (Transaction $transaction) {
            /** @var Category $category */
            $category = $transaction->category;
            $definitions = collect($category->custom_field_definitions ?? []);

            $fields = collect($transaction->dynamic_metadata ?? [])
                ->map(function ($value, string $key) use ($definitions) {
                    $definition = $definitions->first(fn (array $definition) => Category::fieldKey($definition) === $key);

                    return [
                        'key' => $key,
                        'label' => $definition['name'] ?? str($key)->headline()->toString(),
                        'type' => $definition['type'] ?? 'text',
                        'value' => $value,
                    ];
                })
                ->values()
                ->all();

            return [
                'transaction_id' => $transaction->id,
                'title' => $transaction->description ?: $category->name,
                'icon_emoji' => $category->icon_emoji,
                'category' => $category->name,
                'parent_category' => $category->parent?->name,
                'description' => $transaction->description,
                'logged_on' => $transaction->transaction_date->toDateString(),
                'fields' => $fields,
                'reminders' => $transaction->reminders->map(function (Reminder $reminder) use ($transaction) {
                    $reminder->setRelation('transaction', $transaction);

                    return ReminderPresenter::toAlertItem($reminder);
                })->all(),
            ];
        })->values()->all();
    }
}
