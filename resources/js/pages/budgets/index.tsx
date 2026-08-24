import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { BudgetCard } from '@/components/budgets/budget-card';
import { BudgetFormDialog } from '@/components/budgets/budget-form-dialog';
import { EmptyState } from '@/components/tracker/empty-state';
import { StatCard } from '@/components/tracker/stat-card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercentage } from '@/lib/format';
import { destroy, index as budgetsIndex } from '@/routes/budgets';
import type {
    BudgetCard as BudgetCardType,
    BudgetIndexProps,
} from '@/types/tracker';

export default function BudgetsIndex({
    budgets,
    categories,
    period_month,
    totals,
}: BudgetIndexProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<BudgetCardType | null>(
        null,
    );

    const overallPercentage =
        totals.limit > 0 ? (totals.spent / totals.limit) * 100 : 0;

    function openCreateDialog() {
        setEditingBudget(null);
        setDialogOpen(true);
    }

    function openEditDialog(budget: BudgetCardType) {
        setEditingBudget(budget);
        setDialogOpen(true);
    }

    function handleDelete(budget: BudgetCardType) {
        if (confirm(`Delete the budget for ${budget.category.name}?`)) {
            router.delete(destroy(budget.id).url, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Budget Planner" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Budget Planner
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Period: {period_month}
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="size-4" />
                        Create budget
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                        hero
                        label="Total spent"
                        value={formatCurrency(totals.spent)}
                        emoji="💸"
                        sub={`of ${formatCurrency(totals.limit)} limit`}
                    />
                    <StatCard
                        label="Total limit"
                        value={formatCurrency(totals.limit)}
                        emoji="🎯"
                        variant="purple"
                    />
                    <StatCard
                        label="Overall usage"
                        value={formatPercentage(overallPercentage, 0)}
                        emoji={
                            overallPercentage >= 100
                                ? '🚨'
                                : overallPercentage >= 70
                                  ? '⚠️'
                                  : '✅'
                        }
                        variant={
                            overallPercentage >= 100
                                ? 'rose'
                                : overallPercentage >= 70
                                  ? 'amber'
                                  : 'emerald'
                        }
                    />
                </div>

                {budgets.length === 0 ? (
                    <EmptyState
                        emoji="🎯"
                        title="No budgets yet"
                        description="Create a category budget to start tracking your spending limits."
                        action={
                            <Button onClick={openCreateDialog}>
                                Create budget
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {budgets.map((budget) => (
                            <BudgetCard
                                key={budget.id}
                                budget={budget}
                                onEdit={openEditDialog}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <BudgetFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                categories={categories}
                periodMonth={period_month}
                editingBudget={editingBudget}
            />
        </>
    );
}

BudgetsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Budgets',
            href: budgetsIndex(),
        },
    ],
};
