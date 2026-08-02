import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('SoulCode homepage production contract', () => {
  it('keeps the homepage CSS class structure in the rendered page', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('class="hero"');
    expect(html).toContain('class="cards"');
    expect(html).toContain('class="report"');
    expect(html).toContain('class="explore-track reveal"');
    expect(html).toContain('class="about about-text-only reveal"');
  });

  it('links the Changning star-map activity to its live tools page', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('href="/tools"');
    expect(html).toContain('点亮星图');
    expect(html).toContain('昌宁茶乡精神图谱共建行动 · 亲子互动工具包');
    expect(html).not.toContain('即将推出');
    expect(html).not.toContain('explore-badge');
  });

  it('uses 您 throughout the homepage copy', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).not.toContain('你');
    expect(html).toContain('您的');
  });
});
