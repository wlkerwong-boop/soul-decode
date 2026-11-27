const ALLOWED_HOST = 'aisoulcode.cn';

export function isAllowedPdfUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    return url.hostname === ALLOWED_HOST || url.hostname.endsWith(`.${ALLOWED_HOST}`);
  } catch {
    return false;
  }
}

/** Requests made by the PDF browser must never reach arbitrary network hosts. */
export function isAllowedPdfResourceUrl(value: string, targetOrigin?: string): boolean {
  if (value === 'about:blank' || value.startsWith('data:') || value.startsWith('blob:')) return true;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    if (targetOrigin) return url.origin === targetOrigin;
    if (!['aisoulcode.cn', 'www.aisoulcode.cn'].includes(url.hostname)) return false;
    return /^\/(?:_next\/static\/|images\/|fonts\/|favicon\.)/.test(url.pathname);
  } catch {
    return false;
  }
}
