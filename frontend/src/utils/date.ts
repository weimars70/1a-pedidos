/**
 * formatDate — returns the first 10 characters (YYYY-MM-DD) of any ISO date string.
 * Handles null / undefined / empty values gracefully by returning ''.
 */
export function formatDate(val: string | Date | null | undefined): string {
  if (!val) return ''
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  // For ISO strings like "2026-01-14T05:00:00.000Z" → "2026-01-14"
  return String(val).slice(0, 10)
}
