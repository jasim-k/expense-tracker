import {
    Car,
    Check,
    Cloud,
    Gauge,
    PiggyBank,
    ShieldAlert,
    SlidersHorizontal,
    Wallet,
    X,
} from 'lucide-react';

const comparisons = [
    {
        icon: Wallet,
        title: 'Balance guesswork',
        old: 'Cash counted in your head, bank checked in a separate app — the “real” balance is always a guess.',
        fresh: 'One ledger for cash and bank, with balances that reconcile the instant a transaction is logged.',
    },
    {
        icon: SlidersHorizontal,
        title: 'The spreadsheet that dies',
        old: 'Accurate for the first two weeks, then it drifts, falls out of sync, and quietly gets abandoned.',
        fresh: 'A fast logger built for daily use — categorised and dated in seconds, not a weekend project.',
    },
    {
        icon: ShieldAlert,
        title: 'Silent expiries',
        old: 'Passports, driving licences and insurance expire quietly — you find out at the airport or the checkpoint.',
        fresh: 'Every expiry date tracked with colour-coded days-remaining and reminders that fire before the deadline.',
    },
    {
        icon: Car,
        title: 'Maintenance by memory',
        old: 'Vehicle servicing and tyre changes tracked in your head, so they slip until something breaks or costs more.',
        fresh: 'A maintenance planner with odometer readings, service dates and clear next-due badges.',
    },
    {
        icon: Gauge,
        title: 'Nowhere to put the details',
        old: 'Generic expense apps only store an amount and a note — no field for an odometer reading or a document number.',
        fresh: 'The Dynamic Fields Engine: define exactly the fields each category needs. No code, no migration.',
    },
    {
        icon: PiggyBank,
        title: 'Overspending, discovered late',
        old: 'No spending guardrails, so overspending is only visible after the month has already closed.',
        fresh: 'Budgets with live progress and over-budget alerts, visible while it still matters.',
    },
    {
        icon: Cloud,
        title: "Your data, someone else's cloud",
        old: 'Financial and document data sitting on a vendor’s servers, subject to their pricing and their outages.',
        fresh: 'Self-hosted by design — your data lives in your own database, not a third party’s.',
    },
];

export function ProblemSection() {
    return (
        <section
            id="problem"
            className="border-y border-border/60 bg-violet-50/40 dark:bg-violet-500/[0.03]"
        >
            <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700 uppercase dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
                        The old way is broken
                    </span>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        You&apos;re not disorganised. Your tools just
                        weren&apos;t built for this.
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Bank apps only know the bank. Expense apps only know the
                        amount. Nothing in between tracks a passport, a tyre
                        change, or the fact that cash and bank are both your
                        money.
                    </p>
                </div>

                <div className="mt-14 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-[1fr_1fr_1fr] md:divide-x md:divide-y-0">
                        <div className="hidden bg-muted/40 px-6 py-4 text-sm font-semibold text-muted-foreground md:block">
                            Pain point
                        </div>
                        <div className="hidden bg-muted/40 px-6 py-4 text-sm font-semibold text-rose-700 md:block dark:text-rose-300">
                            The old way
                        </div>
                        <div className="hidden bg-muted/40 px-6 py-4 text-sm font-semibold text-emerald-700 md:block dark:text-emerald-300">
                            With Sabil Tracker
                        </div>
                    </div>

                    {comparisons.map((item, index) => (
                        <div
                            key={item.title}
                            style={{ animationDelay: `${index * 60}ms` }}
                            className="grid animate-in grid-cols-1 gap-4 border-t border-border/70 p-6 duration-700 fade-in slide-in-from-bottom-2 first:border-t-0 md:grid-cols-[1fr_1fr_1fr] md:items-center md:gap-6 md:p-0"
                        >
                            <div className="flex items-center gap-3 md:px-6 md:py-6">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                                    <item.icon className="size-4.5" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    {item.title}
                                </h3>
                            </div>
                            <div className="flex items-start gap-2 md:px-6 md:py-6">
                                <X className="mt-0.5 size-4 shrink-0 text-rose-500" />
                                <p className="text-sm text-muted-foreground">
                                    {item.old}
                                </p>
                            </div>
                            <div className="flex items-start gap-2 md:px-6 md:py-6">
                                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <p className="text-sm text-foreground">
                                    {item.fresh}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
