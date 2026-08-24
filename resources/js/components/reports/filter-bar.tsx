import { router } from '@inertiajs/react';
import { ChevronDown, Download } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as reportsIndex, exportMethod } from '@/routes/reports';
import type { CategoryOption, ReportProps } from '@/types/tracker';

interface FilterBarProps {
    filters: ReportProps['filters'];
    categories: CategoryOption[];
}

/**
 * Date-range + multi-category filter bar. Submits via `router.get` with
 * `preserveState` + `replace` so filtering never adds history entries.
 */
export function FilterBar({ filters, categories }: FilterBarProps) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const [categoryIds, setCategoryIds] = useState<number[]>(
        filters.category_ids,
    );

    function submit(nextCategoryIds = categoryIds) {
        router.get(
            reportsIndex().url,
            { from, to, category_ids: nextCategoryIds },
            { preserveState: true, replace: true },
        );
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        submit();
    }

    function toggleCategory(id: number) {
        const next = categoryIds.includes(id)
            ? categoryIds.filter((c) => c !== id)
            : [...categoryIds, id];
        setCategoryIds(next);
        submit(next);
    }

    const exportUrl = exportMethod({
        query: { from, to, category_ids: categoryIds },
    }).url;

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4"
        >
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="report-from">From</Label>
                <Input
                    id="report-from"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    onBlur={() => submit()}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="report-to">To</Label>
                <Input
                    id="report-to"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    onBlur={() => submit()}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>Categories</Label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="min-w-40 justify-between"
                        >
                            {categoryIds.length === 0
                                ? 'All categories'
                                : `${categoryIds.length} selected`}
                            <ChevronDown className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="max-h-72 overflow-y-auto"
                        align="start"
                    >
                        {categories.map((category) => (
                            <DropdownMenuCheckboxItem
                                key={category.id}
                                checked={categoryIds.includes(category.id)}
                                onCheckedChange={() =>
                                    toggleCategory(category.id)
                                }
                                onSelect={(e) => e.preventDefault()}
                            >
                                {category.icon_emoji}{' '}
                                {category.parent_name
                                    ? `${category.parent_name} / `
                                    : ''}
                                {category.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Button type="submit">Apply filters</Button>
            <a
                href={exportUrl}
                className="ml-auto inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
            >
                <Download className="size-4" />
                Export Statement
            </a>
        </form>
    );
}
