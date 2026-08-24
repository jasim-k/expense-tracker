import { Link } from '@inertiajs/react';
import { CalendarClock, ShieldAlert } from 'lucide-react';
import { register } from '@/routes';

export function MarketingHero() {
    return (
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pt-16 pb-20 lg:grid-cols-2 lg:items-center lg:pt-24 lg:pb-28">
            <div className="animate-in duration-700 fade-in slide-in-from-bottom-6">
                <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-300">
                    Self-hosted &middot; Private &middot; Yours
                </span>
                <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
                    Your money lives in two places.{' '}
                    <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                        Your documents expire in silence.
                    </span>
                </h1>
                <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                    Sabil Tracker reconciles every cash and bank transaction the
                    moment you log it, and tracks the vehicles, passports and
                    licences that spreadsheets and expense apps were never built
                    to hold — with reminders that fire before it&apos;s too
                    late, not after.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                        href={register()}
                        className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
                    >
                        Start tracking for free
                    </Link>
                    <a
                        href="#problem"
                        className="inline-flex items-center rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                    >
                        See the problem it solves
                    </a>
                </div>
            </div>

            {/* App preview mock */}
            <div className="relative animate-in delay-150 duration-700 fade-in slide-in-from-bottom-8">
                <div
                    aria-hidden
                    className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-100 via-transparent to-transparent blur-2xl dark:from-violet-500/10"
                />
                <div className="rounded-2xl border border-border bg-card p-4 shadow-xl shadow-violet-950/5 sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                            Dashboard
                        </span>
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                            August 2026
                        </span>
                    </div>

                    {/* Balance tiles */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-primary to-violet-600 p-3 text-primary-foreground shadow-sm">
                            <p className="text-[11px] opacity-80">Net Wealth</p>
                            <p className="mt-1 text-lg font-bold">₹4.82L</p>
                        </div>
                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[11px] text-muted-foreground">
                                Cash
                            </p>
                            <p className="mt-1 text-lg font-bold text-foreground">
                                ₹8,450
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[11px] text-muted-foreground">
                                Bank
                            </p>
                            <p className="mt-1 text-lg font-bold text-foreground">
                                ₹4.73L
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-4">
                        {/* Donut chart */}
                        <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-border bg-background p-3">
                            <svg viewBox="0 0 42 42" className="size-20">
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
                            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 dark:border-rose-400/20 dark:bg-rose-400/10">
                                <ShieldAlert className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                <p className="text-[11px] leading-tight text-foreground">
                                    Passport expires in{' '}
                                    <span className="font-semibold">
                                        30 days
                                    </span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-2 dark:border-violet-400/20 dark:bg-violet-400/10">
                                <CalendarClock className="size-4 shrink-0 text-violet-700 dark:text-violet-300" />
                                <p className="text-[11px] leading-tight text-foreground">
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
    );
}
