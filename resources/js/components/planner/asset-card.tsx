import { formatDate, formatNumber } from '@/lib/format';
import type { AssetCard as AssetCardType } from '@/types/tracker';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ReminderBadge } from './reminder-badge';

interface AssetCardProps {
    asset: AssetCardType;
}

function formatFieldValue(field: AssetCardType['fields'][number]): string {
    if (
        field.value === null ||
        field.value === undefined ||
        field.value === ''
    ) {
        return '—';
    }
    if (field.type === 'date') {
        return formatDate(String(field.value));
    }
    if (field.type === 'checkbox') {
        return field.value ? '✓' : '✗';
    }
    if (field.type === 'number') {
        return formatNumber(Number(field.value));
    }
    return String(field.value);
}

const DOCUMENT_OR_VEHICLE_HINT =
    /document|vehicle|passport|licen[cs]e|registration|insurance/i;

/**
 * Renders a single asset/document card: emoji, category breadcrumb, logged date,
 * resolved custom fields, and — if this asset relates to documents/vehicles and
 * has an active reminder — a prominent days-until-expiry indicator.
 */
export function AssetCard({ asset }: AssetCardProps) {
    const isDocumentOrVehicle =
        DOCUMENT_OR_VEHICLE_HINT.test(asset.category) ||
        DOCUMENT_OR_VEHICLE_HINT.test(asset.parent_category ?? '');
    const primaryReminder = asset.reminders[0] ?? null;

    return (
        <Card className="border-border/80 transition-shadow hover:shadow-md">
            <CardHeader className="flex-row items-start justify-between gap-2 px-5">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xl">
                        {asset.icon_emoji}
                    </span>
                    <div>
                        <p className="font-semibold text-foreground">
                            {asset.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {asset.parent_category
                                ? `${asset.parent_category} / `
                                : ''}
                            {asset.category}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5">
                <p className="text-xs text-muted-foreground">
                    Logged on {formatDate(asset.logged_on)}
                </p>

                {isDocumentOrVehicle && primaryReminder && (
                    <div className="flex items-center justify-between rounded-lg border border-violet-200/60 bg-violet-500/5 px-3 py-2 dark:border-violet-800/60">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                {primaryReminder.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(primaryReminder.target_date)}
                            </p>
                        </div>
                        <ReminderBadge
                            daysRemaining={primaryReminder.days_remaining}
                            severity={primaryReminder.severity}
                        />
                    </div>
                )}

                {asset.description && (
                    <p className="text-sm text-muted-foreground">
                        {asset.description}
                    </p>
                )}

                {asset.fields.length > 0 && (
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-3">
                        {asset.fields.map((field) => (
                            <div
                                key={field.key}
                                className="col-span-1 flex flex-col"
                            >
                                <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                                    {field.label}
                                </dt>
                                <dd className="text-sm font-medium text-foreground">
                                    {formatFieldValue(field)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}
            </CardContent>
        </Card>
    );
}
