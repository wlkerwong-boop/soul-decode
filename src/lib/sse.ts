export function takeSseLines(buffer: string, flush = false): { lines: string[]; remainder: string } {
  const parts = buffer.split('\n');
  if (flush) return { lines: parts.filter(Boolean), remainder: '' };
  return { lines: parts.slice(0, -1), remainder: parts.at(-1) || '' };
}
