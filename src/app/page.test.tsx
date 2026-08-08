import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('SoulCode homepage production contract', () => {
  it('keeps the homepage CSS class structure in the rendered page', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('class="hero hero-light"');
    expect(html).toContain('class="cards"');
    expect(html).toContain('class="report"');
    expect(html).toContain('class="explore-track reveal"');
    expect(html).toContain('class="about reveal"');
    expect(html).toContain('class="nav-toggle"');
  });

  it('links the Changning star-map activity to its live tools page', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('href="/tools"');
    expect(html).toContain('点亮星图');
    expect(html).toContain('昌宁茶乡精神图谱共建行动 · 亲子互动工具包');
    expect(html).not.toContain('即将推出');
    expect(html).not.toContain('八字命盘');
  });

  it('uses a consistent second-person voice throughout the homepage copy', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('你的');
    expect(html).not.toContain('您的');
  });
});
