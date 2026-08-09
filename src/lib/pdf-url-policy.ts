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
