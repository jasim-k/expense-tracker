import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { index } from '@/routes/transactions';
import type { TransactionFormProps } from '@/types/tracker';

export default function CreateTransaction({
    accounts,
    categoryTree,
}: TransactionFormProps) {
    return (
        <>
            <Head title="Add Transaction" />

            <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
                <Heading
                    title="Add Transaction"
                    description="Log an expense, income, or asset maintenance record."
                />

                <Card>
                    <CardContent>
                        <TransactionForm
                            accounts={accounts}
                            categoryTree={categoryTree}
                            transaction={null}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CreateTransaction.layout = {
    breadcrumbs: [
        { title: 'Transactions', href: index() },
        { title: 'Add Transaction', href: '#' },
    ],
};
