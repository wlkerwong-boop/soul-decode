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

  it('uses the real assessment routes and marks Changning as upcoming', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('href="/human-design"');
    expect(html).toContain('href="/mbti"');
    expect(html).toContain('href="/compatibility"');
    expect(html).toContain('昌宁活动');
    expect(html).toContain('即将推出');
    expect(html).not.toContain('href="#"><span class="explore-ico">🧠</span><span class="explore-name">大五人格测评');
    expect(html).not.toContain('href="#"><span class="explore-ico">🔮</span><span class="explore-name">八字命盘');
  });

  it('uses 您 throughout the homepage copy', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).not.toContain('你');
    expect(html).toContain('您的');
  });
});
