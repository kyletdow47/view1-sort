import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getIp } from '@/lib/rate-limit'
import { sendWaitlistConfirmationEmail } from '@/lib/email'

/* ─── POST /api/waitlist ─────────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  const rl = rateLimit(`waitlist:${getIp(request.headers)}`, { limit: 3, windowSec: 60 })
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    })
  }

  try {
    const body = await request.json() as {
      email?: unknown
      name?: unknown
      photographer_type?: unknown
    }

    const email = body.email
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const name              = typeof body.name === 'string' ? body.name.trim() : undefined
    const photographerType  = typeof body.photographer_type === 'string' ? body.photographer_type : undefined
    const utmSource         = request.nextUrl.searchParams.get('utm_source')   ?? undefined
    const utmMedium         = request.nextUrl.searchParams.get('utm_medium')   ?? undefined
    const utmCampaign       = request.nextUrl.searchParams.get('utm_campaign') ?? undefined
    const utmContent        = request.nextUrl.searchParams.get('utm_content')  ?? undefined

    const supabase = await createClient()

    const { error } = await supabase.from('waitlist').insert({
      email:             email.toLowerCase().trim(),
      name,
      photographer_type: photographerType,
      source:            'landing',
      utm_source:        utmSource,
      utm_medium:        utmMedium,
      utm_campaign:      utmCampaign,
      utm_content:       utmContent,
    })

    if (error) {
      if ((error as { code?: string }).code === '23505') {
        return NextResponse.json({ error: 'Email already on the waitlist' }, { status: 409 })
      }
      console.error('Waitlist insert error FULL:', JSON.stringify(error))
      throw new Error('Failed to insert')
    }

    // Non-blocking — don't fail the request if email fails
    sendWaitlistConfirmationEmail(email.toLowerCase().trim(), name).catch((err) =>
      console.error('Confirmation email error:', err)
    )

    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ success: true, count: count ?? 0 })
  } catch (error) {
    console.error('Waitlist signup failed:', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}

/* ─── GET /api/waitlist — public counter ─────────────────────────────────── */
export async function GET() {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
