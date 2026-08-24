import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    emoji?: string;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

/**
 * Generic empty-state placeholder: icon/emoji, title, description, and optional CTA.
 */
export function EmptyState({
    icon: IconComponent,
    emoji,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-6 py-10 text-center',
                className,
            )}
        >
            {emoji && <span className="text-4xl">{emoji}</span>}
            {!emoji && IconComponent && (
                <IconComponent className="size-8 text-muted-foreground" />
            )}
            <span className="text-sm font-semibold text-foreground">
                {title}
            </span>
            {description && (
                <span className="max-w-sm text-sm text-muted-foreground">
                    {description}
                </span>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
