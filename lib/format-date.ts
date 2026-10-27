/**
 * Dates come from the Delivery API as UTC ISO strings. Formatting is pinned to
 * UTC so a published date never shifts a day depending on where it renders.
 */
const BASE_OPTIONS: Intl.DateTimeFormatOptions = { timeZone: "UTC" };

const LOCALE = "en-US";

/** "Jan 2026" */
export function formatMonthYear(value: string | null): string | null {
  if (!value) return null;

  return new Date(value).toLocaleDateString(LOCALE, {
    ...BASE_OPTIONS,
    month: "short",
    year: "numeric",
  });
}

/** "January 27, 2026" */
export function formatLongDate(value: string | null): string | null {
  if (!value) return null;

  return new Date(value).toLocaleDateString(LOCALE, {
    ...BASE_OPTIONS,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
