import { Head, router } from '@inertiajs/react';
import { Check, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { EmptyState } from '@/components/tracker/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { complete, destroy, index as remindersIndex } from '@/routes/reminders';
import type { AlertItem, AlertSeverity } from '@/types/tracker';

interface RemindersIndexProps {
    reminders: AlertItem[];
}

const severityBadgeClass: Record<AlertSeverity, string> = {
    critical:
        'bg-rose-500/15 text-rose-700 border-rose-300/60 dark:text-rose-300 dark:border-rose-700/60',
    warning:
        'bg-amber-500/15 text-amber-700 border-amber-300/60 dark:text-amber-300 dark:border-amber-700/60',
    ok: 'bg-emerald-500/15 text-emerald-700 border-emerald-300/60 dark:text-emerald-300 dark:border-emerald-700/60',
};

function groupReminders(reminders: AlertItem[]) {
    const overdue: AlertItem[] = [];
    const thisMonth: AlertItem[] = [];
    const upcoming: AlertItem[] = [];
    const completed: AlertItem[] = [];

    for (const item of reminders) {
        if (item.is_completed) {
            completed.push(item);
        } else if (item.days_remaining < 0) {
            overdue.push(item);
        } else if (item.days_remaining <= 30) {
            thisMonth.push(item);
        } else {
            upcoming.push(item);
        }
    }

    return { overdue, thisMonth, upcoming, completed };
}

function ReminderRow({ item }: { item: AlertItem }) {
    return (
        <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="text-2xl">{item.icon_emoji}</span>
                    <div className="min-w-0">
                        <p
                            className={cn(
                                'truncate text-sm font-semibold text-foreground',
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
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={severityBadgeClass[item.severity]}
                    >
                        {item.is_completed
                            ? 'Completed'
                            : item.days_remaining < 0
                              ? `${Math.abs(item.days_remaining)}d overdue`
                              : `${item.days_remaining}d left`}
                    </Badge>
                    {!item.is_completed && (
                        <Button
                            size="icon"
                            variant="outline"
                            aria-label="Mark complete"
                            onClick={() =>
                                router.post(
                                    complete(item.id).url,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <Check className="size-4" />
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="outline"
                        aria-label="Delete reminder"
                        onClick={() =>
                            router.delete(destroy(item.id).url, {
                                preserveScroll: true,
                            })
                        }
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ReminderGroup({
    title,
    items,
}: {
    title: string;
    items: AlertItem[];
}) {
    if (items.length === 0) {
        return null;
    }
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {title}{' '}
                <span className="text-muted-foreground/70">
                    ({items.length})
                </span>
            </h2>
            <div className="flex flex-col gap-2">
                {items.map((item) => (
                    <ReminderRow key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}

export default function RemindersIndex({ reminders }: RemindersIndexProps) {
    const groups = useMemo(() => groupReminders(reminders), [reminders]);

    return (
        <>
            <Head title="Reminders" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Reminders
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        All document and maintenance reminders in one place.
                    </p>
                </div>

                {reminders.length === 0 ? (
                    <EmptyState
                        emoji="🔔"
                        title="No reminders"
                        description="Reminders you add to documents or assets will appear here."
                    />
                ) : (
                    <>
                        <ReminderGroup title="Overdue" items={groups.overdue} />
                        <ReminderGroup
                            title="This month"
                            items={groups.thisMonth}
                        />
                        <ReminderGroup
                            title="Upcoming"
                            items={groups.upcoming}
                        />
                        <ReminderGroup
                            title="Completed"
                            items={groups.completed}
                        />
                    </>
                )}
            </div>
        </>
    );
}

RemindersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reminders',
            href: remindersIndex(),
        },
    ],
};
