<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use App\Services\ReminderPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReminderController extends Controller
{
    public function index(Request $request): Response
    {
        $reminders = Reminder::query()
            ->where('user_id', $request->user()->id)
            ->with('transaction.category')
            ->orderBy('target_date')
            ->get();

        return Inertia::render('reminders/index', [
            'reminders' => $reminders->map(fn (Reminder $reminder) => ReminderPresenter::toAlertItem($reminder))->all(),
        ]);
    }

    public function markComplete(Request $request, Reminder $reminder): RedirectResponse
    {
        abort_unless($reminder->user_id === $request->user()->id, 403);

        $reminder->update(['is_completed' => ! $reminder->is_completed]);

        return back()->with('success', 'Reminder updated.');
    }

    public function destroy(Request $request, Reminder $reminder): RedirectResponse
    {
        abort_unless($reminder->user_id === $request->user()->id, 403);

        $reminder->delete();

        return back()->with('success', 'Reminder deleted.');
    }
}
