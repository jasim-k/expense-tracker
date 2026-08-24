import { router } from '@inertiajs/react';
import { useState } from 'react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { complete } from '@/routes/reminders';
import type { AlertItem } from '@/types/tracker';
import { Checkbox } from '@/components/ui/checkbox';

interface ChecklistProps {
    items: AlertItem[];
}

/**
 * Pending checklist tracker. Ticking a checkbox POSTs to reminders.complete
 * with `preserveScroll` and shows the item struck-through while completed.
 */
export function Checklist({ items }: ChecklistProps) {
    const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

    function toggle(item: AlertItem) {
        if (item.is_completed) {
            return;
        }
        setPendingIds((prev) => new Set(prev).add(item.id));
        router.post(
            complete(item.id).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setPendingIds((prev) => {
                        const next = new Set(prev);
                        next.delete(item.id);
                        return next;
                    });
                },
            },
        );
    }

    return (
        <ul className="flex flex-col divide-y divide-border">
            {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-2.5">
                    <Checkbox
                        checked={item.is_completed}
                        disabled={item.is_completed || pendingIds.has(item.id)}
                        onCheckedChange={() => toggle(item)}
                    />
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="text-base">{item.icon_emoji}</span>
                        <div className="min-w-0">
                            <p
                                className={cn(
                                    'truncate text-sm font-medium text-foreground',
                                    item.is_completed &&
                                        'text-muted-foreground line-through',
                                )}
                            >
                                {item.label}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {item.category} &middot;{' '}
                                {formatDate(item.target_date)}
                            </p>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
