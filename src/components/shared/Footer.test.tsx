import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer social links', () => {
  it('renders WeChat, Xiaohongshu, and Stella as labeled circular icons', () => {
    const html = renderToStaticMarkup(
      <Footer
        brand="灵魂解码"
        description="description"
        socialLinks={[
          { label: '微信', href: '#wechat' },
          { label: '小红书', href: '#xiaohongshu' },
          { label: 'Stella', href: 'https://www.stella-aiedu.com' },
        ]}
      />,
    );

    expect(html.match(/data-social-icon=/g)).toHaveLength(3);
    expect(html.match(/rounded-full/g)).toHaveLength(3);
    expect(html).toContain('aria-label="微信"');
    expect(html).toContain('aria-label="小红书"');
    expect(html).toContain('aria-label="Stella"');
    expect(html.match(/<svg/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
