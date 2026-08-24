import { useId, useMemo, useState } from 'react';
import { formatCurrency, formatPercentage } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface DonutChartDatum {
    label: string;
    value: number;
    color: string;
    emoji?: string;
}

interface DonutChartProps {
    data: DonutChartDatum[];
    total: number;
    /** Optional label rendered under the total in the center of the donut. */
    centerLabel?: string;
    onSelect?: (datum: DonutChartDatum) => void;
    className?: string;
}

const SIZE = 200;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Dependency-free inline SVG donut chart with animated arcs, hover tooltips,
 * and optional click-to-drilldown via `onSelect`.
 */
export function DonutChart({
    data,
    total,
    centerLabel,
    onSelect,
    className,
}: DonutChartProps) {
    const gradientId = useId();
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const segments = useMemo(() => {
        let offset = 0;
        return data.map((d) => {
            const fraction = total > 0 ? d.value / total : 0;
            const length = fraction * CIRCUMFERENCE;
            const segment = { ...d, fraction, length, offset };
            offset += length;
            return segment;
        });
    }, [data, total]);

    const hovered = hoverIndex !== null ? segments[hoverIndex] : null;

    if (!data.length || total <= 0) {
        return (
            <div
                className={cn(
                    'flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground',
                    className,
                )}
            >
                <span className="text-3xl">📊</span>
                <span>No data to chart yet</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative flex flex-col items-center gap-4',
                className,
            )}
        >
            <div
                className="relative"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                    });
                }}
                onMouseLeave={() => {
                    setHoverIndex(null);
                    setTooltipPos(null);
                }}
            >
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    width={SIZE}
                    height={SIZE}
                    className="-rotate-90"
                    role="img"
                    aria-label={`Donut chart, total ${formatCurrency(total)}`}
                >
                    <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={RADIUS}
                        fill="none"
                        strokeWidth={STROKE}
                        className="stroke-muted"
                    />
                    {segments.map((seg, i) => {
                        const isHovered = hoverIndex === i;
                        const isDimmed = hoverIndex !== null && !isHovered;
                        return (
                            <circle
                                key={`${gradientId}-${seg.label}-${i}`}
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={RADIUS}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth={isHovered ? STROKE + 4 : STROKE}
                                strokeDasharray={`${seg.length} ${CIRCUMFERENCE - seg.length}`}
                                strokeDashoffset={-seg.offset}
                                strokeLinecap={
                                    segments.length > 1 ? 'butt' : 'round'
                                }
                                className={cn(
                                    'cursor-pointer transition-all duration-500 ease-out',
                                    isDimmed && 'opacity-40',
                                    onSelect && 'cursor-pointer',
                                )}
                                style={{
                                    transformOrigin: `${SIZE / 2}px ${SIZE / 2}px`,
                                }}
                                onMouseEnter={() => setHoverIndex(i)}
                                onClick={() => onSelect?.(seg)}
                            />
                        );
                    })}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-foreground">
                        {formatCurrency(hovered ? hovered.value : total)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {hovered ? hovered.label : (centerLabel ?? 'Total')}
                    </span>
                </div>
                {hovered && tooltipPos && (
                    <div
                        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md"
                        style={{ left: tooltipPos.x, top: tooltipPos.y - 8 }}
                    >
                        <div className="flex items-center gap-1 font-medium">
                            {hovered.emoji && <span>{hovered.emoji}</span>}
                            <span>{hovered.label}</span>
                        </div>
                        <div className="text-muted-foreground">
                            {formatCurrency(hovered.value)} &middot;{' '}
                            {formatPercentage(hovered.fraction * 100, 1)}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {segments.map((seg, i) => (
                    <button
                        type="button"
                        key={`${seg.label}-legend-${i}`}
                        onMouseEnter={() => setHoverIndex(i)}
                        onMouseLeave={() => setHoverIndex(null)}
                        onClick={() => onSelect?.(seg)}
                        className={cn(
                            'flex items-center gap-1.5 rounded px-1 text-xs text-muted-foreground transition-colors hover:text-foreground',
                            onSelect && 'cursor-pointer',
                        )}
                    >
                        <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: seg.color }}
                        />
                        {seg.emoji && <span>{seg.emoji}</span>}
                        <span>{seg.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
