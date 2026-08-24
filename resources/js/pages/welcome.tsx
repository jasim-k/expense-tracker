import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    BarChart3,
    BellRing,
    CalendarCheck2,
    FolderTree,
    PiggyBank,
    SlidersHorizontal,
    Wallet,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        icon: Wallet,
        title: 'Dual cash & bank ledger',
        description:
            'Log every rupee across physical cash and bank accounts separately, with balances that reconcile in real time as you spend.',
    },
    {
        icon: FolderTree,
        title: 'Hierarchical categories',
        description:
            'Organise spending with parent categories and unlimited sub-categories — Vehicles → Tyre Maintenance, Documents → Passport, and beyond.',
    },
    {
        icon: SlidersHorizontal,
        title: 'Dynamic custom fields',
        description:
            'Attach date, number, text or checkbox fields to any sub-category, zero code required. Track odometer readings, document numbers, and more.',
    },
    {
        icon: BellRing,
        title: 'Expiry & service reminders',
        description:
            'Never miss a passport renewal, licence expiry or vehicle service date — automated reminders fire at custom thresholds.',
    },
    {
        icon: PiggyBank,
        title: 'Budgets with alerts',
        description:
            'Set monthly limits per category and watch live progress bars turn from green to amber to red as you approach the ceiling.',
    },
    {
        icon: BarChart3,
        title: 'Reports & CSV export',
        description:
            'Drill into category breakdowns, trend lines, and export clean statements for any date range whenever you need them.',
    },
];

