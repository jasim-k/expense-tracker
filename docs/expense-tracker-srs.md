# Software Requirements Specification (SRS)
## Project Name: Personal Expense, Asset, and Document Tracker
### Technology Stack: Laravel 11, Inertia.js, React (TypeScript), Tailwind CSS

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional, non-functional, and database requirements for a comprehensive, self-hosted, offline-capable Personal Expense, Asset, and Document Tracker. This document serves as the single source of truth for developer handoff, specifically optimized for deployment and code generation in **Stitch** or other containerized Laravel environments.

### 1.2 Scope
The application is a unified web-based portal allowing users to:
1. Record and balance daily income and expenses across distinct payment methods (Physical Cash vs. Bank Accounts) [30, 39, 69].
2. Manage a hierarchical, self-referential category tree (Parent Categories and Subcategories) [31, 51].
3. Track personal assets (vehicles, machinery) and documents (passports, driver's licenses) using dynamic, custom metadata fields assigned per subcategory [57].
4. Schedule automated push, browser, and email reminders for critical dates (e.g., tyre rotation dates, vehicle service intervals, passport expiration) with customizable thresholds.

### 1.3 Key Source Grounding
- **Payment Mode Separation**: The core ledger enforces strict isolation of **Physical Cash** and **Bank/Digital Accounts** to support true real-time cash flow reconciliation [39, 51, 69].
- **Relational Integrity**: Designed using a normalized database structure featuring cascaded deletes on user data, positive constraint checks, and composite uniqueness [31, 32].

---

## 2. Tech Stack Architecture

The application is architected around a monolithic **Single Page Application (SPA)** framework that delivers a desktop-like user experience without the complexity of a disconnected REST/GraphQL API.

```
┌────────────────────────────────────────────────────────┐
│                        BROWSER                         │
│  React SPA (TypeScript, Tailwind CSS, Lucide Icons)     │
└───────────────────────────▲────────────────────────────┘
                            │
                    HTTP / JSON Bridge
                    (Inertia.js Assets)
                            │
┌───────────────────────────▼────────────────────────────┐
│                    LARAVEL BACKEND                     │
│  Controllers, Eloquent ORM, Scheduler, Notifications    │
└───────────────────────────▲────────────────────────────┘
                            │
                    SQL / JSONB Queries
                            │
┌───────────────────────────▼────────────────────────────┐
│                  RELATIONAL DATABASE                   │
│         PostgreSQL 16 / MariaDB 10.11 (JSONB)          │
└────────────────────────────────────────────────────────┘
```

### 2.1 Backend: Laravel 11
- **Controllers**: Thin controllers utilizing Form Requests for validation.
- **ORM (Eloquent)**: Maps relationships, handles dynamic data serialization, and implements Soft Deletes (`deleted_at` timestamps) to preserve audit trails [32, 49].
- **Notification Services**: Laravel Notification channels (Mail, Database, WebPush) driven by a background queue (`database` or `redis` driver) to execute automatic reminders.

### 2.2 Frontend Bridge: Inertia.js
- Serves as the modern glue between Laravel's routing/controllers and React views.
- Eliminates standard API routing, CORS configuration, and state synchronization issues.
- Hydro-serializes server-side data models and handles seamless page transitions without page reloads [41].

### 2.3 Frontend: React 18 & TypeScript
- Styled with **Tailwind CSS** using a unified deep-purple palette [41].
- Powered by interactive visual tools including Recharts (for monthly cash flow trendlines, category breakdown donut charts, and visual progress gauges) [30, 39].

### 2.4 Database: Relational with JSONB/JSON support
- Configured to run on **PostgreSQL** or **MariaDB** to leverage JSON/JSONB fields [31, 32]. 
- This enables a "Dynamic Property Engine" where users can define customized attributes (e.g., "Tyre Change Date" or "Passport Expiry") for specific subcategories without requiring database schema migrations.

---

## 3. Functional Requirements

### 3.1 Ledger & Transaction Management
- **FR-1.1 (Dual Balance Tracking)**: The system must track balances across separate accounts, specifically dividing financial liquid wealth into **Physical Cash in Hand** and **Bank/Digital Accounts** [39, 51, 69].
- **FR-1.2 (Strict Positivity Validation)**: All transaction input forms must validate that transaction amounts are positive numbers strictly greater than zero [32].
- **FR-1.3 (Automated Cash Flow Reconciliation)**: When a transaction is logged under Cash, the Physical Cash balance increments (if Income) or decrements (if Expense) instantly [40]. Digital accounts must update analogously.
- **FR-1.4 (Daily/Category Grouping)**: The main dashboard must present a list aggregating transaction summaries on a daily basis, showing exactly which category (with its emoji marker) and account (Cash vs. Bank) was used [39, 40, 69].

### 3.2 Hierarchical Category Manager
- **FR-2.1 (Nested Categories)**: Users can define nested parent-to-child relationships (e.g., Parent: `Vehicles` -> Child: `Tyre Maintenance`; Parent: `Personal Documents` -> Child: `Passport Expiration`) [31, 51].
- **FR-2.2 (Category Meta Configuration)**: Every category and subcategory must support custom configuration parameters:
  - Custom Emoji (e.g., 🚗, ✈️, 🍔) for rapid dashboard scanning [39, 40].
  - Type Flag: Explicit indicator defining whether the category tracks `Income`, `Expense`, or `Asset/Document Maintenance`.
- **FR-2.3 (Cascade Controls)**: Deleting a Parent Category must trigger Cascade options: either moving all child subcategories and transactions to an "Uncategorized" bucket, or recursively deleting all children [32].

### 3.3 Dynamic Fields Engine (The "What Fields Inside" Feature)
To support diverse tracking requirements (Passport, Tires, Licences), the app does not restrict subcategories to plain comments.
- **FR-3.1 (Metadata Schema Definition)**: Users can assign a list of custom fields to any subcategory. Field types include:
  - `Date` (for service dates, tyre changes, passport renewals).
  - `Number` (for mileage, tire pressure, service costs).
  - `Text` (for serial numbers, passport numbers, registration IDs).
- **FR-3.2 (Dynamic Form Injection)**: When a user selects a subcategory in the Transaction Logger, the UI must dynamically inject the mapped Custom Fields into the input interface.
- **FR-3.3 (JSON Storage)**: Dynamic inputs must serialize as key-value pairs inside a single JSON/JSONB column in the transactions/records database.

### 3.4 Reminder & Alerts Engine
- **FR-4.1 (Reminder Association)**: Any custom field of type `Date` must support a "Need Reminder" checkbox.
- **FR-4.2 (Threshold Setting)**: Users can define custom alert offsets (e.g., "Remind me 30 days before Passport Expiration" or "Remind me 3 days before Vehicle Servicing Date").
- **FR-4.3 (Automatic Queue Trigger)**: A nightly Laravel scheduled command (`Schedule::command('reminders:send')`) checks for approaching dates and dispatches notification jobs.

---

## 4. Database Schema & Eloquent Migrations

To implement the self-referential categories and dynamic dynamic fields, we employ a highly optimized 7-table schema with JSONB dynamic attributes.

```
               ┌──────────────┐
               │    users     │
               └──────┬───────┘
                      │ 1
                      ├───────────────────────┐
                      │ Many                  │ Many
               ┌──────▼───────┐        ┌──────▼───────┐
               │   accounts   │        │  categories  │ (Self-referential Parent-Child)
               └──────┬───────┘        └──────┬───────┘
                      │ 1                     │ 1
                      │                       │
                      │ Many   ┌──────────────┐ Many
                      ├───────►│ transactions │◄──────┘
                      │        └──────┬───────┘
                      │               │ 1 (Dynamic properties stored in metadata JSONB)
                      │               │
                      │               │ Many
                      │        ┌──────▼───────┐
                      └───────►│   reminders  │
                               └──────────────┘
```

### 4.1 `users` Table
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('username')->unique();
    $table->string('email')->unique();
    $table->string('password'); // Hashed using Bcrypt [30, 32]
    $table->rememberToken();
    $table->timestamps();
});
```

### 4.2 `accounts` Table
Tracks liquid wealth categories (Cash vs. Bank) [39, 51, 69].
```php
Schema::create('accounts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Strict user isolation [32]
    $table->string('name'); // e.g., 'Physical Cash', 'HDFC Bank Account'
    $table->string('type')->default('bank'); // 'cash', 'bank', 'credit'
    $table->decimal('opening_balance', 12, 2)->default(0.00); [40]
    $table->decimal('current_balance', 12, 2)->default(0.00); [40]
    $table->string('icon_emoji')->nullable(); // e.g., 💵, 🏦 [39]
    $table->timestamps();
    $table->softDeletes(); // Audit trail and data recovery support [32]
});
```

### 4.3 `categories` Table
Self-referential table mapping hierarchical parent-to-child relationships [31, 51].
```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->unsignedBigInteger('parent_id')->nullable(); // Self-referential FK [31]
    $table->string('name'); // e.g., 'Vehicles', 'Tire Change'
    $table->string('type'); // 'income', 'expense', 'asset_maintenance'
    $table->string('icon_emoji')->default('📁'); // Custom visual categorizing [40]
    $table->jsonb('custom_field_definitions')->nullable(); // Defines dynamic fields (e.g., [{"name": "Tyre Brand", "type": "text"}, {"name": "Service Date", "type": "date"}])
    $table->timestamps();
    $table->softDeletes();

    $table->foreign('parent_id')->references('id')->on('categories')->onDelete('cascade');
    $table->unique(['user_id', 'parent_id', 'name']); // Prevent identical siblings [32]
});
```

### 4.4 `transactions` Table
Core transactional entries. Incorporates JSONB dynamic metadata for custom properties.
```php
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('account_id')->constrained()->onDelete('cascade'); // e.g. Cash vs Bank [39, 69]
    $table->foreignId('category_id')->constrained()->onDelete('cascade'); // Dynamic category link [31]
    $table->decimal('amount', 12, 2); // Handles high values and currency [23, 32]
    $table->date('transaction_date'); // Date picking [39]
    $table->text('description')->nullable(); // Memo details [38]
    $table->jsonb('dynamic_metadata')->nullable(); // dynamic custom field inputs (e.g., {"tyre_brand": "Michelin", "service_date": "2026-08-23"})
    $table->timestamps();
    $table->softDeletes();

    // Database constraints and indexing [32]
    $table->index(['user_id', 'transaction_date']);
});
```

### 4.5 `reminders` Table
Allows tracking triggers associated with custom metadata fields.
```php
Schema::create('reminders', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('transaction_id')->constrained()->onDelete('cascade'); // Tied to the logged item
    $table->string('trigger_field_key'); // e.g., 'service_date'
    $table->date('target_date'); // Extracted date value
    $table->integer('reminder_offset_days')->default(7); // Days before target_date to alert
    $table->boolean('is_completed')->default(false);
    $table->timestamps();
    
    $table->index(['target_date', 'is_completed']);
});
```

---

## 5. Web Routes & Controller Blueprints

### 5.1 Route Mapping (`routes/web.php`)
```php
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ReminderController;

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Transactions with dynamic dynamic field resolution
    Route::resource('transactions', TransactionController::class);
    
    // Categories & Subcategories Config
    Route::resource('categories', CategoryController::class);
    
    // Reminders controls
    Route::get('/reminders', [ReminderController::class, 'index'])->name('reminders.index');
    Route::post('/reminders/{reminder}/complete', [ReminderController::class, 'markComplete'])->name('reminders.complete');
});
```

### 5.2 Laravel Controller & React Render (Laravel/Inertia/React Example)
```php
namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Account;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function create()
    {
        return Inertia::render('Transactions/Create', [
            'accounts' => auth()->user()->accounts()->get(['id', 'name', 'type', 'current_balance']),
            'categories' => auth()->user()->categories()
                ->whereNull('parent_id')
                ->with('children')
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id,user_id,' . auth()->id(),
            'category_id' => 'required|exists:categories,id,user_id,' . auth()->id(),
            'amount' => 'required|numeric|gt:0', // Validating positive entries only [32]
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:500',
            'dynamic_metadata' => 'nullable|array' // Dynamics mapping
        ]);

        $transaction = auth()->user()->transactions()->create($validated);

        // Auto-reconcile balances [40]
        $account = Account::find($request->account_id);
        $category = Category::find($request->category_id);

        if ($category->type === 'expense' || $category->type === 'asset_maintenance') {
            $account->decrement('current_balance', $request->amount);
        } else if ($category->type === 'income') {
            $account->increment('current_balance', $request->amount);
        }

        // If custom fields contain an active reminder date, spawn reminder instance
        if ($request->has('dynamic_metadata')) {
            foreach ($request->dynamic_metadata as $key => $value) {
                // Check if category definition has a reminder on this field
                $fieldDef = collect($category->custom_field_definitions)->firstWhere('name', $key);
                if ($fieldDef && ($fieldDef['reminder'] ?? false) && strtotime($value)) {
                    $transaction->reminders()->create([
                        'user_id' => auth()->id(),
                        'trigger_field_key' => $key,
                        'target_date' => $value,
                        'reminder_offset_days' => $fieldDef['reminder_offset'] ?? 7
                    ]);
                }
            }
        }

        return redirect()->route('dashboard')->with('success', 'Transaction registered and balanced successfully.');
    }
}
```

---

## 6. Frontend View Components & Hydration (Inertia React)

Below is the design spec for the React Component layout and state injection system.

### 6.1 Unified Global Shared Props (`HandleInertiaRequests.php`)
Every dashboard view automatically receives current state to render global navigation and current active wallets:
```php
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user(),
        ],
        'balances' => $request->user() ? [
            'cash' => $request->user()->accounts()->where('type', 'cash')->sum('current_balance'),
            'bank' => $request->user()->accounts()->where('type', 'bank')->sum('current_balance'),
            'total' => $request->user()->accounts()->sum('current_balance'),
        ] : null,
        'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ]
    ]);
}
```

### 6.2 Page Rendering Checklist:
1. **`Dashboard/Index.jsx`**: Receives `balances` and monthly cash flows. Renders a unified financial summary chart along with the next 5 upcoming maintenance dates and document expirations.
2. **`Transactions/Create.jsx`**: A reactive form. Features client-side validation using Inertia’s `useForm` hook:
   - Evaluates the selected subcategory.
   - Loops through `category.custom_field_definitions` and renders dynamic input elements matching each field type (e.g., date picker with optional calendar scheduler).
3. **`AssetDashboard/Index.jsx`**: Compiles dynamic attributes across all transactions (e.g., maps all vehicles, tracks passport validity statuses, and flags tyre wear dates based on last service dates) and renders warning notifications.

---

## 7. Developer Handoff Instruction Prompts

You can use the following prompts to quickly bootstrap this Laravel + Inertia setup in code generators.

### Handoff Prompt 1: Database Setup and Migrations
> **Prompt**: Create the complete database migration file set for a Laravel 11 application based on an expense, asset, and document tracking schema. Provide five migrations: 1. `users` table with standard login fields. 2. `accounts` table with fields `id`, `user_id`, `name`, `type` (cash or bank), `opening_balance`, `current_balance`, and soft deletes. 3. `categories` table which is self-referential with `parent_id` foreign key, `icon_emoji`, and a `custom_field_definitions` JSONB column. 4. `transactions` table containing `account_id`, `category_id`, `amount` (validated positive only), `transaction_date`, and a `dynamic_metadata` JSONB column for custom variables. 5. `reminders` table linking a transaction to an automated target date and reminder offsets. Provide model files with complete relationships (HasMany, BelongsTo, self-referential child relationships, and soft delete traits).

### Handoff Prompt 2: Transaction Controller and Dyn-field Engine
> **Prompt**: Write a Laravel 11 resource controller (`TransactionController.class`) that utilizes Inertia.js to render React SPA forms. The controller must support: 1. Fetching accounts and nested categories. 2. Validating numeric amounts to prevent negative inputs. 3. Overriding accounts to increment/decrement balances automatically on purchase logs. 4. Dynamic validation and extraction of key-value pairs inside `dynamic_metadata` JSONB columns. 5. Spawning database alerts inside a `reminders` table if a dynamic custom field of date type contains an active reminder trigger.

### Handoff Prompt 3: Transaction Dynamic Form React Component
> **Prompt**: Build a React front-end page (`Transactions/Create.tsx`) using TypeScript, Tailwind CSS, and Inertia.js `useForm` hook for logging transactions. Renders a dark-purple theme UI. It contains input fields for amount (with positive validation), transaction date, parent category dropdown, and subcategory dropdown. When a subcategory is selected, inspect `subcategory.custom_field_definitions` array and dynamically map form inputs: dates should render calendar pickers with custom toggle switches for "Need Reminder", numbers should render mileage/unit fields, and text fields should render clean text inputs. Ensure everything binds cleanly to the `data.dynamic_metadata` nested React state object and submits via Inertia post request.
