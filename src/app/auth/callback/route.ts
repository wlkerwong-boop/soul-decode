import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function redirectWithinSite(path: string) {
  // Relative Location keeps the public host even when Next runs behind a proxy
  // whose request.url is http://localhost:3005/...
  return new Response(null, { status: 303, headers: { Location: path } });
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get('code');
  const requestedNext = url.searchParams.get('next') || '/my';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') &&
    !requestedNext.includes('\\') && !/[\r\n]/.test(requestedNext)
    ? requestedNext
    : '/my';
  const supabase = await createClient();

  if (!supabase) {
    return redirectWithinSite('/auth/login?error=config');
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectWithinSite(`${next}${next.includes('?') ? '&' : '?'}verified=1`);
    }
  }

  return redirectWithinSite('/auth/login?error=verification');
}
