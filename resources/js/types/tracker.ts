export type AccountType = 'cash' | 'bank' | 'credit';
export type CategoryType = 'income' | 'expense' | 'asset_maintenance';
export type TransactionType = 'income' | 'expense' | 'asset_log';
export type CustomFieldType = 'date' | 'number' | 'text' | 'checkbox';
export type AlertSeverity = 'critical' | 'warning' | 'ok';
export type BudgetStatus = 'ok' | 'warning' | 'over';

export interface CustomFieldDefinition {
    key: string;
    name: string;
    type: CustomFieldType;
    reminder: boolean;
    reminder_offset: number;
}

export interface AccountSummary {
    id: number;
    name: string;
    type: AccountType;
    icon_emoji: string | null;
    opening_balance: number;
    current_balance: number;
}

export interface CategoryNode {
    id: number;
    parent_id: number | null;
    name: string;
    type: CategoryType;
    icon_emoji: string;
    custom_field_definitions: CustomFieldDefinition[];
    children: CategoryNode[];
}

export interface CategoryOption {
    id: number;
    name: string;
    icon_emoji: string;
    type: CategoryType;
    parent_name: string | null;
}

export interface Balances {
    cash: number;
    bank: number;
    credit: number;
    total: number;
}

export interface MonthlySummary {
    label: string;
    income: number;
    expense: number;
    net: number;
}

export interface AlertItem {
    id: number;
    transaction_id: number;
    label: string;
    icon_emoji: string;
    category: string;
    target_date: string;
    days_remaining: number;
    severity: AlertSeverity;
    is_completed: boolean;
    reminder_offset_days: number;
}

export interface TransactionListItem {
    id: number;
    type: TransactionType;
    amount: number;
    transaction_date: string;
    description: string | null;
    category: { id: number; name: string; icon_emoji: string; parent_name: string | null };
    account: { id: number; name: string; type: AccountType; icon_emoji: string | null };
    dynamic_metadata: Record<string, string | number | boolean | null> | null;
}

export interface DailyGroup {
    date: string;
    label: string;
    total_income: number;
    total_expense: number;
    items: TransactionListItem[];
}

export interface CategoryBreakdownSlice {
    id: number;
    name: string;
    icon_emoji: string;
    total: number;
    percentage: number;
    children: { id: number; name: string; icon_emoji: string; total: number }[];
}

export interface CashFlowPoint {
    month: string;
    income: number;
    expense: number;
}

export interface DashboardProps {
    balances: Balances;
    accounts: AccountSummary[];
    monthly: MonthlySummary;
    alerts: AlertItem[];
    daily_summary: DailyGroup[];
    category_breakdown: CategoryBreakdownSlice[];
    cash_flow: CashFlowPoint[];
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface TransactionFilters {
    search: string | null;
    category_id: number | null;
    account_id: number | null;
    type: TransactionType | null;
    from: string | null;
    to: string | null;
}

export interface TransactionIndexProps {
    transactions: Paginated<TransactionListItem>;
    filters: TransactionFilters;
    accounts: AccountSummary[];
    categories: CategoryOption[];
    totals: { income: number; expense: number };
}

export interface TransactionFormProps {
    accounts: AccountSummary[];
    categoryTree: CategoryNode[];
    transaction: TransactionListItem | null;
}

export interface CategoryIndexProps {
    categoryTree: CategoryNode[];
    stats: Record<number, { transactions: number; total: number }>;
}

export interface AssetCard {
    transaction_id: number;
    title: string;
    icon_emoji: string;
    category: string;
    parent_category: string | null;
    description: string | null;
    logged_on: string;
    fields: { key: string; label: string; type: CustomFieldType; value: string | number | boolean | null }[];
    reminders: AlertItem[];
}

export interface PlannerProps {
    upcoming: AlertItem[];
    assets: AssetCard[];
    checklist: AlertItem[];
}

export interface BudgetCard {
    id: number;
    category: { id: number; name: string; icon_emoji: string };
    limit_amount: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: BudgetStatus;
}

export interface BudgetIndexProps {
    budgets: BudgetCard[];
    categories: CategoryOption[];
    period_month: string;
    totals: { limit: number; spent: number };
}

export interface ReportProps {
    filters: { from: string; to: string; category_ids: number[] };
    categories: CategoryOption[];
    summary: { income: number; expense: number; asset_cost: number; net: number };
    breakdown: CategoryBreakdownSlice[];
    trend: { month: string; expense: number; maintenance: number }[];
    transactions: TransactionListItem[];
    dynamic_columns: { key: string; label: string }[];
}
