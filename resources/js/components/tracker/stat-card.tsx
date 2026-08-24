import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type StatCardVariant = 'purple' | 'emerald' | 'rose' | 'amber' | 'slate';

interface StatCardProps {
    label: string;
    value: ReactNode;
    /** Optional delta or sub-line shown beneath the value, e.g. "+4.2% vs last month". */
    sub?: ReactNode;
    emoji?: string;
    icon?: LucideIcon;
    variant?: StatCardVariant;
    /** Renders the tile with a bold gradient treatment, intended for the primary hero tile. */
    hero?: boolean;
    className?: string;
}

const variantStyles: Record<StatCardVariant, { icon: string; ring: string }> = {
    purple: {
        icon: 'bg-violet-500/15 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300',
        ring: 'border-violet-200/60 dark:border-violet-800/60',
    },
    emerald: {
        icon: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300',
        ring: 'border-emerald-200/60 dark:border-emerald-800/60',
    },
    rose: {
        icon: 'bg-rose-500/15 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300',
        ring: 'border-rose-200/60 dark:border-rose-800/60',
    },
    amber: {
        icon: 'bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300',
        ring: 'border-amber-200/60 dark:border-amber-800/60',
    },
    slate: {
        icon: 'bg-slate-500/15 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300',
        ring: 'border-border',
    },
};

/**
 * Reusable metric tile used across the dashboard for balances and quick stats.
 */
export function StatCard({
    label,
    value,
    sub,
    emoji,
    icon: IconComponent,
    variant = 'slate',
    hero = false,
    className,
}: StatCardProps) {
    if (hero) {
        return (
            <Card
                className={cn(
                    'relative overflow-hidden border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-white shadow-sm dark:border-0 dark:from-violet-700 dark:via-violet-700 dark:to-purple-900 dark:shadow-lg dark:shadow-violet-600/20',
                    className,
                )}
            >
                <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-violet-200/40 blur-2xl dark:bg-white/10" />
                <CardContent className="relative flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-100">
                        {emoji && (
                            <span className="text-lg leading-none">
                                {emoji}
                            </span>
                        )}
                        {IconComponent && <IconComponent className="size-4" />}
                        <span>{label}</span>
                    </div>
                    <div className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl dark:text-white">
                        {value}
                    </div>
                    {sub && (
                        <div className="text-sm text-violet-600/90 dark:text-violet-100/90">
                            {sub}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    const styles = variantStyles[variant];

    return (
        <Card className={cn('border', styles.ring, className)}>
            <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                        {label}
                    </span>
                    {(emoji || IconComponent) && (
                        <span
                            className={cn(
                                'flex size-8 items-center justify-center rounded-full text-base',
                                styles.icon,
                            )}
                        >
                            {emoji ??
                                (IconComponent ? (
                                    <IconComponent className="size-4" />
                                ) : null)}
                        </span>
                    )}
                </div>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                    {value}
                </div>
                {sub && (
                    <div className="text-xs text-muted-foreground">{sub}</div>
                )}
            </CardContent>
        </Card>
    );
}
