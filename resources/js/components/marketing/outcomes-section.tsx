import { Fingerprint, Gauge, Layers, ShieldCheck } from 'lucide-react';

const outcomes = [
    {
        icon: Gauge,
        title: 'You always know what you can actually spend today',
        description:
            'Cash and bank reconcile as you log, and budgets show live progress — not a number you reconstruct at month end.',
    },
    {
        icon: ShieldCheck,
        title: 'Nothing expires without warning',
        description:
            'Every date you care about — passport, licence, insurance, service — is tracked with a reminder, not left to memory.',
    },
    {
        icon: Layers,
        title: 'Your tracker matches your life, not a template',
        description:
            'Categories, sub-categories and custom fields are yours to define, so the app fits how you actually live and spend.',
    },
    {
        icon: Fingerprint,
        title: 'Your data stays yours',
        description:
            'Self-hosted on your own infrastructure, in your own database — no vendor, no subscription, no third-party access.',
    },
];

export function OutcomesSection() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Why Sabil Tracker
                </h2>
                <p className="mt-4 text-muted-foreground">
                    Not more features for their own sake — the outcomes that
                    actually change once cash, bank, assets and deadlines live
                    in one place.
                </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2">
                {outcomes.map((outcome, index) => (
                    <div
                        key={outcome.title}
                        style={{ animationDelay: `${index * 90}ms` }}
                        className="flex animate-in gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm duration-700 fade-in slide-in-from-bottom-4"
                    >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                            <outcome.icon className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-foreground">
                                {outcome.title}
                            </h3>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                                {outcome.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
