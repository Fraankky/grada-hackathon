import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/api/auth',
  ];

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Allow Google OAuth callback
  if (pathname.startsWith('/callback/google')) {
    return NextResponse.next();
  }

  // Allow access to auth routes without authentication
  if (isPublicRoute) {
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

  // Check if session cookie exists (lightweight check without database)
  // Actual session validation happens in route handlers/layouts
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie) {
    // Redirect to login if no session cookie
    const loginUrl = new URL('/login', request.url);
    // Preserve the original URL as a redirect parameter
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Session cookie exists, allow access
  // Note: Full session validation with Prisma happens in server components/API routes
  return NextResponse.next();
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