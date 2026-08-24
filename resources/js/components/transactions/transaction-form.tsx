import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEventHandler,
} from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { store, update } from '@/routes/transactions';
import type {
    AccountSummary,
    AccountType,
    CategoryNode,
    CategoryType,
    TransactionFormProps,
    TransactionType,
} from '@/types/tracker';

type DynamicValue = string | number | boolean | null;

interface ReminderState {
    enabled: boolean;
    offset_days: number;
}

interface TransactionFormData {
    type: TransactionType;
    amount: string;
    transaction_date: string;
    category_id: number | null;
    account_id: number | null;
    description: string;
    dynamic_metadata: Record<string, DynamicValue>;
    reminders: Record<string, ReminderState>;
}

const TYPE_OPTIONS: {
    value: TransactionType;
    label: string;
    active: string;
}[] = [
    {
        value: 'expense',
        label: 'Expense',
        active: 'data-[state=on]:bg-rose-600 data-[state=on]:text-white',
    },
    {
        value: 'income',
        label: 'Income',
        active: 'data-[state=on]:bg-emerald-600 data-[state=on]:text-white',
    },
    {
        value: 'asset_log',
        label: 'Asset Log',
        active: 'data-[state=on]:bg-violet-600 data-[state=on]:text-white',
    },
];

const TYPE_TO_CATEGORY_TYPE: Record<TransactionType, CategoryType> = {
    expense: 'expense',
    income: 'income',
    asset_log: 'asset_maintenance',
};

const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
    cash: 'Cash',
    bank: 'Bank',
    credit: 'Credit',
};

const REMINDER_OFFSETS = [7, 30, 60, 90];

function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

function findParentOf(
    tree: CategoryNode[],
    childId: number,
): CategoryNode | null {
    for (const node of tree) {
        if (node.children.some((child) => child.id === childId)) {
            return node;
        }
    }
    return null;
}

