export const MIN_SUPPORTED_BIRTH_YEAR = 1800;
export const MAX_SUPPORTED_BIRTH_YEAR = 2100;

export function isSupportedBirthYear(year: number) {
  return Number.isInteger(year)
    && year >= MIN_SUPPORTED_BIRTH_YEAR
    && year <= MAX_SUPPORTED_BIRTH_YEAR;
}

export function validateReportBirth(input: { year?: unknown; month?: unknown; day?: unknown; hour?: unknown; minute?: unknown }): boolean {
  const parse = (value: unknown): number => {
    if (typeof value !== 'string' && typeof value !== 'number') return NaN;
    if (!/^\d+$/.test(String(value))) return NaN;
    return Number(value);
  };
  const year = parse(input.year), month = parse(input.month), day = parse(input.day);
  const hour = input.hour === undefined || input.hour === null || input.hour === '' ? 12 : parse(input.hour);
  const minute = input.minute === undefined || input.minute === null || input.minute === '' ? 0 : parse(input.minute);
  if (!isSupportedBirthYear(year) || !Number.isInteger(month) || month < 1 || month > 12 ||
      !Number.isInteger(day) || day < 1 || !Number.isInteger(hour) || hour < 0 || hour > 23 ||
      !Number.isInteger(minute) || minute < 0 || minute > 59) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
