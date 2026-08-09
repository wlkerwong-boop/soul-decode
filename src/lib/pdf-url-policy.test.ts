import { describe, expect, it } from 'vitest';
import { isAllowedPdfUrl } from './pdf-url-policy';

describe('PDF URL policy', () => {
  it('allows only SoulCode-owned HTTPS pages', () => {
    expect(isAllowedPdfUrl('https://aisoulcode.cn/master-report')).toBe(true);
    expect(isAllowedPdfUrl('https://reports.aisoulcode.cn/view')).toBe(true);
  });

  it('rejects insecure, private, foreign, or credentialed URLs', () => {
    expect(isAllowedPdfUrl('http://aisoulcode.cn/master-report')).toBe(false);
    expect(isAllowedPdfUrl('https://127.0.0.1/admin')).toBe(false);
    expect(isAllowedPdfUrl('https://localhost/admin')).toBe(false);
    expect(isAllowedPdfUrl('https://example.com')).toBe(false);
    expect(isAllowedPdfUrl('https://user:pass@aisoulcode.cn/private')).toBe(false);
    expect(isAllowedPdfUrl('https://aisoulcode.cn:3005/master-report')).toBe(false);
    expect(isAllowedPdfUrl('not-a-url')).toBe(false);
  });
});
