import { Head, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { destroy, index } from '@/routes/transactions';
import type { TransactionFormProps } from '@/types/tracker';

export default function EditTransaction({
    accounts,
    categoryTree,
    transaction,
}: TransactionFormProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (!transaction) {
        return null;
    }

    const handleDelete = () => {
        setDeleting(true);
        router.delete(destroy.url(transaction.id), {
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title="Edit Transaction" />

            <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Edit Transaction"
                        description="Update this transaction or asset log entry."
                    />
                    <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirmOpen(true)}
                    >
                        <Trash2 className="size-4" />
                        Delete
                    </Button>
                </div>

                <Card>
                    <CardContent>
                        <TransactionForm
                            accounts={accounts}
                            categoryTree={categoryTree}
                            transaction={transaction}
                        />
                    </CardContent>
                </Card>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
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
                            onClick={() => setConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

EditTransaction.layout = {
    breadcrumbs: [
        { title: 'Transactions', href: index() },
        { title: 'Edit Transaction', href: '#' },
    ],
};
