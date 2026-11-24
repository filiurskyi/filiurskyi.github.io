import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { dateOnlyKeys } from "./contentFiles";
import { resolveTimezone } from "./resolveTimezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * YAML reads a date without a time (`2026-01-01`) as UTC midnight, which is
 * the previous day west of UTC. This returns midnight of that calendar day
 * in `zone` instead.
 */
export function calendarDate(date: Date, zone: string | undefined): Date {
  const day = date.toISOString().slice(0, 10);
  return dayjs.tz(day, resolveTimezone(zone)).toDate();
}

/**
 * `data`, the parsed frontmatter of `source`, with each value written as a
 * bare `YYYY-MM-DD` read as that calendar day in `zone`. A value with a time,
 * midnight UTC included, is left unchanged.
 */
export function withCalendarDays<T extends Record<string, unknown>>(
  data: T,
  source: string,
  zone: string | undefined
): T {
  const out: Record<string, unknown> = { ...data };
  for (const key of dateOnlyKeys(source)) {
    const value = out[key];
    if (value instanceof Date) out[key] = calendarDate(value, zone);
  }
  return out as T;
}

/** The zone of an entry's dates: its own `timezone`, else the site's. */
export const entryTimezone = (
  data: Record<string, unknown>,
  siteTimezone: string | undefined
): string | undefined =>
  (typeof data.timezone === "string" && data.timezone) || siteTimezone;
