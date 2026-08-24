import { EmptyState } from '@/components/tracker/empty-state';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ReportProps } from '@/types/tracker';

interface TransactionsTableProps {
    transactions: ReportProps['transactions'];
    dynamicColumns: ReportProps['dynamic_columns'];
}

function formatDynamicValue(
    value: string | number | boolean | null | undefined,
): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }
    if (typeof value === 'boolean') {
        return value ? '✓' : '✗';
    }
    return String(value);
}

/**
 * Transaction/log table. Columns expand to include `dynamic_columns` — reading
 * each row's `dynamic_metadata[key]` — when the active filter selects
 * categories that define custom fields.
 */
export function TransactionsTable({
    transactions,
    dynamicColumns,
}: TransactionsTableProps) {
    if (transactions.length === 0) {
        return (
            <EmptyState
                emoji="🧾"
                title="No transactions in range"
                description="Try widening the date range or clearing category filters."
            />
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-max text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Category</th>
                        <th className="px-4 py-2.5">Account</th>
                        <th className="px-4 py-2.5">Description</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                        {dynamicColumns.map((col) => (
                            <th key={col.key} className="px-4 py-2.5">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
                        <tr
                            key={tx.id}
                            className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                            <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                                {formatDate(tx.transaction_date)}
                            </td>
                            <td className="px-4 py-2.5">
                                <span className="inline-flex items-center gap-1.5">
                                    <span>{tx.category.icon_emoji}</span>
                                    {tx.category.parent_name
                                        ? `${tx.category.parent_name} / `
                                        : ''}
                                    {tx.category.name}
                                </span>
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                                {tx.account.name}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                                {tx.description ?? '—'}
                            </td>
                            <td
                                className={cn(
                                    'px-4 py-2.5 text-right font-medium whitespace-nowrap',
                                    tx.type === 'income'
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-foreground',
                                )}
                            >
                                {tx.type === 'income' ? '+' : '-'}
                                {formatCurrency(tx.amount)}
                            </td>
                            {dynamicColumns.map((col) => (
                                <td
                                    key={col.key}
                                    className="px-4 py-2.5 whitespace-nowrap text-muted-foreground"
                                >
                                    {formatDynamicValue(
                                        tx.dynamic_metadata?.[col.key],
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
