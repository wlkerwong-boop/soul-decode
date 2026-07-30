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
  it('renders the individualized four-layer explanation inside the environment chapter', () => {
    expect(tabsSource).toContain('buildRelationshipDetails');
    expect(tabsSource).toContain('个人年度四层关系详解');
    expect(tabsSource).toContain('为什么这样判断');
    expect(tabsSource).toContain('与你的个人结构如何结合');
    expect(tabsSource).toContain('行动建议');
  });

  it('lets long report sections and the 90-year table paginate instead of clipping', () => {
    expect(tabsSource).toContain('jiugong-print-report');
    expect(tabsSource).not.toContain('jiugong-print-report hidden');
    expect(globalCss).toContain('.jiugong-print-report { display: none !important; }');
    expect(globalCss).toMatch(
      /\.jiugong-print-report,\s*\.jiugong-print-report \*\s*\{[^}]*animation:\s*none\s*!important[^}]*opacity:\s*1\s*!important/s,
    );
    expect(globalCss).toMatch(
      /\.jiugong-print-report\s+section\s*\{[^}]*display:\s*block\s*!important[^}]*break-inside:\s*auto\s*!important/s,
    );
    expect(globalCss).toMatch(
      /\.jiugong-print-report\s+\[data-jiugong-years\]\s*\{[^}]*max-height:\s*none\s*!important[^}]*overflow:\s*visible\s*!important/s,
    );
  });
});
