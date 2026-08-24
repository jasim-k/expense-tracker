# Daily Expense Tracker - Page Design & UI Requirements (v2)

This document is optimized for page builders and AI-driven UI generators (such as v0.dev, Stitch, Lovable, Bolt.new, or Cursor). It outlines the core layouts, component specifications, and interaction flows required to design a personal finance and asset maintenance tracking web application.

This updated version (v2) introduces **hierarchical sub-categories**, **dynamic custom fields** (for vehicles, documents, etc.), and **automated reminder notifications** for service dates, tire changes, and document expirations (licences/passports).

---

## 1. Application Architecture, Theme & Navigation
- **UI Theme**: Modern, minimalist, and user-friendly interface. A beautiful **purple-themed clean design** is recommended (with support for both **Light and Dark Modes**) to ensure accessibility and professional appeal.
- **Layout Structure**: 
  - **Desktop**: Left-aligned sidebar with navigation icons, search, and profile indicators.
  - **Mobile**: Responsive layout featuring a bottom tab bar navigation for instant reachability.
- **State Management & Reminders**: Offline-first performance utilizing local storage/database for instantaneous updates, integrated with local browser push notifications or custom notification banners for time-sensitive reminders (e.g., expirations).
- **Hierarchical Categories**: Support for a parent-child category structure (e.g., Parent Category: *Vehicles* 🚗 -> Sub-category: *SUV* or *Sedan*).
- **Dynamic Field Schemas**: Allows users to attach customized fields (dates, texts, toggle checklists) to specific sub-categories.

---

## 2. Page-by-Page Specifications

### Page 1: Dashboard (Main Screen)
The central hub for financial health and upcoming actionable alerts, showing current wealth distribution, today’s spending, and upcoming reminders.

#### UI Components:
1. **Balance & Financial Status Card Bar**:
   - **Total Net Wealth Tile**: Automatic real-time calculation of all active accounts.
   - **Cash Balance Tile**: Dedicated card displaying physical cash in hand.
   - **Bank Account Balance Tile**: Card detailing funds in bank accounts/UPI/wallets.
   - **Monthly Summary Indicator**: A side-by-side indicator showing **Total Income** versus **Total Expense** for the current month.
2. **Actionable Alerts & Reminders Widget (New)**:
   - High-priority carousel or list displaying critical upcoming deadlines:
     - *e.g., "⚠️ Passport expires in 30 days (Sept 22, 2026)"*
     - *e.g., "🚗 Vehicle service due on Aug 30, 2026 (7 days left)"*
3. **Quick Action Button**:
   - Floating Action Button (FAB) styled in high-contrast purple, launching the **Transaction Logger Form**.
