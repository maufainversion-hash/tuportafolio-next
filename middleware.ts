import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// TODO: Add Supabase session check when auth is configured
export function middleware(request: NextRequest) {
  // Protected routes - will redirect to login when Supabase is configured
  const protectedPaths = ['/dashboard', '/portfolio', '/onboarding']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  // For now, allow all routes (Supabase auth TODO)
  return NextResponse.next()
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
