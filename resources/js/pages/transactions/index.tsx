import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Heading from '@/components/heading';
import { EmptyState } from '@/components/tracker/empty-state';
import { TransactionFiltersBar } from '@/components/transactions/transaction-filters';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { create, index } from '@/routes/transactions';
import type { TransactionIndexProps } from '@/types/tracker';

export default function TransactionIndex({
    transactions,
    filters,
    accounts,
    categories,
    totals,
}: TransactionIndexProps) {
    const net = totals.income - totals.expense;

    return (
        <>
            <Head title="Transactions" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Transactions"
                        description="Every expense, income, and asset log entry in one ledger."
                    />
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="size-4" />
                            Add Transaction
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">
                                Income
                            </div>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(totals.income)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-rose-200 dark:border-rose-800">
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">
                                Expense
                            </div>
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {formatCurrency(totals.expense)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">
                                Net
                            </div>
                            <div
                                className={cn(
                                    'text-2xl font-bold',
                                    net >= 0
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400',
                                )}
                            >
                                {formatCurrency(net)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <TransactionFiltersBar
                    filters={filters}
                    accounts={accounts}
                    categories={categories}
                />

                {transactions.data.length === 0 ? (
                    <EmptyState
                        title="No transactions yet"
                        description="Add your first expense, income, or asset log entry to get started."
                        action={
                            <Button asChild>
                                <Link href={create.url()}>
                                    <Plus className="size-4" />
                                    Add Transaction
                                </Link>
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <TransactionTable transactions={transactions.data} />

                        {transactions.last_page > 1 && (
                            <nav className="flex flex-wrap items-center justify-center gap-1">
                                {transactions.links.map((link, idx) => (
                                    <Link
                                        key={`${link.label}-${idx}`}
                                        href={link.url ?? index.url()}
                                        preserveState
                                        preserveScroll
                                        className={cn(
                                            'rounded-md border border-border px-3 py-1.5 text-sm',
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-card text-foreground hover:bg-accent',
                                            !link.url &&
                                                'pointer-events-none opacity-40',
                                        )}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </nav>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

TransactionIndex.layout = {
    breadcrumbs: [{ title: 'Transactions', href: index() }],
};
