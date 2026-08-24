import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FilterBar } from '@/components/reports/filter-bar';
import { TransactionsTable } from '@/components/reports/transactions-table';
import { TrendChart } from '@/components/reports/trend-chart';
import type { DonutChartDatum } from '@/components/tracker/donut-chart';
import { DonutChart } from '@/components/tracker/donut-chart';
import { StatCard } from '@/components/tracker/stat-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { index as reportsIndex } from '@/routes/reports';
import type { CategoryBreakdownSlice, ReportProps } from '@/types/tracker';

const CHART_COLORS = [
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)',
];

export default function ReportsIndex({
    filters,
    categories,
    summary,
    breakdown,
    trend,
    transactions,
    dynamic_columns,
}: ReportProps) {
    const [drilldown, setDrilldown] = useState<CategoryBreakdownSlice | null>(
        null,
    );

    const donutData = useMemo<DonutChartDatum[]>(() => {
        const source = drilldown ? drilldown.children : breakdown;
        return source.map((item, i) => ({
            label: item.name,
            value: item.total,
            emoji: item.icon_emoji,
            color: CHART_COLORS[i % CHART_COLORS.length],
        }));
    }, [drilldown, breakdown]);

    const donutTotal = drilldown
        ? drilldown.total
        : breakdown.reduce((sum, c) => sum + c.total, 0);

    function handleDonutSelect(datum: DonutChartDatum) {
        if (drilldown) {
            return;
        }
        const parent = breakdown.find((c) => c.name === datum.label);
        if (parent && parent.children.length > 0) {
            setDrilldown(parent);
        }
    }

    return (
        <>
            <Head title="Reports & Statements" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Reports &amp; Statements
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Deep dive into your spending over any period.
                    </p>
                </div>

                <FilterBar filters={filters} categories={categories} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Income"
                        value={formatCurrency(summary.income)}
                        emoji="💰"
                        variant="emerald"
                    />
                    <StatCard
                        label="Expense"
                        value={formatCurrency(summary.expense)}
                        emoji="💸"
                        variant="rose"
                    />
                    <StatCard
                        label="Asset maintenance"
                        value={formatCurrency(summary.asset_cost)}
                        emoji="🛠️"
                        variant="amber"
                    />
                    <StatCard
                        hero
                        label="Net"
                        value={formatCurrency(summary.net)}
                        emoji="📊"
                        sub="Income minus expenses"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex-row items-center justify-between">
                            <div>
                                <CardTitle>Expense by category</CardTitle>
                                <CardDescription>
                                    {drilldown
                                        ? drilldown.name
                                        : 'Click a slice to drill down'}
                                </CardDescription>
                            </div>
                            {drilldown && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setDrilldown(null)}
                                >
                                    <ArrowLeft className="size-4" />
                                    Back
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <DonutChart
                                data={donutData}
                                total={donutTotal}
                                onSelect={handleDonutSelect}
                            />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>
                                Expense vs. asset maintenance trend
                            </CardTitle>
                            <CardDescription>
                                Monthly comparison over the selected period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TrendChart data={trend} />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                        <CardDescription>
                            {dynamic_columns.length > 0
                                ? 'Custom fields for the selected categories are shown as extra columns.'
                                : 'Select categories with custom fields to expand this table.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TransactionsTable
                            transactions={transactions}
                            dynamicColumns={dynamic_columns}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: reportsIndex(),
        },
    ],
};
