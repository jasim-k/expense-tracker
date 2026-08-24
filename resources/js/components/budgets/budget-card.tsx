import { Pencil, Trash2 } from 'lucide-react';
import { ProgressBar } from '@/components/tracker/progress-bar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import type { BudgetCard as BudgetCardType } from '@/types/tracker';

interface BudgetCardProps {
    budget: BudgetCardType;
    onEdit: (budget: BudgetCardType) => void;
    onDelete: (budget: BudgetCardType) => void;
}

/**
 * Category progress card for the budget planner: emoji + name, spent/limit,
 * remaining, a colour-coded real-time progress bar, and an over-budget warning banner.
 */
export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
    const isOver = budget.status === 'over';

    return (
        <Card
            className={
                isOver
                    ? 'border-rose-300/70 dark:border-rose-800/60'
                    : undefined
            }
        >
            <CardContent className="flex flex-col gap-4 px-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-full bg-violet-500/15 text-lg">
                            {budget.category.icon_emoji}
                        </span>
                        <span className="font-semibold text-foreground">
                            {budget.category.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Edit budget"
                            onClick={() => onEdit(budget)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Delete budget"
                            onClick={() => onDelete(budget)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>

                {isOver && (
                    <Alert
                        variant="destructive"
                        className="border-rose-300/70 bg-rose-50 dark:border-rose-800/60 dark:bg-rose-950/30"
                    >
                        <AlertTitle>Over budget</AlertTitle>
                        <AlertDescription>
                            You have exceeded this category&apos;s monthly
                            limit.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Spent / Limit
                        </p>
                        <p className="font-semibold text-foreground">
                            {formatCurrency(budget.spent)}{' '}
                            <span className="text-muted-foreground">
                                / {formatCurrency(budget.limit_amount)}
                            </span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                            Remaining
                        </p>
                        <p
                            className={`font-semibold ${budget.remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}
                        >
                            {formatCurrency(budget.remaining)}
                        </p>
                    </div>
                </div>

                <ProgressBar label="Progress" percentage={budget.percentage} />
            </CardContent>
        </Card>
    );
}
