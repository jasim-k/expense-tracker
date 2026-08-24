import { Link, router } from '@inertiajs/react';
import { Pencil, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { destroy, edit } from '@/routes/transactions';
import type { TransactionListItem } from '@/types/tracker';

interface TransactionTableProps {
    transactions: TransactionListItem[];
}

const TYPE_STYLES: Record<TransactionListItem['type'], string> = {
    expense: 'text-rose-600 dark:text-rose-400',
    income: 'text-emerald-600 dark:text-emerald-400',
    asset_log: 'text-violet-600 dark:text-violet-400',
};

function AmountLabel({ transaction }: { transaction: TransactionListItem }) {
    const sign =
        transaction.type === 'income'
            ? '+'
            : transaction.type === 'expense'
              ? '-'
              : '';
    return (
        <span className={cn('font-semibold', TYPE_STYLES[transaction.type])}>
            {sign}
            {formatCurrency(transaction.amount)}
        </span>
    );
}

function hasDynamicMetadata(transaction: TransactionListItem): boolean {
    return Boolean(
        transaction.dynamic_metadata &&
        Object.keys(transaction.dynamic_metadata).length > 0,
    );
}

export function TransactionTable({ transactions }: TransactionTableProps) {
    const [pendingDelete, setPendingDelete] =
        useState<TransactionListItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = () => {
        if (!pendingDelete) {
            return;
        }
        setDeleting(true);
        router.delete(destroy.url(pendingDelete.id), {
            onFinish: () => {
                setDeleting(false);
                setPendingDelete(null);
            },
        });
    };

    return (
        <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Account</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {transactions.map((transaction) => (
                            <tr
                                key={transaction.id}
                                className="hover:bg-accent/40"
                            >
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                    {formatDate(transaction.transaction_date)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span aria-hidden>
                                            {transaction.category.icon_emoji}
                                        </span>
                                        <span>
                                            {transaction.category
                                                .parent_name && (
                                                <span className="text-muted-foreground">
                                                    {
                                                        transaction.category
                                                            .parent_name
                                                    }{' '}
                                                    ›{' '}
                                                </span>
                                            )}
                                            {transaction.category.name}
                                        </span>
                                        {hasDynamicMetadata(transaction) && (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-300"
                                            >
                                                <Sparkles className="size-3" />{' '}
                                                Details
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                                    {transaction.description ?? '—'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1">
                                        <span aria-hidden>
                                            {transaction.account.icon_emoji ??
                                                '💳'}
                                        </span>
                                        {transaction.account.name}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <AmountLabel transaction={transaction} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                        >
                                            <Link
                                                href={edit.url(transaction.id)}
                                            >
                                                <Pencil className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setPendingDelete(transaction)
                                            }
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile stacked cards */}
            <div className="space-y-3 md:hidden">
                {transactions.map((transaction) => (
                    <div
                        key={transaction.id}
                        className="rounded-lg border border-border bg-card p-4"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lg" aria-hidden>
                                    {transaction.category.icon_emoji}
                                </span>
                                <div>
                                    <div className="text-sm font-medium">
                                        {transaction.category.parent_name && (
                                            <span className="text-muted-foreground">
                                                {
                                                    transaction.category
                                                        .parent_name
                                                }{' '}
                                                ›{' '}
                                            </span>
                                        )}
                                        {transaction.category.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatDate(
                                            transaction.transaction_date,
                                        )}
                                    </div>
                                </div>
                            </div>
                            <AmountLabel transaction={transaction} />
                        </div>
                        {transaction.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {transaction.description}
                            </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {transaction.account.icon_emoji ?? '💳'}{' '}
                                    {transaction.account.name}
                                </span>
                                {hasDynamicMetadata(transaction) && (
                                    <Badge
                                        variant="outline"
                                        className="gap-1 border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-300"
                                    >
                                        <Sparkles className="size-3" /> Details
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <Button asChild variant="ghost" size="icon">
                                    <Link href={edit.url(transaction.id)}>
                                        <Pencil className="size-4" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setPendingDelete(transaction)
                                    }
                                >
                                    <Trash2 className="size-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete transaction?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove this transaction. This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPendingDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleting}
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
