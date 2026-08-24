import {
    BarChart3,
    BellRing,
    CalendarCheck2,
    FolderTree,
    PiggyBank,
    ShieldCheck,
    SlidersHorizontal,
    Wallet,
} from 'lucide-react';

const features = [
    {
        icon: Wallet,
        title: 'Dual cash & bank ledger',
        description:
            'Every transaction is tied to a cash or bank account. Balances update and reconcile the moment you log an expense or income entry — no end-of-month reconstruction.',
    },
    {
        icon: FolderTree,
        title: 'Hierarchical categories',
        description:
            'Parent categories with unlimited sub-categories, each with its own emoji — Vehicles → Tyre Maintenance, Documents → Passport, and however else you actually think about your life.',
    },
    {
        icon: SlidersHorizontal,
        title: 'Dynamic Fields Engine',
        description:
            'Attach Date, Number, Text or Checkbox fields to any sub-category yourself — no code, no migration. The logger renders exactly the fields that category needs.',
    },
    {
        icon: CalendarCheck2,
        title: 'Document & maintenance planner',
        description:
            'A dedicated screen for passports, licences and vehicles, with colour-coded days-remaining — green, amber, red — so nothing sneaks up on you.',
    },
    {
        icon: BellRing,
        title: 'Automated reminders',
        description:
            'A nightly scheduler checks every date field with a reminder enabled and sends email and in-app alerts at the custom offset you set, e.g. “30 days before”.',
    },
    {
        icon: PiggyBank,
        title: 'Budgets with live alerts',
        description:
            'Set a monthly limit per category and watch progress bars move from green to amber to red in real time, with an over-budget alert the moment you cross the line.',
    },
    {
        icon: BarChart3,
        title: 'Reports with drill-down & export',
        description:
            'Category breakdowns and trend charts you can drill into by parent or sub-category, plus a clean CSV export for any date range.',
    },
    {
        icon: ShieldCheck,
        title: 'Self-hosted, always yours',
        description:
            'Runs on your own Laravel install and your own database. There is no vendor lock-in and nothing to export because it never left.',
    },
];

export function FeaturesSection() {
    return (
        <section
            id="features"
            className="mx-auto max-w-7xl px-6 py-20 sm:py-24"
        >
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Everything your finances and assets need
                </h2>
                <p className="mt-4 text-muted-foreground">
                    One tracker for the money moving through your life and the
                    things you own — accurate to what the app actually does, not
                    a marketing wish list.
                </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <div
                        key={feature.title}
                        style={{ animationDelay: `${index * 75}ms` }}
                        className="group animate-in rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-700 fade-in slide-in-from-bottom-4 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-950/5 dark:hover:border-violet-400/40"
                    >
                        <div className="flex size-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition-colors group-hover:bg-primary group-hover:text-primary-foreground dark:bg-violet-400/10 dark:text-violet-300">
                            <feature.icon className="size-5" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-foreground">
                            {feature.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
