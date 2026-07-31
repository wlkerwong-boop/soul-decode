import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Home from './page';

describe('SoulCode homepage blueprint', () => {
  it('renders the full-height hero and semantic seven-chapter report accordion', () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain('min-h-[100dvh]');
    expect(html).toContain('tracking-[0.05em]');
    expect(html.match(/<details/g)).toHaveLength(7);
    expect(html).not.toContain('flip-card');
  });

  it('renders compact horizontal service and exploration tracks with real routes', () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html.match(/data-service-card="true"/g)).toHaveLength(3);
    expect(html.match(/data-explore-card="true"/g)).toHaveLength(5);
    expect(html.match(/snap-x/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('href="/human-design"');
    expect(html).toContain('href="/dharma"');
    expect(html).not.toContain('href="/events"');
    expect(html).toContain('昌宁活动');
    expect(html).toContain('href="/daily"');
    expect(html).toContain('href="/compatibility"');
    expect(html).toContain('href="/mbti"');
  });
});
