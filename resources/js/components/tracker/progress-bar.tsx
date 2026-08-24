import { formatPercentage } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    label: string;
    /** Percentage value 0-100+. Determines the status color automatically unless `status` is provided. */
    percentage: number;
    sub?: string;
    className?: string;
}

function statusFor(percentage: number): 'good' | 'warning' | 'over' {
    if (percentage >= 100) {
        return 'over';
    }
    if (percentage >= 70) {
        return 'warning';
    }
    return 'good';
}

const barColor: Record<string, string> = {
    good: 'bg-emerald-500',
    warning: 'bg-amber-500',
    over: 'bg-rose-500',
};

const textColor: Record<string, string> = {
    good: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    over: 'text-rose-600 dark:text-rose-400',
};

/**
 * Labeled progress bar with automatic status coloring: green (<70%), amber (70-90%), red (>=100%).
 */
export function ProgressBar({
    label,
    percentage,
    sub,
    className,
}: ProgressBarProps) {
    const status = statusFor(percentage);
    const clamped = Math.min(percentage, 100);

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-foreground">{label}</span>
                <span className={cn('font-semibold', textColor[status])}>
                    {formatPercentage(percentage, 0)}
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        barColor[status],
                    )}
                    style={{ width: `${clamped}%` }}
                />
            </div>
            {sub && (
                <span className="text-xs text-muted-foreground">{sub}</span>
            )}
        </div>
    );
}
