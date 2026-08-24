import { useMemo, useState } from 'react';
import { formatCompactCurrency, formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface AreaChartPoint {
    month: string;
    income: number;
    expense: number;
}

interface AreaChartProps {
    data: AreaChartPoint[];
    className?: string;
}

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 28, left: 48 };
const CHART_W = WIDTH - PADDING.left - PADDING.right;
const CHART_H = HEIGHT - PADDING.top - PADDING.bottom;
const GRID_LINES = 4;

/**
 * Dependency-free inline SVG dual-series area/line chart comparing income
 * vs. expense across months, with gridlines and a hover crosshair tooltip.
 */
export function AreaChart({ data, className }: AreaChartProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const maxValue = useMemo(() => {
        const max = data.reduce((m, d) => Math.max(m, d.income, d.expense), 0);
        return max <= 0 ? 1 : max * 1.15;
    }, [data]);

    const xFor = (i: number) =>
        data.length <= 1
            ? PADDING.left + CHART_W / 2
            : PADDING.left + (i / (data.length - 1)) * CHART_W;
    const yFor = (v: number) =>
        PADDING.top + CHART_H - (v / maxValue) * CHART_H;

    const linePath = (key: 'income' | 'expense') =>
        data
            .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d[key])}`)
            .join(' ');

    const areaPath = (key: 'income' | 'expense') => {
        if (!data.length) {
            return '';
        }
        const line = data
            .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d[key])}`)
            .join(' ');
        return `${line} L ${xFor(data.length - 1)} ${PADDING.top + CHART_H} L ${xFor(0)} ${PADDING.top + CHART_H} Z`;
    };

    if (!data.length) {
        return (
            <div
                className={cn(
                    'flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground',
                    className,
                )}
            >
                <span className="text-3xl">📈</span>
                <span>No cash flow history yet</span>
            </div>
        );
    }

    const hovered = hoverIndex !== null ? data[hoverIndex] : null;

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-emerald-500" />{' '}
                    Income
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-500" />{' '}
                    Expense
                </span>
            </div>
            <div className="relative">
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    className="h-auto w-full"
                    role="img"
                    aria-label="Income vs expense over time"
                    onMouseLeave={() => setHoverIndex(null)}
                >
                    <defs>
                        <linearGradient
                            id="area-income-fill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="rgb(16 185 129)"
                                stopOpacity="0.35"
                            />
                            <stop
                                offset="100%"
                                stopColor="rgb(16 185 129)"
                                stopOpacity="0"
                            />
                        </linearGradient>
                        <linearGradient
                            id="area-expense-fill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="rgb(244 63 94)"
                                stopOpacity="0.3"
                            />
                            <stop
                                offset="100%"
                                stopColor="rgb(244 63 94)"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>

                    {Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
                        const y = PADDING.top + (i / GRID_LINES) * CHART_H;
                        const value = maxValue - (i / GRID_LINES) * maxValue;
                        return (
                            <g key={i}>
                                <line
                                    x1={PADDING.left}
                                    y1={y}
                                    x2={WIDTH - PADDING.right}
                                    y2={y}
                                    className="stroke-border"
                                    strokeWidth={1}
                                />
                                <text
                                    x={PADDING.left - 8}
                                    y={y}
                                    textAnchor="end"
                                    dominantBaseline="middle"
                                    className="fill-muted-foreground text-[9px]"
                                >
                                    {formatCompactCurrency(value)}
                                </text>
                            </g>
                        );
                    })}

                    <path
                        d={areaPath('income')}
                        fill="url(#area-income-fill)"
                    />
                    <path
                        d={areaPath('expense')}
                        fill="url(#area-expense-fill)"
                    />
                    <path
                        d={linePath('income')}
                        fill="none"
                        stroke="rgb(16 185 129)"
                        strokeWidth={2}
                    />
                    <path
                        d={linePath('expense')}
                        fill="none"
                        stroke="rgb(244 63 94)"
                        strokeWidth={2}
                    />

                    {data.map((d, i) => (
                        <text
                            key={d.month}
                            x={xFor(i)}
                            y={HEIGHT - 6}
                            textAnchor="middle"
                            className="fill-muted-foreground text-[9px]"
                        >
                            {d.month}
                        </text>
                    ))}

                    {hoverIndex !== null && (
                        <line
                            x1={xFor(hoverIndex)}
                            y1={PADDING.top}
                            x2={xFor(hoverIndex)}
                            y2={PADDING.top + CHART_H}
                            className="stroke-foreground/30"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                        />
                    )}
                    {hovered && hoverIndex !== null && (
                        <>
                            <circle
                                cx={xFor(hoverIndex)}
                                cy={yFor(hovered.income)}
                                r={4}
                                fill="rgb(16 185 129)"
                            />
                            <circle
                                cx={xFor(hoverIndex)}
                                cy={yFor(hovered.expense)}
                                r={4}
                                fill="rgb(244 63 94)"
                            />
                        </>
                    )}

                    {data.map((d, i) => (
                        <rect
                            key={`${d.month}-hit`}
                            x={xFor(i) - CHART_W / Math.max(data.length, 1) / 2}
                            y={PADDING.top}
                            width={CHART_W / Math.max(data.length, 1)}
                            height={CHART_H}
                            fill="transparent"
                            onMouseEnter={() => setHoverIndex(i)}
                        />
                    ))}
                </svg>

                {hovered && hoverIndex !== null && (
                    <div
                        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md"
                        style={{
                            left: `${(xFor(hoverIndex) / WIDTH) * 100}%`,
                            top: `${(Math.min(yFor(hovered.income), yFor(hovered.expense)) / HEIGHT) * 100}%`,
                        }}
                    >
                        <div className="font-medium">{hovered.month}</div>
                        <div className="text-emerald-500">
                            Income {formatCurrency(hovered.income)}
                        </div>
                        <div className="text-rose-500">
                            Expense {formatCurrency(hovered.expense)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
