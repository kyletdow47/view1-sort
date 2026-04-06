import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DEMO_BYPASS_KEY = 'view1-preview-2026'

export async function middleware(request: NextRequest) {
  // Pass through immediately if Supabase env vars are not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  const { pathname, searchParams } = request.nextUrl
  let response = NextResponse.next({ request })

  // Demo bypass — allows browsing all pages without auth/onboarding.
  // Activate with ?demo=view1-preview-2026 (keyed) or ?demo=true (QA shortcut)
  const demoParam = searchParams.get('demo')
  if (demoParam === DEMO_BYPASS_KEY || demoParam === 'true') {
    response.cookies.set('demo_mode', 'true', { path: '/', maxAge: 60 * 60 * 24 })
    return response
  }
  if (request.cookies.get('demo_mode')?.value === 'true') {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isDashboard = pathname.startsWith('/dashboard')
  const isOnboarding = pathname.startsWith('/onboarding')
  const isAuth = pathname.startsWith('/auth')
  // Client portal routes (photographer-facing auth uses /dashboard, clients use /client)
  const isClientPortal = pathname.startsWith('/client')
  // Client-specific auth pages — should NOT redirect authenticated photographers to /dashboard
  const isClientAuthPage =
    pathname === '/auth/client-login' ||
    pathname.startsWith('/auth/client-callback')

  // ── Protect client portal (/client) ──────────────────────────────────────
  // Requires any valid Supabase session (photographer or client).
  // Redirects to /auth/client-login with ?next= for return after auth.
  if (isClientPortal && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/client-login'
    loginUrl.searchParams.set('next', pathname + (request.nextUrl.search ?? ''))
    return NextResponse.redirect(loginUrl)
  }

  // ── Protect photographer dashboard ───────────────────────────────────────
  if ((isDashboard || isOnboarding) && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    return NextResponse.redirect(loginUrl)
  }

  // ── Redirect authenticated photographers away from photographer auth pages ─
  // Skip this redirect for client-specific auth pages (/auth/client-login,
  // /auth/client-callback) so clients can still use them after auth.
  if (isAuth && !isClientAuthPage && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // ── Check onboarding for authenticated dashboard users ───────────────────
  if (isDashboard && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()

    if (profile && !profile.onboarded) {
      const onboardingUrl = request.nextUrl.clone()
      onboardingUrl.pathname = '/onboarding'
      return NextResponse.redirect(onboardingUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
