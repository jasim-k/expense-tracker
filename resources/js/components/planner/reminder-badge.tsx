import type { AlertSeverity } from '@/types/tracker';
import { cn } from '@/lib/utils';

interface ReminderBadgeProps {
    daysRemaining: number;
    severity?: AlertSeverity;
    className?: string;
}

/**
 * Large colour-coded "N days left" badge.
 * Green > 180 days, Orange 30-180 days, Red < 30 days (with a subtle pulse).
 */
export function ReminderBadge({
    daysRemaining,
    className,
}: ReminderBadgeProps) {
    const isOverdue = daysRemaining < 0;
    const tier = isOverdue
        ? 'red'
        : daysRemaining < 30
          ? 'red'
          : daysRemaining <= 180
            ? 'orange'
            : 'green';

    const tierStyles: Record<string, string> = {
        green: 'bg-emerald-500/15 text-emerald-700 border-emerald-300/60 dark:text-emerald-300 dark:border-emerald-700/60',
        orange: 'bg-amber-500/15 text-amber-700 border-amber-300/60 dark:text-amber-300 dark:border-amber-700/60',
        red: 'bg-rose-500/15 text-rose-700 border-rose-300/60 dark:text-rose-300 dark:border-rose-700/60',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold',
                tierStyles[tier],
                tier === 'red' && 'animate-pulse',
                className,
            )}
        >
            {isOverdue
                ? `${Math.abs(daysRemaining)}d overdue`
                : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`}
        </span>
    );
}
