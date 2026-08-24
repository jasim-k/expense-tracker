/**
 * Shared formatting helpers for currency, dates, and numbers used across the
 * expense tracker UI.
 */

const CURRENCY = 'USD';
const LOCALE = 'en-US';

/**
 * Format a numeric amount as currency (USD).
 */
export function formatCurrency(
    amount: number,
    options?: Intl.NumberFormatOptions,
): string {
    return new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: CURRENCY,
        maximumFractionDigits: 2,
        ...options,
    }).format(amount ?? 0);
}

/**
 * Format a numeric amount as a compact currency string, e.g. $12.3K.
 */
export function formatCompactCurrency(amount: number): string {
    return new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: CURRENCY,
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount ?? 0);
}

/**
 * Format a plain number with thousands separators.
 */
export function formatNumber(
    value: number,
    options?: Intl.NumberFormatOptions,
): string {
    return new Intl.NumberFormat(LOCALE, options).format(value ?? 0);
}

/**
 * Format a percentage value (0-100) with a fixed number of decimals.
 */
export function formatPercentage(value: number, fractionDigits = 0): string {
    return `${(value ?? 0).toFixed(fractionDigits)}%`;
}

/**
 * Format an ISO date string (YYYY-MM-DD or full timestamp) into a readable label.
 */
export function formatDate(
    value: string,
    options?: Intl.DateTimeFormatOptions,
): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(LOCALE, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options,
    }).format(date);
}

/**
 * Format a "days remaining" number into a human readable phrase.
 */
export function formatDaysRemaining(days: number): string {
    if (days < 0) {
        return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
    }
    if (days === 0) {
        return 'Due today';
    }
    return `in ${days} day${days === 1 ? '' : 's'}`;
}
