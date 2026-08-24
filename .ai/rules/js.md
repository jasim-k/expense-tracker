---
paths:
  - 'resources/js/**'
---

# Js

## resources/js/types/tracker.ts is the Inertia prop contract
Every tracker page's Inertia props are typed in resources/js/types/tracker.ts (DashboardProps, TransactionIndexProps, CategoryIndexProps, PlannerProps, BudgetIndexProps, ReportProps, ...). Controllers must serialize to these shapes exactly: money as JSON floats (cast with (float), not Eloquent decimal strings), dates as 'Y-m-d' strings. Change the interface and the controller together — the React pages have no runtime validation, so a drifted key fails silently as undefined.
