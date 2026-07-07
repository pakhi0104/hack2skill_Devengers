/**
 * Format a date string or Date object into a human-readable string.
 *
 * @param date   - ISO string, Date object, or timestamp number
 * @param style  - 'short' (Jul 7), 'medium' (Jul 7, 2026), or 'long' (Monday, 7 July 2026)
 */
export function formatDate(
  date: string | Date | number,
  style: 'short' | 'medium' | 'long' = 'medium'
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(d.getTime())) return 'Invalid date';

  const options: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { month: 'short', day: 'numeric' }
      : style === 'long'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };

  return d.toLocaleDateString('en-IN', options);
}

/**
 * Returns a relative time string like "2 days ago" or "in 3 hours".
 */
export function timeAgo(date: string | Date | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (Math.abs(diffSec) < 60) return 'just now';
  if (Math.abs(diffMin) < 60) return `${Math.abs(diffMin)} minute${Math.abs(diffMin) !== 1 ? 's' : ''} ago`;
  if (Math.abs(diffHr) < 24) return `${Math.abs(diffHr)} hour${Math.abs(diffHr) !== 1 ? 's' : ''} ago`;
  if (diffDay > 0) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  return `in ${Math.abs(diffDay)} day${Math.abs(diffDay) !== 1 ? 's' : ''}`;
}

/**
 * Returns number of days remaining until a future date.
 * Negative values indicate the date has passed.
 */
export function daysUntil(date: string | Date | number): number {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
