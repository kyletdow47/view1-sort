// =============================================================================
// POST /api/invitations — Send a gallery invitation to a client
//
// Creates a gallery_access record (UUID token) and sends an invitation email
// via Resend. The email includes a View1-branded "View your gallery" button
// that links to /auth/client-callback?token=[uuid]&gallery=[galleryId].
//
// Request body:
//   {
//     projectId: string       — the project UUID
//     galleryId: string       — the gallery UUID (used for the direct link)
//     clientEmail: string     — client's email address
//     clientName?: string     — optional display name for the greeting
//     galleryTitle: string    — shown in the email subject/body
//     photographerName: string — shown in the email header
//     photographerLogoUrl?: string — photographer branding
//     accessLevel: 'preview' | 'full'
//     message?: string        — optional personal note from photographer
//   }
//
// Response:
//   200: { success: true, token: string }
//   400: { error: string }
//   500: { error: string }
//
// TODO(resend): RESEND_API_KEY must be configured in environment variables.
//   The email is stubbed with a console.log until then. See sendInvitationEmail().
// TODO(project-clients): When project_clients migration runs, also upsert there.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createGalleryAccessRecord,
  buildInvitationCallbackUrl,
  INVITE_TOKEN_TTL_HOURS,
} from '@/lib/client-auth'
import type { GalleryAccessType } from '@/types/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InvitationRequestBody {
  projectId: string
  galleryId: string
  clientEmail: string
  clientName?: string
  galleryTitle: string
  photographerName: string
  photographerLogoUrl?: string
  accessLevel: GalleryAccessType
  message?: string
}

interface InvitationSuccessResponse {
  success: true
  token: string
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth check: only authenticated photographers can send invitations ────
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse request body ───────────────────────────────────────────────────
  let body: InvitationRequestBody
  try {
    body = (await request.json()) as InvitationRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    projectId,
    galleryId,
    clientEmail,
    clientName,
    galleryTitle,
    photographerName,
    photographerLogoUrl,
    accessLevel,
    message,
  } = body

  // ── Validate required fields ─────────────────────────────────────────────
  if (!projectId || !galleryId || !clientEmail || !galleryTitle || !photographerName || !accessLevel) {
    return NextResponse.json(
      { error: 'Missing required fields: projectId, galleryId, clientEmail, galleryTitle, photographerName, accessLevel' },
      { status: 400 }
    )
  }

