import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const exchangeCodeForSession = vi.fn(async () => ({ error: null }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}));

import { GET } from './route';

describe('email confirmation callback behind a reverse proxy', () => {
  it('redirects to a relative public page after exchanging the code', async () => {
    const response = await GET(new NextRequest('http://localhost:3005/auth/callback?code=abc&next=%2Fmy'));
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/my?verified=1');
    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc');
  });

  it('keeps failed confirmations and unsafe next values on this site', async () => {
    const failed = await GET(new NextRequest('http://localhost:3005/auth/callback'));
    expect(failed.headers.get('location')).toBe('/auth/login?error=verification');
    const unsafe = await GET(new NextRequest('http://localhost:3005/auth/callback?code=abc&next=%2F%2Fevil.example'));
    expect(unsafe.headers.get('location')).toBe('/my?verified=1');
  });
});
