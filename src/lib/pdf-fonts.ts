import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PDF_FONT_DIR = join(process.cwd(), 'public/fonts/lxgwwenkai/files');
const FONT_URL_PATTERN = /(?:https?:\/\/[^/"'()\s]+)?\/fonts\/lxgwwenkai\/files\/([A-Za-z0-9._-]+\.woff2)(?:[?#][^"'()\s]*)?/g;
const FONT_FACE_PATTERN = /@font-face\s*{[^}]*}/gi;
const fontDataCache = new Map<string, string>();

type UnicodeRange = { start: number; end: number };

function parseUnicodeRanges(value: string): UnicodeRange[] {
  return value.split(',').flatMap((part) => {
    const token = part.trim().replace(/^U\+/i, '').toUpperCase();
    if (!token) return [];

    if (token.includes('?')) {
      return [{
        start: parseInt(token.replace(/\?/g, '0'), 16),
        end: parseInt(token.replace(/\?/g, 'F'), 16),
      }];
    }

    const [startText, endText] = token.split('-');
    const start = parseInt(startText, 16);
    const end = endText ? parseInt(endText, 16) : start;
    return Number.isFinite(start) && Number.isFinite(end) ? [{ start, end }] : [];
  });
}

function fontFaceCoversMarkup(block: string, codePoints: Set<number>): boolean {
  const rangeText = block.match(/unicode-range\s*:\s*([^;}]+)/i)?.[1];
  if (!rangeText) return true;

  const ranges = parseUnicodeRanges(rangeText);
  return ranges.some(({ start, end }) => {
    for (const codePoint of codePoints) {
      if (codePoint >= start && codePoint <= end) return true;
    }
    return false;
  });
}

function readFontAsDataUrl(filename: string): string | null {
  if (!/^[A-Za-z0-9._-]+\.woff2$/.test(filename)) return null;

  const fontPath = join(PDF_FONT_DIR, filename);
  if (!existsSync(fontPath)) return null;

  const cached = fontDataCache.get(filename);
  if (cached) return cached;

  const dataUrl = `data:font/woff2;base64,${readFileSync(fontPath).toString('base64')}`;
  fontDataCache.set(filename, dataUrl);
  return dataUrl;
}

/**
 * PDF rendering starts from about:blank, so external font URLs can fail CORS
 * or resource loading even when the same stylesheet works in the browser.
 * Embed our local font subsets to make the PDF independent of network access.
 */
export function inlinePdfFontSources(markup: string): string {
  const codePoints = new Set(
    Array.from(markup, (character) => character.codePointAt(0)).filter(
      (codePoint): codePoint is number => codePoint !== undefined,
    ),
  );

  return markup.replace(FONT_FACE_PATTERN, (block) => {
    if (!fontFaceCoversMarkup(block, codePoints)) return block;
    return block.replace(FONT_URL_PATTERN, (match, filename: string) => {
      return readFontAsDataUrl(filename) ?? match;
    });
  });
}
