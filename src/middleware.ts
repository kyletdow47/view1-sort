import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth disabled for skeleton prototype — pass everything through
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
