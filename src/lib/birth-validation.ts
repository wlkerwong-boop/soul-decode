export const MIN_SUPPORTED_BIRTH_YEAR = 1800;
export const MAX_SUPPORTED_BIRTH_YEAR = 2100;

export function isSupportedBirthYear(year: number) {
  return Number.isInteger(year)
    && year >= MIN_SUPPORTED_BIRTH_YEAR
    && year <= MAX_SUPPORTED_BIRTH_YEAR;
}
