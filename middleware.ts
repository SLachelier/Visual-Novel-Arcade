import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Simple middleware that just passes through for now
  // Auth will be handled at the page level instead of middleware level
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add any custom headers if needed
  response.headers.set('x-middleware', 'active');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any requests containing a '.'
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};