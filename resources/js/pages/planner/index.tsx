import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { AssetCard } from '@/components/planner/asset-card';
import { Checklist } from '@/components/planner/checklist';
import { AlertCard } from '@/components/tracker/alert-card';
import { EmptyState } from '@/components/tracker/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { index as plannerIndex } from '@/routes/planner';
import { create as createTransaction } from '@/routes/transactions';
import type { PlannerProps } from '@/types/tracker';

export default function Planner({ upcoming, assets, checklist }: PlannerProps) {
    return (
        <>
            <Head title="Documents & Maintenance Planner" />

            <div className="relative flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Documents &amp; Maintenance Planner
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Keep every document expiry and vehicle service date
                        under control.
                    </p>
                </div>

                <section className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                        Upcoming Urgent Reminders
                    </h2>
                    {upcoming.length === 0 ? (
                        <EmptyState
                            emoji="✅"
                            title="No urgent reminders"
                            description="Everything is up to date for now."
                        />
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {upcoming.map((item) => (
                                <AlertCard
                                    key={item.id}
                                    emoji={item.icon_emoji}
                                    label={item.label}
                                    category={item.category}
                                    targetDate={item.target_date}
                                    daysRemaining={item.days_remaining}
                                    severity={item.severity}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                        Asset &amp; Document Cards
                    </h2>
                    {assets.length === 0 ? (
                        <EmptyState
                            emoji="🗂️"
                            title="No asset cards yet"
                            description="Log a document or vehicle asset to see it tracked here."
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {assets.map((asset) => (
                                <AssetCard
                                    key={asset.transaction_id}
                                    asset={asset}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="flex flex-col gap-3 pb-24">
                    <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                        Pending Checklists
                    </h2>
                    <Card>
                        <CardContent className="px-5">
                            {checklist.length === 0 ? (
                                <EmptyState
                                    emoji="📝"
                                    title="Nothing pending"
                                    description="All checklist items are complete."
                                    className="border-0 py-6"
                                />
                            ) : (
                                <Checklist items={checklist} />
                            )}
                        </CardContent>
                    </Card>
                </section>

                <Link
                    href={createTransaction()}
                    className="fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 hover:bg-primary/90"
                >
                    <Plus className="size-4" />
                    Add Document/Asset Card
                </Link>
            </div>
        </>
    );
}

Planner.layout = {
    breadcrumbs: [
        {
            title: 'Planner',
            href: plannerIndex(),
        },
    ],
};
