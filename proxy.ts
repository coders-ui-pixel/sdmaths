import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Define the subdomains we want to handle
  const isLmsSubdomain = hostname.startsWith('lms.')

  if (isLmsSubdomain) {
    // Avoid double-prepending /lms if it's already there
    if (!url.pathname.startsWith('/lms')) {
      url.pathname = `/lms${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

// Configure which paths should trigger the proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|uploads|_next/static|_next/image|favicon.ico).*)',
  ],
}
