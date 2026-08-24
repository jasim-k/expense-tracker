import { Link } from '@inertiajs/react';
import {
    BarChart3,
    CalendarClock,
    LayoutGrid,
    Plus,
    ArrowLeftRight,
} from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import {
    create as createTransaction,
    index as transactionsIndex,
} from '@/routes/transactions';
import { index as plannerIndex } from '@/routes/planner';
import { index as reportsIndex } from '@/routes/reports';

const tabs = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Transactions', href: transactionsIndex(), icon: ArrowLeftRight },
] as const;

const tabsAfterFab = [
    { title: 'Planner', href: plannerIndex(), icon: CalendarClock },
    { title: 'Reports', href: reportsIndex(), icon: BarChart3 },
] as const;

export function MobileTabBar() {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-sidebar-border bg-sidebar/95 backdrop-blur-sm md:hidden">
            <div className="mx-auto flex max-w-md items-center justify-between px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
                {tabs.map((tab) => {
                    const active = isCurrentUrl(tab.href);

                    return (
                        <Link
                            key={tab.title}
                            href={tab.href}
                            prefetch
                            className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[11px] font-medium transition-colors ${
                                active
                                    ? 'text-primary'
                                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
                            }`}
                        >
                            <tab.icon className="size-5" />
                            <span>{tab.title}</span>
                        </Link>
                    );
                })}

                <Link
                    href={createTransaction()}
                    prefetch
                    aria-label="Add transaction"
                    className="-mt-6 flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 shadow-primary/30 ring-sidebar transition-transform active:scale-95"
                >
                    <Plus className="size-6" />
                </Link>

                {tabsAfterFab.map((tab) => {
                    const active = isCurrentUrl(tab.href);

                    return (
                        <Link
                            key={tab.title}
                            href={tab.href}
                            prefetch
                            className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[11px] font-medium transition-colors ${
                                active
                                    ? 'text-primary'
                                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
                            }`}
                        >
                            <tab.icon className="size-5" />
                            <span>{tab.title}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
