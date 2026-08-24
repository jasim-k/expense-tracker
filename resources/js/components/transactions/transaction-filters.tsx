import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { index } from '@/routes/transactions';
import type {
    AccountSummary,
    CategoryOption,
    TransactionFilters,
    TransactionType,
} from '@/types/tracker';

interface TransactionFiltersBarProps {
    filters: TransactionFilters;
    accounts: AccountSummary[];
    categories: CategoryOption[];
}

const ALL_VALUE = 'all';

export function TransactionFiltersBar({
    filters,
    accounts,
    categories,
}: TransactionFiltersBarProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    const submit = (overrides: Partial<TransactionFilters>) => {
        router.get(
            index.url(),
            {
                search: overrides.search ?? filters.search ?? undefined,
                category_id:
                    overrides.category_id !== undefined
                        ? overrides.category_id
                        : (filters.category_id ?? undefined),
                account_id:
                    overrides.account_id !== undefined
                        ? overrides.account_id
                        : (filters.account_id ?? undefined),
                type:
                    overrides.type !== undefined
                        ? overrides.type
                        : (filters.type ?? undefined),
                from:
                    overrides.from !== undefined
                        ? overrides.from
                        : (filters.from ?? undefined),
                to:
                    overrides.to !== undefined
                        ? overrides.to
                        : (filters.to ?? undefined),
            },
            { preserveState: true, replace: true },
        );
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            submit({ search: search || null });
        }, 350);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search description..."
                        className="pl-9"
                    />
                </div>

                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={filters.type ?? ''}
                    onValueChange={(value) =>
                        submit({
                            type: (value || null) as TransactionType | null,
                        })
                    }
                >
                    <ToggleGroupItem
                        value="expense"
                        className="data-[state=on]:bg-rose-600 data-[state=on]:text-white"
                    >
                        Expense
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="income"
                        className="data-[state=on]:bg-emerald-600 data-[state=on]:text-white"
                    >
                        Income
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="asset_log"
                        className="data-[state=on]:bg-violet-600 data-[state=on]:text-white"
                    >
                        Asset Log
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                <Select
                    value={
                        filters.category_id
                            ? String(filters.category_id)
                            : ALL_VALUE
                    }
                    onValueChange={(value) =>
                        submit({
                            category_id:
                                value === ALL_VALUE ? null : Number(value),
                        })
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>
                            All categories
                        </SelectItem>
                        {categories.map((category) => (
                            <SelectItem
                                key={category.id}
                                value={String(category.id)}
                            >
                                {category.icon_emoji}{' '}
                                {category.parent_name
                                    ? `${category.parent_name} › `
                                    : ''}
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={
                        filters.account_id
                            ? String(filters.account_id)
                            : ALL_VALUE
                    }
                    onValueChange={(value) =>
                        submit({
                            account_id:
                                value === ALL_VALUE ? null : Number(value),
                        })
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="All accounts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>All accounts</SelectItem>
                        {accounts.map((account) => (
                            <SelectItem
                                key={account.id}
                                value={String(account.id)}
                            >
                                {account.icon_emoji} {account.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Input
                    type="date"
                    value={filters.from ?? ''}
                    onChange={(e) => submit({ from: e.target.value || null })}
                />
                <Input
                    type="date"
                    value={filters.to ?? ''}
                    onChange={(e) => submit({ to: e.target.value || null })}
                />
            </div>
        </div>
    );
}