const steps = [
    {
        title: 'Set up your accounts & categories',
        description:
            'Add your cash and bank accounts, then build out a category tree that mirrors how you actually spend.',
    },
    {
        title: 'Log transactions in seconds',
        description:
            'Capture expenses and income with the fast logger — custom fields for documents and assets appear automatically.',
    },
    {
        title: 'Stay ahead with alerts & reports',
        description:
            'Get reminded before anything expires, track budgets in real time, and export reports whenever you need the numbers.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Sabil Tracker — Track cash, bank, assets & documents in one place" />

            <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
                {/* Decorative gradient blobs */}
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
                >
                    <div className="animate-blob absolute -top-32 -left-24 size-96 rounded-full bg-primary/25 blur-3xl" />
                    <div className="animate-blob animation-delay-2000 absolute top-1/3 -right-32 size-[28rem] rounded-full bg-fuchsia-500/15 blur-3xl dark:bg-fuchsia-400/15" />
                    <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/4 size-80 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-400/15" />
                </div>

                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                                <AppLogoIcon className="size-5" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">
                                Sabil Tracker
                            </span>
                        </div>

                        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
                            <a
                                href="#features"
                                className="transition-colors hover:text-foreground"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="transition-colors hover:text-foreground"
                            >
                                How it works
                            </a>
                            <a
                                href="#faq"
                                className="transition-colors hover:text-foreground"
                            >
                                FAQ
                            </a>
                        </nav>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="hidden rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:inline-flex"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                                    >
                                        Get started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    {/* Hero */}
                    <section className="mx-auto grid max-w-7xl gap-12 px-6 pt-16 pb-20 lg:grid-cols-2 lg:items-center lg:pt-24 lg:pb-28">
                        <div className="animate-in duration-700 fade-in slide-in-from-bottom-6">
                            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                Self-hosted &middot; Private &middot; Yours
                            </span>
                            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                                Every rupee,{' '}
                                <span className="bg-gradient-to-r from-primary via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
                                    every asset
                                </span>
                                , never a missed deadline.
                            </h1>
                            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                                Sabil Tracker unifies your cash and bank
                                spending, your vehicles and documents, and their
                                expiry dates in a single premium, self-hosted
                                dashboard — no spreadsheets, no subscriptions,
                                no guesswork.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <Link
                                    href={register()}
                                    className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
                                >
                                    Start tracking for free
                                </Link>
                                <a
                                    href="#features"
                                    className="inline-flex items-center rounded-lg border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
                                >
                                    Explore features
                                </a>
                            </div>
                        </div>

                        {/* App preview mock */}
                        <div className="relative animate-in delay-150 duration-700 fade-in slide-in-from-bottom-8">
                            <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-2xl shadow-primary/10 backdrop-blur-sm sm:p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm font-semibold">
                                        Dashboard
                                    </span>
                                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                        August 2026
                                    </span>
                                </div>

                                {/* Balance tiles */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-primary to-violet-600 p-3 text-primary-foreground shadow-sm">
                                        <p className="text-[11px] opacity-80">
                                            Net Wealth
                                        </p>
                                        <p className="mt-1 text-lg font-bold">
                                            ₹4.82L
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-background p-3">
                                        <p className="text-[11px] text-muted-foreground">
                                            Cash
                                        </p>
                                        <p className="mt-1 text-lg font-bold">
                                            ₹8,450
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-background p-3">
                                        <p className="text-[11px] text-muted-foreground">
                                            Bank
                                        </p>
                                        <p className="mt-1 text-lg font-bold">
                                            ₹4.73L
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-5 gap-4">
                                    {/* Donut chart */}
                                    <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-border bg-background p-3">
                                        <svg
                                            viewBox="0 0 42 42"
                                            className="size-20"
                                        >
                                            <circle
                                                cx="21"
                                                cy="21"
                                                r="15.9"
                                                fill="transparent"
                                                stroke="var(--color-muted)"
                                                strokeWidth="6"
                                            />
                                            <circle
                                                cx="21"
                                                cy="21"
                                                r="15.9"
                                                fill="transparent"
                                                stroke="var(--color-chart-1)"
                                                strokeWidth="6"
                                                strokeDasharray="42 58"
                                                strokeDashoffset="25"
                                                strokeLinecap="round"
                                            />
                                            <circle
                                                cx="21"
                                                cy="21"
                                                r="15.9"
                                                fill="transparent"
                                                stroke="var(--color-chart-2)"
                                                strokeWidth="6"
                                                strokeDasharray="26 74"
                                                strokeDashoffset="-17"
                                                strokeLinecap="round"
                                            />
                                            <circle
                                                cx="21"
                                                cy="21"
                                                r="15.9"
                                                fill="transparent"
                                                stroke="var(--color-chart-3)"
                                                strokeWidth="6"
                                                strokeDasharray="18 82"
                                                strokeDashoffset="-43"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <p className="mt-2 text-center text-[11px] text-muted-foreground">
                                            Category breakdown
                                        </p>
                                    </div>

                                    {/* Reminder card */}
                                    <div className="col-span-3 flex flex-col justify-center gap-2 rounded-xl border border-border bg-background p-3">
                                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-2.5 py-2">
                                            <CalendarCheck2 className="size-4 shrink-0 text-destructive" />
                                            <p className="text-[11px] leading-tight">
                                                Passport expires in{' '}
                                                <span className="font-semibold">
                                                    30 days
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-2">
                                            <BellRing className="size-4 shrink-0 text-primary" />
                                            <p className="text-[11px] leading-tight">
                                                Vehicle service due in{' '}
                                                <span className="font-semibold">
                                                    7 days
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Trust strip */}
                    <section className="border-y border-border/60 bg-accent/40">
                        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 text-center sm:grid-cols-3">
                            <div>
                                <p className="text-2xl font-bold text-primary">
                                    Real-time
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Cash & bank, reconciled instantly
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">
                                    Zero-code
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Custom fields for any asset type
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">
                                    Never late
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Automated expiry & service reminders
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section
                        id="features"
                        className="mx-auto max-w-7xl px-6 py-20 sm:py-24"
                    >
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Everything your finances and assets need
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                One tracker for the money moving through your
                                life and the things you own — built to be fast,
                                thorough and genuinely useful.
                            </p>
                        </div>

                        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <div
                                    key={feature.title}
                                    style={{
                                        animationDelay: `${index * 75}ms`,
                                    }}
                                    className="group animate-in rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-700 fade-in slide-in-from-bottom-4 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                                >
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <feature.icon className="size-5" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* How it works */}
                    <section
                        id="how-it-works"
                        className="border-t border-border/60 bg-accent/30"
                    >
                        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                    Up and running in three steps
                                </h2>
                            </div>

                            <div className="mt-14 grid gap-8 sm:grid-cols-3">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.title}
                                        className="relative animate-in rounded-2xl border border-border/70 bg-card p-6 duration-700 fade-in slide-in-from-bottom-4"
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                        }}
                                    >
                                        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                            {index + 1}
                                        </span>
                                        <h3 className="mt-4 text-lg font-semibold">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section
                        id="faq"
                        className="mx-auto max-w-3xl px-6 py-20 sm:py-24"
                    >
                        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
                            Frequently asked questions
                        </h2>
                        <div className="mt-10 divide-y divide-border rounded-2xl border border-border/70 bg-card">
                            {[
                                {
                                    q: 'Does Sabil Tracker track cash separately from bank accounts?',
                                    a: 'Yes — every transaction is tied to an account of type cash or bank, and balances for each update instantly and independently.',
                                },
                                {
                                    q: 'Can I track things other than money, like a vehicle or a passport?',
                                    a: 'Yes. Attach dynamic custom fields — dates, numbers, text or checkboxes — to any category, then set reminders on any date field.',
                                },
                                {
                                    q: 'Is my data private?',
                                    a: 'Sabil Tracker is self-hosted. Your data lives in your own database — nothing is shared with third parties.',
                                },
                            ].map((item) => (
                                <div key={item.q} className="p-6">
                                    <p className="font-semibold">{item.q}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA band */}
                    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-violet-700 to-fuchsia-700 py-20 text-primary-foreground">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 opacity-20"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 60%, white 0, transparent 35%)',
                            }}
                        />
                        <div className="relative mx-auto max-w-3xl px-6 text-center">
                            <ArrowLeftRight className="mx-auto size-10 opacity-90" />
                            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                                Take control of your cash, assets and deadlines
                                today
                            </h2>
                            <p className="mt-4 text-primary-foreground/85">
                                Set up your first account in under a minute —
                                free, private, and entirely yours.
                            </p>
                            <div className="mt-8 flex justify-center gap-4">
                                <Link
                                    href={register()}
                                    className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
                                >
                                    Create your free account
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-border/60 py-10">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
                        <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <AppLogoIcon className="size-4" />
                            </div>
                            <span className="font-semibold text-foreground">
                                Sabil Tracker
                            </span>
                        </div>
                        <p>
                            &copy; {new Date().getFullYear()} Sabil Tracker.
                            Self-hosted personal finance & asset tracking.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
