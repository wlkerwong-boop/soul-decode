import { describe, expect, it } from 'vitest';
import { inlinePdfFontSources } from './pdf-fonts';

describe('inlinePdfFontSources', () => {
  it('embeds the local LXGW WenKai subset used by a PDF stylesheet', () => {
    const source = `@font-face { src: url("https://aisoulcode.cn/fonts/lxgwwenkai/files/lxgwwenkai-regular-subset-4.woff2"); }`;

    const result = inlinePdfFontSources(source);

    expect(result).toContain('data:font/woff2;base64,');
    expect(result).not.toContain('aisoulcode.cn/fonts/lxgwwenkai/files');
  });

  it('leaves unrelated resources unchanged', () => {
    const source = 'body { background: url("https://aisoulcode.cn/assets/report.png"); }';

    expect(inlinePdfFontSources(source)).toBe(source);
  });

  it('only embeds font subsets whose unicode range appears in the PDF markup', () => {
    const source = `
      @font-face {
        font-family: 'LXGW WenKai';
        src: url("https://aisoulcode.cn/fonts/lxgwwenkai/files/lxgwwenkai-regular-subset-4.woff2");
        unicode-range: U+4EBA;
      }
      @font-face {
        font-family: 'LXGW WenKai';
        src: url("https://aisoulcode.cn/fonts/lxgwwenkai/files/lxgwwenkai-regular-subset-5.woff2");
        unicode-range: U+1F300;
      }
      <p>人</p>
    `;

    const result = inlinePdfFontSources(source);

    expect(result).toContain('data:font/woff2;base64,');
    expect(result).not.toContain('subset-4.woff2');
    expect(result).toContain('subset-5.woff2');
    expect(result).not.toMatch(/subset-5\.woff2[^}]*data:font\/woff2;base64,/);
  });
});
