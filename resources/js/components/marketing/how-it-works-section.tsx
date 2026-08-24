const steps = [
    {
        title: 'Set up your accounts & categories',
        description:
            'Add your cash and bank accounts, then build a category tree that mirrors how you actually spend — parents, sub-categories, emoji included.',
    },
    {
        title: 'Log as you go, with the fields that matter',
        description:
            'The fast logger records amount, date and category in seconds — and automatically surfaces the custom fields for that category, like odometer or expiry date.',
    },
    {
        title: 'Get warned before deadlines and overspending',
        description:
            'Reminders fire before documents expire and services fall due; budgets flag the moment you approach a limit — while you can still act on it.',
    },
];

export function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            className="border-t border-border/60 bg-accent/30"
        >
            <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Up and running in three steps
                    </h2>
                </div>

                <div className="mt-14 grid gap-8 sm:grid-cols-3">
                    {steps.map((step, index) => (
                        <div
                            key={step.title}
                            className="relative animate-in rounded-2xl border border-border/70 bg-card p-6 shadow-sm duration-700 fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                {index + 1}
                            </span>
                            <h3 className="mt-4 text-lg font-semibold text-foreground">
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
    );
}
