import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Log API requests for debugging
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('API Request:', request.nextUrl.pathname, request.method)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/form/:path*'
  ]
}
