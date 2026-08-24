import { Link } from '@inertiajs/react';
import {
    ArrowLeftRight,
    BarChart3,
    BellRing,
    CalendarClock,
    FolderTree,
    LayoutGrid,
    LifeBuoy,
    PiggyBank,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as accountsIndex } from '@/routes/accounts';
import { index as budgetsIndex } from '@/routes/budgets';
import { index as categoriesIndex } from '@/routes/categories';
import { index as plannerIndex } from '@/routes/planner';
import { index as remindersIndex } from '@/routes/reminders';
import { index as reportsIndex } from '@/routes/reports';
import { index as transactionsIndex } from '@/routes/transactions';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Transactions',
        href: transactionsIndex(),
        icon: ArrowLeftRight,
    },
    {
        title: 'Categories',
        href: categoriesIndex(),
        icon: FolderTree,
    },
    {
        title: 'Planner',
        href: plannerIndex(),
        icon: CalendarClock,
    },
    {
        title: 'Reminders',
        href: remindersIndex(),
        icon: BellRing,
    },
    {
        title: 'Budgets',
        href: budgetsIndex(),
        icon: PiggyBank,
    },
    {
        title: 'Reports',
        href: reportsIndex(),
        icon: BarChart3,
    },
    {
        title: 'Accounts',
        href: accountsIndex(),
        icon: Wallet,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Support',
        href: 'mailto:support@sabiltracker.app',
        icon: LifeBuoy,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
