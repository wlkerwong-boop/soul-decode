import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get('code');
  const requestedNext = url.searchParams.get('next') || '/my';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/my';
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.redirect(new URL('/auth/login?error=config', request.url));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(`${next}${next.includes('?') ? '&' : '?'}verified=1`, request.url));
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=verification', request.url));
}
