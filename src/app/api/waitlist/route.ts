import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getIp } from '@/lib/rate-limit'

/* ─── Resend confirmation email ──────────────────────────────────────────── */
async function sendConfirmationEmail(email: string, name?: string) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return // gracefully skip if not configured

  const firstName = name?.split(' ')[0] ?? 'there'

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: 'View1 Sort <hello@view1sort.com>',
      to: email,
      subject: "You're on the list — View1 Sort",
      html: `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;background:#09090b;color:#f4f4f5;padding:40px 32px;border-radius:12px;">
          <div style="margin-bottom:32px;">
            <span style="display:inline-block;background:#6366f1;border-radius:8px;padding:8px 14px;font-size:17px;font-weight:900;letter-spacing:-0.5px;">View1 Sort</span>
          </div>
          <h1 style="font-size:26px;font-weight:800;margin:0 0 16px;line-height:1.2;">Hey ${firstName}, you&apos;re in.</h1>
          <p style="font-size:15px;line-height:1.7;color:#a1a1aa;margin:0 0 24px;">
            We&apos;ll reach out with early access as soon as your spot is ready. First cohort is intentionally small — every photographer gets a proper onboarding.
          </p>
          <div style="background:#18181b;border:1px solid #27272a;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
            <p style="font-size:11px;font-weight:700;color:#6366f1;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.1em;">What&apos;s coming</p>
            <ul style="margin:0;padding:0 0 0 18px;color:#a1a1aa;font-size:14px;line-height:1.9;">
              <li>AI sorting by story and emotion, not just sharpness scores</li>
              <li>3-stage client delivery with photo selection workflow</li>
              <li>Contracts, invoices, and Stripe payments built in</li>
              <li>Your whole photography business — one place</li>
            </ul>
          </div>
          <p style="font-size:12px;color:#52525b;margin:0;">
            You received this because you joined the View1 Sort waitlist at view1sort.com.
          </p>
        </div>
      `,
    }),
  })
}

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

    const supabase = await createClient()

    const { error } = await supabase.from('waitlist').insert({
      email:             email.toLowerCase().trim(),
      name,
      photographer_type: photographerType,
      source:            'landing',
      utm_source:        utmSource,
      utm_medium:        utmMedium,
      utm_campaign:      utmCampaign,
    })

    if (error) {
      if ((error as { code?: string }).code === '23505') {
        return NextResponse.json({ error: 'Email already on the waitlist' }, { status: 409 })
      }
      console.error('Waitlist insert error:', error)
      throw new Error('Failed to insert')
    }

    // Non-blocking — don't fail the request if email fails
    sendConfirmationEmail(email.toLowerCase().trim(), name).catch((err) =>
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
