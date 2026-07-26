export function centeredScrollTop(
  rowOffsetTop: number,
  rowHeight: number,
  containerHeight: number,
): number {
  return Math.max(0, rowOffsetTop - (containerHeight - rowHeight) / 2);
}
