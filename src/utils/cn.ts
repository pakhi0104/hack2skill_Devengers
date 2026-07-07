/**
 * Lightweight class-name merger.
 * Concatenates truthy class strings and trims whitespace.
 * Use instead of clsx/classnames to avoid an extra dependency.
 *
 * @example
 * cn('base-class', isActive && 'active', undefined, 'other')
 * // => 'base-class active other'
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}
