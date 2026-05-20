const fmt = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const fmtShort = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function formatEventDate(startDate: Date | null, endDate: Date | null): string | null {
  if (!startDate) return null;
  if (!endDate || startDate.getTime() === endDate.getTime()) {
    return fmt.format(startDate);
  }
  // Same year: "15–17 giugno 2024"
  if (startDate.getUTCFullYear() === endDate.getUTCFullYear()) {
    return `${fmtShort.format(startDate)} – ${fmt.format(endDate)}`;
  }
  return `${fmt.format(startDate)} – ${fmt.format(endDate)}`;
}

/** Convert a date-only string like "2024-06-15" to midnight UTC Date */
export function parseLocalDate(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`);
}

/** Format a Date as "YYYY-MM-DD" for <input type="date"> defaultValue */
export function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