  if (!['preview', 'full'].includes(accessLevel)) {
    return NextResponse.json(
      { error: 'accessLevel must be "preview" or "full"' },
      { status: 400 }
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(clientEmail)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // ── Create gallery_access record ─────────────────────────────────────────
  let token: string
  try {
    token = await createGalleryAccessRecord({
      projectId,
      clientEmail,
      accessLevel,
      expiresInHours: INVITE_TOKEN_TTL_HOURS,
    })
  } catch (err) {
    console.error('[invitations] Failed to create access record:', err)
    return NextResponse.json({ error: 'Failed to create access record' }, { status: 500 })
  }

  // ── Build invitation URL ─────────────────────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin
  const callbackUrl = buildInvitationCallbackUrl({
    baseUrl,
    projectId,
    clientEmail,
    token,
  })
  // Add galleryId and email to callback URL for the route handler
  const finalCallbackUrl = new URL(callbackUrl)
  finalCallbackUrl.searchParams.set('gallery', galleryId)

  // ── Send invitation email ────────────────────────────────────────────────
  try {
    await sendInvitationEmail({
      to: clientEmail,
      clientName,
      galleryTitle,
      photographerName,
      photographerLogoUrl,
      accessLevel,
      message,
      ctaUrl: finalCallbackUrl.toString(),
      expiresInHours: INVITE_TOKEN_TTL_HOURS,
    })
  } catch (err) {
    // Log but don't fail — the access record was created; email can be retried
    console.error('[invitations] Failed to send email:', err)
    // TODO(retry): Add email retry queue or return partial success
  }

  const response: InvitationSuccessResponse = { success: true, token }
  return NextResponse.json(response, { status: 200 })
}

// ---------------------------------------------------------------------------
// Email sending
// ---------------------------------------------------------------------------

interface SendInvitationEmailParams {
  to: string
  clientName?: string
  galleryTitle: string
  photographerName: string
  photographerLogoUrl?: string
  accessLevel: GalleryAccessType
  message?: string
  ctaUrl: string
  expiresInHours: number
}

async function sendInvitationEmail(params: SendInvitationEmailParams): Promise<void> {
  const {
    to,
    clientName,
    galleryTitle,
    photographerName,
    accessLevel,
    message,
    ctaUrl,
    expiresInHours,
  } = params

  const greeting = clientName ? `Hi ${clientName},` : 'Hi there,'
  const accessDescription =
    accessLevel === 'full'
      ? 'You can view and download your photos.'
      : 'You can view a preview of your photos.'

  // ── TODO(resend): Replace this stub with real email sending ──────────────
  // Real implementation:
  //   import { sendEmail } from '@/lib/email/send'
  //   await sendEmail({
  //     to,
  //     subject: `Your gallery is ready — ${galleryTitle}`,
  //     template: 'gallery-invitation',
  //     html: buildInvitationHtml({ ... }),
  //   })
  //
  // For now, log to console so development works without RESEND_API_KEY.
  // ────────────────────────────────────────────────────────────────────────

  if (process.env.RESEND_API_KEY) {
    // Dynamic import to avoid crashing when Resend is not configured
    try {
      const { sendEmail } = await import('@/lib/email/send')
      await sendEmail({
        to,
        subject: `Your gallery is ready — ${galleryTitle}`,
        template: 'gallery-invitation',
        html: buildInvitationHtml({
          greeting,
          galleryTitle,
          photographerName,
          accessDescription,
          message,
          ctaUrl,
          expiresInHours,
        }),
      })
    } catch (err) {
      throw new Error(`Resend error: ${err instanceof Error ? err.message : String(err)}`)
    }
  } else {
    // Stub mode: log to console
    console.log('[invitations] STUB — Would send invitation email:')
    console.log(`  To: ${to}`)
    console.log(`  Subject: Your gallery is ready — ${galleryTitle}`)
    console.log(`  From: ${photographerName}`)
    console.log(`  Message: ${message ?? '(no personal message)'}`)
    console.log(`  CTA URL: ${ctaUrl}`)
    console.log(`  Access: ${accessLevel} (${accessDescription})`)
    console.log(`  Expires: ${expiresInHours}h`)
  }
}

// ---------------------------------------------------------------------------
// HTML email template
// ---------------------------------------------------------------------------

interface BuildInvitationHtmlParams {
  greeting: string
  galleryTitle: string
  photographerName: string
  accessDescription: string
  message: string | undefined
  ctaUrl: string
  expiresInHours: number
}

function buildInvitationHtml(params: BuildInvitationHtmlParams): string {
  const {
    greeting,
    galleryTitle,
    photographerName,
    accessDescription,
    message,
    ctaUrl,
    expiresInHours,
  } = params

  const expiresText =
    expiresInHours >= 72
      ? `${Math.floor(expiresInHours / 24)} days`
      : `${expiresInHours} hours`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your gallery is ready</title>
</head>
<body style="margin:0;padding:0;background-color:#0D0B1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0D0B1A;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:540px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-flex;align-items:center;gap:8px;">
                <div style="width:36px;height:36px;background:#5749F4;border-radius:10px;display:flex;align-items:center;justify-content:center;">
                  <span style="color:white;font-size:18px;">📷</span>
                </div>
                <span style="font-size:18px;font-weight:700;color:#ffffff;">View1</span>
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(180deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.03) 100%);border:1px solid rgba(255,255,255,0.10);border-radius:20px;padding:36px 32px;">

              <p style="margin:0 0 8px;font-size:15px;color:rgba(255,255,255,0.60);">${greeting}</p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">
                Your gallery is ready ✨
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.70);line-height:1.6;">
                <strong style="color:#ffffff;">${photographerName}</strong> has shared a gallery with you:<br />
                <span style="color:#5749F4;font-weight:600;">${galleryTitle}</span>
              </p>

              ${
                message
                  ? `<div style="background:rgba(87,73,244,0.12);border-left:3px solid #5749F4;border-radius:4px;padding:14px 16px;margin-bottom:24px;">
                       <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.80);line-height:1.6;font-style:italic;">"${message}"</p>
                       <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.40);">— ${photographerName}</p>
                     </div>`
                  : ''
              }

              <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.50);">${accessDescription}</p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:14px;background:linear-gradient(135deg,#5749F4 0%,#8B5CF6 100%);">
                    <a href="${ctaUrl}" target="_blank" style="display:block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:14px;">
                      View your gallery →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);text-align:center;">
                This link expires in ${expiresText}. If it expires, visit your gallery and enter your email to get a new link.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.20);">
                Delivered securely by <a href="https://view1.co" style="color:rgba(255,255,255,0.30);">View1</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
