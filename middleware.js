import { NextResponse } from 'next/server';
import { getCurrentSession } from './src/services/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow access to auth routes without authentication
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Allow access to static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Check if user is authenticated
    const session = await getCurrentSession();

    if (!session) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, allow access
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // On error, redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};