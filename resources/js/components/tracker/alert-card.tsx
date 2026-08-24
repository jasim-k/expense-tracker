import type { AlertSeverity } from '@/types/tracker';
import { formatDate, formatDaysRemaining } from '@/lib/format';
import { cn } from '@/lib/utils';

interface AlertCardProps {
    emoji: string;
    label: string;
    targetDate: string;
    daysRemaining: number;
    severity: AlertSeverity;
    category?: string;
    className?: string;
}

const severityStyles: Record<
    AlertSeverity,
    { card: string; badge: string; pulse: boolean }
> = {
    critical: {
        card: 'border-rose-300/70 bg-rose-50 dark:border-rose-800/60 dark:bg-rose-950/30',
        badge: 'bg-rose-600 text-white',
        pulse: true,
    },
    warning: {
        card: 'border-amber-300/70 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/30',
        badge: 'bg-amber-500 text-white',
        pulse: false,
    },
    ok: {
        card: 'border-emerald-300/70 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/30',
        badge: 'bg-emerald-600 text-white',
        pulse: false,
    },
};

/**
 * Upcoming-reminder card used in the Alerts & Reminders widget.
 */
export function AlertCard({
    emoji,
    label,
    targetDate,
    daysRemaining,
    severity,
    category,
    className,
}: AlertCardProps) {
    const styles = severityStyles[severity];

    return (
        <div
            className={cn(
                'flex w-64 shrink-0 flex-col gap-2 rounded-xl border p-4 shadow-sm',
                styles.card,
                className,
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <span className="text-2xl leading-none">{emoji}</span>
                <span
                    className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
                        styles.badge,
                        styles.pulse && 'animate-pulse',
                    )}
                >
                    {formatDaysRemaining(daysRemaining)}
                </span>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                    {label}
                </span>
                {category && (
                    <span className="text-xs text-muted-foreground">
                        {category}
                    </span>
                )}
                <span className="text-xs text-muted-foreground">
                    {formatDate(targetDate)}
                </span>
            </div>
        </div>
    );
}
