/** Format the user's birthplace-local civil date for lifecycle parsing. */
export function formatBirthDateForLifecycle(year: number, month: number, day: number) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