export function TransactionForm({
    accounts,
    categoryTree,
    transaction,
}: TransactionFormProps) {
    const isEdit = transaction !== null;
    const initialParent = useMemo(
        () =>
            transaction
                ? findParentOf(categoryTree, transaction.category.id)
                : null,
        [transaction, categoryTree],
    );

    const [parentId, setParentId] = useState<number | null>(
        initialParent?.id ?? null,
    );
    const [subCategoryId, setSubCategoryId] = useState<number | null>(
        transaction?.category.id ?? null,
    );
    const isFirstRender = useRef(true);

    const { data, setData, post, put, processing, errors } =
        useForm<TransactionFormData>({
            type: transaction?.type ?? 'expense',
            amount: transaction ? String(transaction.amount) : '',
            transaction_date:
                transaction?.transaction_date?.slice(0, 10) ?? todayIso(),
            category_id: transaction?.category.id ?? null,
            account_id: transaction?.account.id ?? null,
            description: transaction?.description ?? '',
            dynamic_metadata: transaction?.dynamic_metadata ?? {},
            reminders: {},
        });

    const categoryType = TYPE_TO_CATEGORY_TYPE[data.type];

    const topLevelCategories = useMemo(
        () =>
            categoryTree.filter(
                (node) => node.parent_id === null && node.type === categoryType,
            ),
        [categoryTree, categoryType],
    );

    const selectedParent = useMemo(
        () => topLevelCategories.find((node) => node.id === parentId) ?? null,
        [topLevelCategories, parentId],
    );

    const selectedSubCategory = useMemo(
        () =>
            selectedParent?.children.find(
                (child) => child.id === subCategoryId,
            ) ?? null,
        [selectedParent, subCategoryId],
    );

    const activeDefinitions =
        selectedSubCategory?.custom_field_definitions ?? [];

    // Reset the dynamic fields whenever the selected sub-category changes (skip on initial mount).
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setData((previous) => ({
            ...previous,
            dynamic_metadata: {},
            reminders: {},
        }));
    }, [subCategoryId, setData]);

    const handleTypeChange = (value: TransactionType | '') => {
        if (!value) {
            return;
        }
        setData((previous) => ({
            ...previous,
            type: value,
            category_id: null,
        }));
        setParentId(null);
        setSubCategoryId(null);
    };

    const handleParentSelect = (parent: CategoryNode) => {
        setParentId(parent.id);
        if (parent.children.length === 0) {
            setSubCategoryId(null);
            setData('category_id', parent.id);
        } else {
            setSubCategoryId(null);
            setData('category_id', null);
        }
    };

    const handleSubCategorySelect = (child: CategoryNode) => {
        setSubCategoryId(child.id);
        setData('category_id', child.id);
    };

    const setDynamicField = (key: string, value: DynamicValue) => {
        setData('dynamic_metadata', { ...data.dynamic_metadata, [key]: value });
    };

    const setReminder = (key: string, patch: Partial<ReminderState>) => {
        const current = data.reminders[key] ?? {
            enabled: false,
            offset_days: 30,
        };
        setData('reminders', {
            ...data.reminders,
            [key]: { ...current, ...patch },
        });
    };

    const amountValue = Number(data.amount);
    const amountInvalid =
        data.amount !== '' && (Number.isNaN(amountValue) || amountValue <= 0);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (Number.isNaN(amountValue) || amountValue <= 0) {
            return;
        }
        if (isEdit && transaction) {
            put(update.url(transaction.id));
        } else {
            post(store.url());
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Transaction type */}
            <div className="space-y-2">
                <Label>Transaction Type</Label>
                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={data.type}
                    onValueChange={handleTypeChange}
                    className="grid w-full grid-cols-3"
                >
                    {TYPE_OPTIONS.map((option) => (
                        <ToggleGroupItem
                            key={option.value}
                            value={option.value}
                            className={cn('font-medium', option.active)}
                        >
                            {option.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                {/* Amount */}
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xl font-semibold text-muted-foreground">
                            $
                        </span>
                        <Input
                            id="amount"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            aria-invalid={
                                Boolean(errors.amount) || amountInvalid
                            }
                            className="h-14 pl-8 text-2xl font-bold tracking-tight"
                        />
                    </div>
                    {amountInvalid && (
                        <p className="text-sm text-destructive">
                            Amount must be greater than zero.
                        </p>
                    )}
                    {errors.amount && (
                        <p className="text-sm text-destructive">
                            {errors.amount}
                        </p>
                    )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <Label htmlFor="transaction_date">Date</Label>
                    <Input
                        id="transaction_date"
                        type="date"
                        value={data.transaction_date}
                        onChange={(e) =>
                            setData('transaction_date', e.target.value)
                        }
                        aria-invalid={Boolean(errors.transaction_date)}
                        className="h-14 text-base"
                    />
                    {errors.transaction_date && (
                        <p className="text-sm text-destructive">
                            {errors.transaction_date}
                        </p>
                    )}
                </div>
            </div>

            {/* Hierarchical category selector */}
            <div className="space-y-3">
                <Label>Category</Label>
                <div className="flex flex-wrap gap-2">
                    {topLevelCategories.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No categories available for this transaction type
                            yet.
                        </p>
                    )}
                    {topLevelCategories.map((parent) => (
                        <button
                            key={parent.id}
                            type="button"
                            onClick={() => handleParentSelect(parent)}
                            className={cn(
                                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                                parentId === parent.id
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-card text-foreground hover:bg-accent',
                            )}
                        >
                            <span className="text-base leading-none">
                                {parent.icon_emoji}
                            </span>
                            {parent.name}
                        </button>
                    ))}
                </div>

                {selectedParent && selectedParent.children.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3 sm:grid-cols-3">
                        {selectedParent.children.map((child) => (
                            <button
                                key={child.id}
                                type="button"
                                onClick={() => handleSubCategorySelect(child)}
                                className={cn(
                                    'flex flex-col items-center gap-1 rounded-lg border px-3 py-3 text-center text-xs font-medium transition-colors',
                                    subCategoryId === child.id
                                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                        : 'border-border bg-card text-foreground hover:bg-accent',
                                )}
                            >
                                <span className="text-lg leading-none">
                                    {child.icon_emoji}
                                </span>
                                {child.name}
                            </button>
                        ))}
                    </div>
                )}
                {errors.category_id && (
                    <p className="text-sm text-destructive">
                        {errors.category_id}
                    </p>
                )}
            </div>

            {/* Dynamic custom fields panel */}
            <div
                className={cn(
                    'grid transition-all duration-300 ease-in-out',
                    activeDefinitions.length > 0
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0',
                )}
            >
                <div className="overflow-hidden">
                    <Card className="border-violet-300 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                                <span aria-hidden>
                                    {selectedSubCategory?.icon_emoji}
                                </span>
                                {selectedSubCategory?.name} details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            {activeDefinitions.map((definition) => {
                                const value =
                                    data.dynamic_metadata[definition.key];
                                const reminder = data.reminders[
                                    definition.key
                                ] ?? { enabled: false, offset_days: 30 };
                                const errorMessage = (
                                    errors as Record<string, string | undefined>
                                )[`dynamic_metadata.${definition.key}`];

                                if (definition.type === 'date') {
                                    return (
                                        <div
                                            key={definition.key}
                                            className="space-y-2 sm:col-span-2"
                                        >
                                            <Label
                                                htmlFor={`field-${definition.key}`}
                                            >
                                                {definition.name}
                                            </Label>
                                            <Input
                                                id={`field-${definition.key}`}
                                                type="date"
                                                value={(value as string) ?? ''}
                                                onChange={(e) =>
                                                    setDynamicField(
                                                        definition.key,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <div className="flex flex-wrap items-center gap-3 rounded-md border border-violet-200 bg-background/60 p-2 dark:border-violet-800">
                                                <label className="flex items-center gap-2 text-sm font-medium">
                                                    <Checkbox
                                                        checked={
                                                            reminder.enabled
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            setReminder(
                                                                definition.key,
                                                                {
                                                                    enabled:
                                                                        checked ===
                                                                        true,
                                                                },
                                                            )
                                                        }
                                                    />
                                                    Set Reminder
                                                </label>
                                                {reminder.enabled && (
                                                    <ToggleGroup
                                                        type="single"
                                                        variant="outline"
                                                        size="sm"
                                                        value={String(
                                                            reminder.offset_days,
                                                        )}
                                                        onValueChange={(
                                                            offset,
                                                        ) => {
                                                            if (offset) {
                                                                setReminder(
                                                                    definition.key,
                                                                    {
                                                                        offset_days:
                                                                            Number(
                                                                                offset,
                                                                            ),
                                                                    },
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {REMINDER_OFFSETS.map(
                                                            (offset) => (
                                                                <ToggleGroupItem
                                                                    key={offset}
                                                                    value={String(
                                                                        offset,
                                                                    )}
                                                                >
                                                                    {offset}d
                                                                </ToggleGroupItem>
                                                            ),
                                                        )}
                                                    </ToggleGroup>
                                                )}
                                            </div>
                                            {errorMessage && (
                                                <p className="text-sm text-destructive">
                                                    {errorMessage}
                                                </p>
                                            )}
                                        </div>
                                    );
                                }

                                if (definition.type === 'number') {
                                    return (
                                        <div
                                            key={definition.key}
                                            className="space-y-2"
                                        >
                                            <Label
                                                htmlFor={`field-${definition.key}`}
                                            >
                                                {definition.name}
                                            </Label>
                                            <Input
                                                id={`field-${definition.key}`}
                                                type="number"
                                                value={
                                                    (value as
                                                        number | string) ?? ''
                                                }
                                                onChange={(e) =>
                                                    setDynamicField(
                                                        definition.key,
                                                        e.target.value === ''
                                                            ? ''
                                                            : Number(
                                                                  e.target
                                                                      .value,
                                                              ),
                                                    )
                                                }
                                            />
                                            {errorMessage && (
                                                <p className="text-sm text-destructive">
                                                    {errorMessage}
                                                </p>
                                            )}
                                        </div>
                                    );
                                }

                                if (definition.type === 'checkbox') {
                                    return (
                                        <label
                                            key={definition.key}
                                            className="flex items-center gap-2 self-end pb-2 text-sm font-medium"
                                        >
                                            <Checkbox
                                                checked={Boolean(value)}
                                                onCheckedChange={(checked) =>
                                                    setDynamicField(
                                                        definition.key,
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            {definition.name}
                                        </label>
                                    );
                                }

                                return (
                                    <div
                                        key={definition.key}
                                        className="space-y-2"
                                    >
                                        <Label
                                            htmlFor={`field-${definition.key}`}
                                        >
                                            {definition.name}
                                        </Label>
                                        <Input
                                            id={`field-${definition.key}`}
                                            type="text"
                                            value={(value as string) ?? ''}
                                            onChange={(e) =>
                                                setDynamicField(
                                                    definition.key,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errorMessage && (
                                            <p className="text-sm text-destructive">
                                                {errorMessage}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Payment method / account selector */}
            <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {accounts.map((account: AccountSummary) => (
                        <button
                            key={account.id}
                            type="button"
                            onClick={() => setData('account_id', account.id)}
                            className={cn(
                                'flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors',
                                data.account_id === account.id
                                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                    : 'border-border bg-card hover:bg-accent',
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-sm font-semibold">
                                    <span aria-hidden>
                                        {account.icon_emoji ?? '💳'}
                                    </span>
                                    {account.name}
                                </span>
                                <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    {ACCOUNT_TYPE_LABEL[account.type]}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {formatCurrency(account.current_balance)}
                            </span>
                        </button>
                    ))}
                </div>
                {errors.account_id && (
                    <p className="text-sm text-destructive">
                        {errors.account_id}
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description / Notes</Label>
                <textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                    placeholder="Memo, mileage, receipt reference..."
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                    aria-invalid={Boolean(errors.description)}
                />
                {errors.description && (
                    <p className="text-sm text-destructive">
                        {errors.description}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={processing || amountInvalid || data.amount === ''}
                >
                    {processing && <Loader2 className="size-4 animate-spin" />}
                    {isEdit ? 'Save Changes' : 'Add Transaction'}
                </Button>
            </div>
        </form>
    );
}