4. **Daily Expense Summary (Category-wise Aggregation)**:
   - A list grouped by date (specifically showing **Today's Expenses**).
   - Each item displays the parent and sub-category names (with corresponding emojis), total amount, and the payment method used.
5. **Interactive Analytics Chart**:
   - A donut/pie chart displaying the current month's **Category-wise Expense Breakdown** (hovering shows percentages, totals, and nested sub-categories).

---

### Page 2: Transaction Logger & Asset Log (Form View)
An intuitive, fast input modal or page designed to record financial transactions OR asset-specific logs (like document details, service records, and tire change milestones).

#### Form Fields & Validations:
1. **Transaction Type Toggle**:
   - Segmented control / switch to select between **Expense** (Default, Red) and **Income** (Green).
2. **Amount Input**:
   - Clean, numeric input with large typography. Enforces validation for **positive amounts only** (cannot be negative or zero).
3. **Date Picker**:
   - Calendar selector pre-populated to the **current date** but allowing selection of past or future dates.
4. **Hierarchical Category Selector**:
   - Nested dropdown or dual-column grid. Selecting a parent category (e.g., *Automobile*) filters and reveals its child sub-categories (e.g., *Sedan*, *Tyre Maintenance*).
5. **Dynamic Customizable Fields Panel (Conditional / New)**:
   - When specific parent/sub-categories are selected, a **Custom Fields Section** dynamically appears:
     - **If "Documents" is selected**: Shows text inputs for "Document ID/No." and date picker for **"Expiry Date"** with a **"Set Reminder" Toggle** (e.g., Remind me 30/60/90 days before).
     - **If "Vehicles" or "Maintenance" is selected**: Shows inputs for "Odometer (km)", date picker for **"Last Service Date"**, and date picker for **"Tyre Change Date"**, each with **"Set Reminder" Toggles**.
6. **Payment Method Selector**:
   - Select field with options: **Cash** or **Bank/Account** to isolate where funds are drawn from.
7. **Description / Notes**:
   - Text area for adding memo notes, mileage, or attaching receipts/scanned document copies.

---

### Page 3: Category & Customizable Field Builder
A settings panel allowing full customization of the app hierarchy and database schema without writing code.

#### UI Components:
1. **Category Hierarchical Tree View**:
   - Interactive list of parent categories that can be collapsed/expanded to view sub-categories.
2. **Add Sub-Category Form**:
   - Dropdown to select **Parent Category**.
   - Input for **Sub-Category Name** (with emoji icon selector).
3. **Dynamic Field Schema Designer (New)**:
   - Within any sub-category edit screen, the user can click **"+ Add Custom Field"** to define what "fields inside" the logger should collect:
     - **Field Name Label** (e.g., *Expiry Date*, *Tire Lifetime*, *Document Number*).
     - **Field Type Selection**:
       - `Date` (Includes a checkbox: **[x] Enable Push Reminder notifications**)
       - `Number` (e.g., mileage, cost)
       - `Text` (e.g., serial number, notes)
       - `Checkbox` (e.g., Completed inspection?)

---

### Page 4: Document Expiry & Vehicle Maintenance Planner (New Page)
A dedicated management screen for non-recurring or milestone tracking tasks that have expiration or service deadlines, ensuring important assets and documents are never overlooked.

#### UI Components:
1. **Asset Cards Grid (e.g., Vehicles, Passports, Licences)**:
   - **Vehicle Card**: Displays current odometer reading, **"Last Serviced on [Date]"** indicator, and **"Next Tire Change due on [Date]"** badge.
   - **Passport Card**: Displays Passport Number, Holder Name, and a large color-coded visual indicator of **"Days until Expiry"** (Green > 180 days, Orange 30-180 days, Red < 30 days).
   - **Licence Card**: Displays driver's licence details and renewal notifications.
2. **Reminders & Push Notification Control Panel**:
   - Toggle switches to customize reminder frequency:
     - Send browser push alert on day of expiration.
     - Send early warnings: 1 week before, 1 month before, 3 months before.
3. **Pending Checklists Tracker**:
   - Simple list of checklist tasks (e.g., "Renew vehicle registration", "Rotate tires", "Pay passport renewal fees").

---

### Page 5: Budget Planner & Progress Tracker
Allows users to set monthly spending limits per category (or sub-category) to avoid overspending and promote financial discipline.

#### UI Components:
1. **Budget Creation Form**:
   - Category / Sub-category dropdown, Month/Year selector, and Monthly spending limit.
2. **Category Progress Cards**:
   - Each card represents a category with a visual **real-time progress bar**:
     - Green: Spending is under 70% of the limit.
     - Yellow: Spending is between 70% - 90% of the limit.
     - Red (Over-budget Alert): Exceeds 100%, triggering an urgent notification warning the user of the overage.

---

### Page 6: Comprehensive Reports & Statements
Allows deep dive analysis of spending patterns over specific time periods.

#### UI Components:
1. **Date Range & Category Filter Bar**:
   - Select multiple parents/sub-categories to filter transaction lists.
2. **Analytical Visualization Suite**:
   - **Expense-by-Category Pie Chart** (supports drill-down: clicking a parent category displays sub-category distribution).
   - **Trend Line Chart**: Separates regular expenses from asset maintenance costs over time.
3. **Transaction & Log Table**:
   - Dynamic columns that automatically show custom fields (like Expiry Date or Odometer reading) when the relevant category filter is active.
4. **Statement Exporter**:
   - Instant "Export Statement" button to download data as a clean CSV/JSON report.

---

## 3. Prompts for AI Page Builders (Copy & Paste ready)

You can copy the instructions below directly into your AI generator (Stitch, v0, Bolt, etc.) to build each component.

### Prompt 1: Dynamic Transaction Logger with Custom Fields (v0 / Bolt / Stitch)
> **Prompt**: Create a modal form using Tailwind CSS and Lucide Icons for "Add Transaction/Asset Log" in a deep-purple themed personal app. At the top, put a toggle for "Expense vs Income vs Asset Log". Include inputs for: Amount (positive numbers only), Transaction Date (defaults to today), and a nested Category/Sub-category dropdown (e.g., Vehicles -> Tyre Change, Documents -> Passport Renewal). Implement dynamic conditional logic: if a sub-category under "Documents" is selected, dynamically slide open a card with input fields for "Document Reference Number" and "Expiry Date" with a "Set Expiration Reminder" toggle. If a sub-category under "Vehicles" is selected, dynamically show fields for "Current Odometer (km)", "Last Serviced Date", and a "Need Reminder Checklist". Style it with purple borders, clean transitions, and interactive visual toggles.

### Prompt 2: Category & Custom Fields Schema Builder (v0 / Bolt / Stitch)
> **Prompt**: Design a responsive settings interface for a "Hierarchical Category and Schema Builder" using Tailwind CSS. The left column should show a clean tree view of Parent Categories (e.g., Vehicles, Documents, Food) and their Sub-categories (e.g., SUV, Passport, Grocery). Clicking on a category or sub-category highlights it and loads its details in the right column. In the right column, design a form to edit the category name, assign an emoji, and manage a list of dynamic custom fields. Users can click "+ Add Custom Field" to open an inline form to add a field with a Name label (e.g., "Tire Change Date") and a Type selector (Date, Number, Text, Checkbox) with a checkbox option for "Enable automated push reminders". Style it with a premium, purple-themed dark/light mode layout.

### Prompt 3: Asset Maintenance & Document Expiry Dashboard (v0 / Bolt / Stitch)
> **Prompt**: Create a clean, premium dashboard panel titled "Documents & Maintenance Planner" with a deep purple styling theme. At the top, display an "Upcoming Urgent Reminders" widget showing three cards: "Passport Expiry" (showing 42 days left, highlighted in orange), "Vehicle Tyre Change Date" (due in 5 days, blinking red badge), and "Driver's Licence Renewal" (due in 180 days, highlighted in green). Below this, display a list of active vehicles with metadata: "Model: Toyota RAV4", "Last Service: July 12, 2026", "Next Service Due: Sept 30, 2026 (Need Reminder toggled on)". Add a simple, responsive checklist widget where users can tick off pending tasks, and include a floating purple action button labeled "Add Document/Asset Card".
