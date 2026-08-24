<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlannerController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('transactions', TransactionController::class);

    Route::resource('categories', CategoryController::class)->except('show');

    Route::resource('accounts', AccountController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('budgets', BudgetController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::get('planner', [PlannerController::class, 'index'])->name('planner.index');

    Route::get('reminders', [ReminderController::class, 'index'])->name('reminders.index');
    Route::post('reminders/{reminder}/complete', [ReminderController::class, 'markComplete'])->name('reminders.complete');
    Route::delete('reminders/{reminder}', [ReminderController::class, 'destroy'])->name('reminders.destroy');

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [ReportController::class, 'export'])->name('reports.export');
});

require __DIR__.'/settings.php';
