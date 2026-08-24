import { useForm } from '@inertiajs/react';
import { type FormEvent, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store, update } from '@/routes/budgets';
import type { BudgetCard, CategoryOption } from '@/types/tracker';

interface BudgetFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: CategoryOption[];
    periodMonth: string;
    editingBudget: BudgetCard | null;
}

/**
 * Create / edit dialog for a category budget: category select, month/year
 * selector, and a monthly limit amount input.
 */
export function BudgetFormDialog({
    open,
    onOpenChange,
    categories,
    periodMonth,
    editingBudget,
}: BudgetFormDialogProps) {
    const isEditing = editingBudget !== null;

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            category_id: editingBudget ? String(editingBudget.category.id) : '',
            period_month: periodMonth,
            limit_amount: editingBudget
                ? String(editingBudget.limit_amount)
                : '',
        });

    useEffect(() => {
        if (open) {
            setData({
                category_id: editingBudget
                    ? String(editingBudget.category.id)
                    : '',
                period_month: periodMonth,
                limit_amount: editingBudget
                    ? String(editingBudget.limit_amount)
                    : '',
            });
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, editingBudget]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const onSuccess = () => {
            reset();
            onOpenChange(false);
        };

        if (isEditing && editingBudget) {
            put(update(editingBudget.id).url, {
                preserveScroll: true,
                onSuccess,
            });
        } else {
            post(store().url, { preserveScroll: true, onSuccess });
        }
    }

    const expenseCategories = categories.filter((c) => c.type === 'expense');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit budget' : 'Create budget'}
                    </DialogTitle>
                    <DialogDescription>
                        Set a monthly spending limit for a category to track
                        your progress.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="budget-category">Category</Label>
                        <Select
                            value={data.category_id}
                            onValueChange={(value) =>
                                setData('category_id', value)
                            }
                        >
                            <SelectTrigger
                                id="budget-category"
                                className="w-full"
                            >
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {expenseCategories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.icon_emoji}{' '}
                                        {category.parent_name
                                            ? `${category.parent_name} / `
                                            : ''}
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && (
                            <p className="text-xs text-destructive">
                                {errors.category_id}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="budget-period">Month</Label>
                        <Input
                            id="budget-period"
                            type="month"
                            value={data.period_month}
                            onChange={(e) =>
                                setData('period_month', e.target.value)
                            }
                        />
                        {errors.period_month && (
                            <p className="text-xs text-destructive">
                                {errors.period_month}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="budget-limit">Monthly limit</Label>
                        <Input
                            id="budget-limit"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={data.limit_amount}
                            onChange={(e) =>
                                setData('limit_amount', e.target.value)
                            }
                        />
                        {errors.limit_amount && (
                            <p className="text-xs text-destructive">
                                {errors.limit_amount}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEditing ? 'Save changes' : 'Create budget'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
