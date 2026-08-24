import { Calendar, Check, Hash, Type } from 'lucide-react';

const fieldRows = [
    {
        icon: Hash,
        name: 'Odometer (km)',
        type: 'Number',
        extra: null,
    },
    {
        icon: Calendar,
        name: 'Last Service Date',
        type: 'Date',
        extra: 'Reminder: 14 days before',
    },
    {
        icon: Type,
        name: 'Tyre Brand',
        type: 'Text',
        extra: null,
    },
    {
        icon: Check,
        name: 'Inspection Completed',
        type: 'Checkbox',
        extra: null,
    },
];

export function DynamicFieldsShowcase() {
    return (
        <section className="border-y border-border/60 bg-violet-50/40 dark:bg-violet-500/[0.03]">
            <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:py-24 lg:grid-cols-2 lg:items-center">
                <div className="order-2 lg:order-1">
                    <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold tracking-wide text-violet-700 uppercase dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
                        The genuine differentiator
                    </span>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        The Dynamic Fields Engine
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Every other tracker forces your data into an amount and
                        a note. Sabil Tracker lets you design the shape of the
                        data yourself — per sub-category, with zero code and
                        zero migrations.
                    </p>
                    <ul className="mt-6 space-y-4">
                        <li className="flex gap-3">
                            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-400/15 dark:text-violet-300">
                                1
                            </span>
                            <p className="text-sm text-foreground">
                                Open a sub-category and click{' '}
                                <span className="font-semibold">
                                    “+ Add Custom Field”
                                </span>
                                . Choose Date, Number, Text or Checkbox.
                            </p>
                        </li>
                        <li className="flex gap-3">
                            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-400/15 dark:text-violet-300">
                                2
                            </span>
                            <p className="text-sm text-foreground">
                                Turn on a reminder for any Date field and set
                                how many days before it should alert you.
                            </p>
                        </li>
                        <li className="flex gap-3">
                            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-400/15 dark:text-violet-300">
                                3
                            </span>
                            <p className="text-sm text-foreground">
                                From then on, the transaction logger renders
                                those fields automatically whenever that
                                sub-category is selected.
                            </p>
                        </li>
                    </ul>
                </div>

                <div className="relative order-1 lg:order-2">
                    <div
                        aria-hidden
                        className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-100 via-transparent to-transparent blur-2xl dark:from-violet-500/10"
                    />
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-violet-950/5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🚗</span>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Vehicles
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Tyre Maintenance
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                                4 custom fields
                            </span>
                        </div>

                        <div className="mt-5 space-y-2.5">
                            {fieldRows.map((field) => (
                                <div
                                    key={field.name}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
                                >
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                                            <field.icon className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-medium text-foreground">
                                                {field.name}
                                            </p>
                                            {field.extra && (
                                                <p className="truncate text-[11px] text-muted-foreground">
                                                    {field.extra}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="shrink-0 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                        {field.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
