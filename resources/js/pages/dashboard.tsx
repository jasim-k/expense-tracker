import { Head, Link } from '@inertiajs/react';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AlertCard } from '@/components/tracker/alert-card';
import { AreaChart } from '@/components/tracker/area-chart';
import type { DonutChartDatum } from '@/components/tracker/donut-chart';
import { DonutChart } from '@/components/tracker/donut-chart';
import { EmptyState } from '@/components/tracker/empty-state';
import { StatCard } from '@/components/tracker/stat-card';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as createTransaction } from '@/routes/transactions';
import type {
    CategoryBreakdownSlice,
    DashboardProps,
    TransactionListItem,
} from '@/types/tracker';

const CHART_COLORS = [
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)',
];

function accountIcon(account: TransactionListItem['account']): string {
    if (account.icon_emoji) {
        return account.icon_emoji;
    }
    return account.type === 'cash'
        ? '💵'
        : account.type === 'bank'
          ? '🏦'
          : '💳';
}

export default function Dashboard({
    balances,
    monthly,
    alerts,
    daily_summary,
    category_breakdown,
    cash_flow,
}: DashboardProps) {
    const [drilldown, setDrilldown] = useState<CategoryBreakdownSlice | null>(
        null,
    );

    const donutData = useMemo<DonutChartDatum[]>(() => {
        const source = drilldown ? drilldown.children : category_breakdown;
        return source.map((item, i) => ({
            label: item.name,
            value: item.total,
            emoji: item.icon_emoji,
            color: CHART_COLORS[i % CHART_COLORS.length],
        }));
    }, [drilldown, category_breakdown]);

    const donutTotal = drilldown
        ? drilldown.total
        : category_breakdown.reduce((sum, c) => sum + c.total, 0);

    const handleDonutSelect = (datum: DonutChartDatum) => {
        if (drilldown) {
            return;
        }
        const parent = category_breakdown.find((c) => c.name === datum.label);
        if (parent && parent.children.length > 0) {
            setDrilldown(parent);
        }
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 pb-24 md:p-6">
                {/* Balance & Financial Status Card Bar */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        hero
                        label="Total Net Wealth"
                        value={formatCurrency(balances.total)}
                        emoji="💰"
                        sub="Across all active accounts"
                    />
                    <StatCard
                        label="Cash Balance"
                        value={formatCurrency(balances.cash)}
                        emoji="💵"
                        variant="emerald"
                    />
                    <StatCard
                        label="Bank Balance"
                        value={formatCurrency(balances.bank)}
                        emoji="🏦"
                        variant="purple"
                    />
                    <Card className="border">
                        <CardContent className="flex flex-col gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                                {monthly.label}
                            </span>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                        <TrendingUp className="size-3.5" />{' '}
                                        Income
                                    </span>
                                    <span className="text-lg font-bold text-foreground">
                                        {formatCurrency(monthly.income)}
                                    </span>
                                </div>
                                <div className="h-8 w-px bg-border" />
                                <div className="flex flex-col gap-0.5 text-right">
                                    <span className="flex items-center justify-end gap-1 text-xs text-rose-600 dark:text-rose-400">
                                        Expense{' '}
                                        <TrendingDown className="size-3.5" />
                                    </span>
                                    <span className="text-lg font-bold text-foreground">
                                        {formatCurrency(monthly.expense)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actionable Alerts & Reminders Widget */}
                {alerts.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-sm font-semibold text-foreground">
                            Actionable Alerts & Reminders
                        </h2>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {alerts.map((alert) => (
                                <AlertCard
                                    key={alert.id}
                                    emoji={alert.icon_emoji}
                                    label={alert.label}
                                    category={alert.category}
                                    targetDate={alert.target_date}
                                    daysRemaining={alert.days_remaining}
                                    severity={alert.severity}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Daily Expense Summary */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Daily Expense Summary</CardTitle>
                            <CardDescription>
                                Transactions grouped by day, most recent first.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {daily_summary.length === 0 ? (
                                <EmptyState
                                    emoji="🧾"
                                    title="No transactions yet"
                                    description="Log your first transaction to see your daily spending summary here."
                                    action={
                                        <Link
                                            href={createTransaction()}
                                            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
                                        >
                                            Add transaction
                                        </Link>
                                    }
                                />
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {daily_summary.map((group) => (
                                        <div
                                            key={group.date}
                                            className="flex flex-col gap-3"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {group.label}
                                                </span>
                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="text-emerald-600 dark:text-emerald-400">
                                                        +
                                                        {formatCurrency(
                                                            group.total_income,
                                                        )}
                                                    </span>
                                                    <span className="text-rose-600 dark:text-rose-400">
                                                        -
                                                        {formatCurrency(
                                                            group.total_expense,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2.5">
                                                {group.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between gap-3"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
                                                                {
                                                                    item
                                                                        .category
                                                                        .icon_emoji
                                                                }
                                                            </span>
                                                            <div className="flex min-w-0 flex-col">
                                                                <span className="truncate text-sm font-medium text-foreground">
                                                                    {item
                                                                        .category
                                                                        .parent_name
                                                                        ? `${item.category.parent_name} › ${item.category.name}`
                                                                        : item
                                                                              .category
                                                                              .name}
                                                                </span>
                                                                <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                                                    <span>
                                                                        {accountIcon(
                                                                            item.account,
                                                                        )}
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            item
                                                                                .account
                                                                                .name
                                                                        }
                                                                    </span>
                                                                    {item.description && (
                                                                        <span>
                                                                            &middot;{' '}
                                                                            {
                                                                                item.description
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                'shrink-0 text-sm font-semibold',
                                                                item.type ===
                                                                    'income' &&
                                                                    'text-emerald-600 dark:text-emerald-400',
                                                                item.type ===
                                                                    'expense' &&
                                                                    'text-rose-600 dark:text-rose-400',
                                                                item.type ===
                                                                    'asset_log' &&
                                                                    'text-muted-foreground',
                                                            )}
                                                        >
                                                            {item.type ===
                                                            'income'
                                                                ? '+'
                                                                : item.type ===
                                                                    'expense'
                                                                  ? '-'
                                                                  : ''}
                                                            {formatCurrency(
                                                                item.amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Interactive Analytics */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <CardTitle>
                                            Category Breakdown
                                        </CardTitle>
                                        <CardDescription>
                                            This month&apos;s expenses by
                                            category
                                        </CardDescription>
                                    </div>
                                    {drilldown && (
                                        <button
                                            type="button"
                                            onClick={() => setDrilldown(null)}
                                            className="text-xs font-medium text-primary hover:underline"
                                        >
                                            &larr; Back
                                        </button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <DonutChart
                                    data={donutData}
                                    total={donutTotal}
                                    centerLabel={
                                        drilldown
                                            ? drilldown.name
                                            : 'Total spent'
                                    }
                                    onSelect={handleDonutSelect}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cash Flow</CardTitle>
                                <CardDescription>
                                    Income vs. expense over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AreaChart
                                    data={cash_flow.map((p) => ({
                                        month: p.month,
                                        income: p.income,
                                        expense: p.expense,
                                    }))}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <Link
                href={createTransaction()}
                aria-label="Add transaction"
                className="fixed right-6 bottom-6 z-20 flex size-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/30 transition-transform hover:scale-105 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
            >
                <Plus className="size-6" />
            </Link>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
