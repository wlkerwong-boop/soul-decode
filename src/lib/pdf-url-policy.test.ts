import { describe, expect, it } from 'vitest';
import { isAllowedPdfResourceUrl, isAllowedPdfUrl } from './pdf-url-policy';

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

describe('PDF browser resource policy', () => {
  it('allows embedded data and own static resources for supplied HTML', () => {
    expect(isAllowedPdfResourceUrl('data:image/png;base64,AA==')).toBe(true);
    expect(isAllowedPdfResourceUrl('https://aisoulcode.cn/_next/static/a.css')).toBe(true);
    expect(isAllowedPdfResourceUrl('https://aisoulcode.cn/images/logo.png')).toBe(true);
  });

  it('rejects private hosts, remote assets, local files, and API fetches', () => {
    expect(isAllowedPdfResourceUrl('http://127.0.0.1:3005/admin')).toBe(false);
    expect(isAllowedPdfResourceUrl('https://example.com/track')).toBe(false);
    expect(isAllowedPdfResourceUrl('file:///etc/passwd')).toBe(false);
    expect(isAllowedPdfResourceUrl('https://aisoulcode.cn/api/master-report')).toBe(false);
  });

  it('keeps URL render requests on the initial allowed origin', () => {
    expect(isAllowedPdfResourceUrl('https://aisoulcode.cn/master-report', 'https://aisoulcode.cn')).toBe(true);
    expect(isAllowedPdfResourceUrl('https://localhost/private', 'https://aisoulcode.cn')).toBe(false);
    expect(isAllowedPdfResourceUrl('https://bell.aisoulcode.cn/api', 'https://aisoulcode.cn')).toBe(false);
  });
});
