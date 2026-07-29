import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tabsSource = readFileSync(
  new URL('./JiugongTabs.tsx', import.meta.url),
  'utf8',
);
const globalCss = readFileSync(
  new URL('../../app/globals.css', import.meta.url),
  'utf8',
);

describe('jiugong print report', () => {
  it('lets long report sections and the 90-year table paginate instead of clipping', () => {
    expect(tabsSource).toContain('jiugong-print-report');
    expect(globalCss).toMatch(
      /\.jiugong-print-report\s+section\s*\{[^}]*break-inside:\s*auto\s*!important/s,
    );
    expect(globalCss).toMatch(
      /\.jiugong-print-report\s+\[data-jiugong-years\]\s*\{[^}]*max-height:\s*none\s*!important[^}]*overflow:\s*visible\s*!important/s,
    );
  });
});
