import { format, formatDistanceToNow, parseISO, isAfter, isBefore, addDays } from 'date-fns';

/**
 * Helper to ensure any input is converted to a valid Date object.
 */
function toDate(input: string | Date | number | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === 'number') return new Date(input);
  try {
    const parsed = parseISO(input);
    return isNaN(parsed.getTime()) ? new Date(input) : parsed;
  } catch {
    return null;
  }
}

/**
 * Format a UTC ISO string, Date object, or timestamp to a human-readable date.
 */
export function formatDate(date: string | Date | number | null | undefined, pattern = 'yyyy-MM-dd'): string {
  const d = toDate(date);
  if (!d) return '—';
  try {
    return format(d, pattern);
  } catch {
    return '—';
  }
}

/**
 * Format a UTC ISO string or Date object to date + time.
 */
export function formatDateTime(date: string | Date | number | null | undefined, pattern = 'yyyy-MM-dd HH:mm'): string {
  const d = toDate(date);
  if (!d) return '—';
  try {
    return format(d, pattern);
  } catch {
    return '—';
  }
}

/**
 * Returns a relative time string (e.g., "2 hours ago", "in 3 days").
 */
export function timeAgo(date: string | Date | number | null | undefined): string {
  const d = toDate(date);
  if (!d) return '—';
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
}

/**
 * Check if a date is overdue (past current time).
 */
export function isOverdue(date: string | Date | number | null | undefined): boolean {
  const d = toDate(date);
  if (!d) return false;
  try {
    return isBefore(d, new Date());
  } catch {
    return false;
  }
}

/**
 * Check if a date is within N days from now (for "due soon" warnings).
 */
export function isDueSoon(date: string | Date | number | null | undefined, withinDays = 3): boolean {
  const d = toDate(date);
  if (!d) return false;
  try {
    const threshold = addDays(new Date(), withinDays);
    return isAfter(d, new Date()) && isBefore(d, threshold);
  } catch {
    return false;
  }
}
