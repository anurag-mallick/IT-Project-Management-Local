import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const rateLimit = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 100;
const WINDOW = 60 * 1000;

export async function proxy(request: NextRequest) {
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    
    const current = rateLimit.get(ip) || { count: 0, lastReset: now };
    if (now - current.lastReset > WINDOW) {
      current.count = 0;
      current.lastReset = now;
    }
    
    current.count++;
    rateLimit.set(ip, current);
    
    if (current.count > LIMIT) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
