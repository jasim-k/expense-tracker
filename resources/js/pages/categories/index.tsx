import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import { CategoryDetailPanel } from '@/components/categories/category-detail-panel';
import { CategoryTree } from '@/components/categories/category-tree';
import { index } from '@/routes/categories';
import type {
    CategoryIndexProps,
    CategoryNode,
    CategoryType,
} from '@/types/tracker';

type Selection =
    | { kind: 'existing'; node: CategoryNode }
    | { kind: 'new-parent' }
    | { kind: 'new-child'; parent: CategoryNode };

export default function CategoryIndex({
    categoryTree,
    stats,
}: CategoryIndexProps) {
    const [selection, setSelection] = useState<Selection | null>(null);

    const parentOptions = useMemo(
        () => categoryTree.filter((node) => node.parent_id === null),
        [categoryTree],
    );

    let category: CategoryNode | null = null;
    let defaultParentId: number | null = null;
    let defaultType: CategoryType = 'expense';

    if (selection?.kind === 'existing') {
        category = selection.node;
        defaultType = selection.node.type;
    } else if (selection?.kind === 'new-child') {
        defaultParentId = selection.parent.id;
        defaultType = selection.parent.type;
    }

    return (
        <>
            <Head title="Categories" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading
                    title="Category & Field Builder"
                    description="Design your category hierarchy and the dynamic fields each sub-category collects."
                />

                <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                    <CategoryTree
                        categoryTree={categoryTree}
                        stats={stats}
                        selectedId={
                            selection?.kind === 'existing'
                                ? selection.node.id
                                : null
                        }
                        onSelect={(node) =>
                            setSelection({ kind: 'existing', node })
                        }
                        onAddCategory={() =>
                            setSelection({ kind: 'new-parent' })
                        }
                        onAddSubCategory={(parent) =>
                            setSelection({ kind: 'new-child', parent })
                        }
                    />

                    {selection ? (
                        <CategoryDetailPanel
                            key={
                                selection.kind === 'existing'
                                    ? `existing-${selection.node.id}`
                                    : selection.kind === 'new-child'
                                      ? `new-child-${selection.parent.id}`
                                      : 'new-parent'
                            }
                            category={category}
                            parentOptions={parentOptions}
                            defaultParentId={defaultParentId}
                            defaultType={defaultType}
                            stats={category ? stats[category.id] : undefined}
                            onSaved={() => setSelection(null)}
                            onDeleted={() => setSelection(null)}
                        />
                    ) : (
                        <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                            Select a category or add a new one to get started.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

CategoryIndex.layout = {
    breadcrumbs: [{ title: 'Categories', href: index() }],
};
