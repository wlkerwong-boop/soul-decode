import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('SoulCode homepage production contract', () => {
  it('keeps the approved display-draft structure in the rendered page', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('class="hero"');
    expect(html).toContain('class="who-grid"');
    expect(html).toContain('class="path-grid"');
    expect(html).toContain('class="preview reveal"');
    expect(html).toContain('class="ecosystem-grid"');
    expect(html).toContain('class="nav-toggle"');
  });

  it('links the three primary paths and partner sites to live destinations', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('href="/master-report"');
    expect(html).toContain('href="/compatibility"');
    expect(html).toContain('href="/tools"');
    expect(html).toContain('https://www.stella-aiedu.com/');
    expect(html).toContain('https://jianjixueyuan.com/');
    expect(html).not.toContain('href="#"');
  });

  it('uses a consistent second-person voice throughout the homepage copy', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('你的');
    expect(html).not.toContain('您的');
  });
});
