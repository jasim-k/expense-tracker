import { ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { CategoryNode } from '@/types/tracker';

const TYPE_BADGE: Record<CategoryNode['type'], string> = {
    expense:
        'border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-300',
    income: 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-300',
    asset_maintenance:
        'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-300',
};

interface CategoryTreeProps {
    categoryTree: CategoryNode[];
    stats: Record<number, { transactions: number; total: number }>;
    selectedId: number | null;
    onSelect: (node: CategoryNode) => void;
    onAddCategory: () => void;
    onAddSubCategory: (parent: CategoryNode) => void;
}

export function CategoryTree({
    categoryTree,
    stats,
    selectedId,
    onSelect,
    onAddCategory,
    onAddSubCategory,
}: CategoryTreeProps) {
    const [openIds, setOpenIds] = useState<Set<number>>(
        () => new Set(categoryTree.map((node) => node.id)),
    );

    const toggleOpen = (id: number) => {
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div className="space-y-2">
            <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onAddCategory}
            >
                <Plus className="size-4" />
                Add Category
            </Button>

            <div className="space-y-1">
                {categoryTree.map((parent) => {
                    const isOpen = openIds.has(parent.id);
                    return (
                        <Collapsible
                            key={parent.id}
                            open={isOpen}
                            onOpenChange={() => toggleOpen(parent.id)}
                        >
                            <div
                                className={cn(
                                    'flex items-center gap-1 rounded-md',
                                    selectedId === parent.id &&
                                        'bg-primary/10 ring-1 ring-primary',
                                )}
                            >
                                <CollapsibleTrigger asChild>
                                    <button
                                        type="button"
                                        className="p-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <ChevronRight
                                            className={cn(
                                                'size-4 transition-transform',
                                                isOpen && 'rotate-90',
                                            )}
                                        />
                                    </button>
                                </CollapsibleTrigger>
                                <button
                                    type="button"
                                    onClick={() => onSelect(parent)}
                                    className="flex flex-1 items-center gap-2 py-2 pr-2 text-left text-sm font-medium"
                                >
                                    <span aria-hidden>{parent.icon_emoji}</span>
                                    {parent.name}
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'text-[10px]',
                                            TYPE_BADGE[parent.type],
                                        )}
                                    >
                                        {parent.type.replace('_', ' ')}
                                    </Badge>
                                    {stats[parent.id] && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {stats[parent.id].transactions}
                                        </span>
                                    )}
                                </button>
                            </div>
                            <CollapsibleContent>
                                <div className="ml-6 space-y-1 border-l border-border pl-2">
                                    {parent.children.map((child) => (
                                        <button
                                            key={child.id}
                                            type="button"
                                            onClick={() => onSelect(child)}
                                            className={cn(
                                                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                                                selectedId === child.id
                                                    ? 'bg-primary/10 font-medium ring-1 ring-primary'
                                                    : 'hover:bg-accent',
                                            )}
                                        >
                                            <span aria-hidden>
                                                {child.icon_emoji}
                                            </span>
                                            <span className="flex-1 truncate">
                                                {child.name}
                                            </span>
                                            {child.custom_field_definitions
                                                .length > 0 && (
                                                <span
                                                    className="text-[10px] text-violet-500"
                                                    title="Has custom fields"
                                                >
                                                    ✦
                                                </span>
                                            )}
                                            {stats[child.id] && (
                                                <span className="text-xs text-muted-foreground">
                                                    {
                                                        stats[child.id]
                                                            .transactions
                                                    }
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => onAddSubCategory(parent)}
                                        className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-xs font-medium text-primary hover:bg-accent"
                                    >
                                        <Plus className="size-3" />
                                        Add Sub-category
                                    </button>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>
        </div>
    );
}
