export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toDateOnlyString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function lastDayOfMonth(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

export function effectiveRecurrenceDate(
  year: number,
  monthIndex0: number,
  recurrenceDay: number,
): Date {
  const lastDay = lastDayOfMonth(year, monthIndex0);
  const day = Math.min(recurrenceDay, lastDay);
  return new Date(Date.UTC(year, monthIndex0, day));
}

export function monthBounds(
  year: number,
  monthIndex0: number,
): { start: Date; end: Date } {
  const start = new Date(Date.UTC(year, monthIndex0, 1));
  const end = new Date(Date.UTC(year, monthIndex0 + 1, 1));
  return { start, end };
}

export function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}
