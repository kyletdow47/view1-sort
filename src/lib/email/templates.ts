/* ── Brand tokens — Zinc palette, Indigo accent ── */
const PRIMARY = '#4f46e5'
const PRIMARY_LIGHT = '#818cf8'
const BG_COLOR = '#0d0e14'
const SURFACE_COLOR = '#13141c'
const TEXT_COLOR = '#E0E7FF'
const MUTED_COLOR = 'rgba(224,231,255,0.45)'
const SUBTLE_COLOR = 'rgba(224,231,255,0.2)'
const BORDER_COLOR = 'rgba(255,255,255,0.06)'

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;color:${TEXT_COLOR};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_COLOR};padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:${BG_COLOR};">
        <!-- Header -->
        <tr><td style="padding:28px 32px 24px;border-bottom:1px solid ${BORDER_COLOR};">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,${PRIMARY},#6366f1);text-align:center;vertical-align:middle;">
              <span style="color:#fff;font-size:11px;font-weight:800;line-height:32px;">V1</span>
            </td>
            <td style="padding-left:10px;">
              <span style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">View1 Sort</span>
            </td>
          </tr></table>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:40px 32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid ${BORDER_COLOR};text-align:center;">
          <span style="font-size:11px;color:${SUBTLE_COLOR};">View1 Sort — AI Photo Sorting for Professional Photographers</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function button(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,${PRIMARY},#6366f1);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:12px;margin:16px 0;">${text}</a>`
}

export function welcomeEmail(name: string, dashboardUrl: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to View1 Sort',
    html: layout(`
      <h1 style="font-size:28px;font-weight:800;color:#ffffff;margin:0 0 16px;">Welcome, ${name}!</h1>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.7;margin:0 0 24px;">
        Your editorial studio is ready. Upload your first shoot, let AI sort it, and deliver a stunning gallery to your clients.
      </p>
      ${button('Open Your Dashboard', dashboardUrl)}
      <p style="color:${SUBTLE_COLOR};font-size:13px;margin-top:24px;">
        Need help? Reply to this email or check our getting started guide.
      </p>
    `),
  }
}

export function galleryInvitationEmail(
  projectName: string,
  photographerName: string,
  galleryUrl: string,
  photoCount: number
): { subject: string; html: string } {
  return {
    subject: `${photographerName} shared "${projectName}" with you`,
    html: layout(`
      <h1 style="font-size:28px;font-weight:800;color:${TEXT_COLOR};margin:0 0 16px;">${projectName}</h1>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.7;margin:0 0 8px;">
        <strong style="color:${TEXT_COLOR};">${photographerName}</strong> has shared a gallery with you.
      </p>
      <p style="color:${MUTED_COLOR};font-size:14px;margin:0 0 24px;">
        ${photoCount} photos ready for your review.
      </p>
      ${button('View Gallery', galleryUrl)}
      <p style="color:${MUTED_COLOR};font-size:12px;margin-top:24px;">
        This link is private and unique to you. Do not share it.
      </p>
    `),
  }
}

export function paymentConfirmationEmail(
  projectName: string,
  amount: string,
  currency: string,
  downloadUrl: string
): { subject: string; html: string } {
  return {
    subject: `Payment confirmed — ${projectName}`,
    html: layout(`
      <h1 style="font-size:28px;font-weight:800;color:${TEXT_COLOR};margin:0 0 16px;">Payment Confirmed</h1>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.7;margin:0 0 24px;">
        Your payment of <strong style="color:${PRIMARY_LIGHT};">${amount} ${currency.toUpperCase()}</strong> for <strong style="color:${TEXT_COLOR};">${projectName}</strong> has been received.
      </p>
      ${button('Download Your Photos', downloadUrl)}
      <table style="width:100%;margin-top:24px;border-top:1px solid ${BORDER_COLOR};padding-top:16px;">
        <tr>
          <td style="color:${MUTED_COLOR};font-size:13px;padding:4px 0;">Project</td>
          <td style="color:${TEXT_COLOR};font-size:13px;text-align:right;">${projectName}</td>
        </tr>
        <tr>
          <td style="color:${MUTED_COLOR};font-size:13px;padding:4px 0;">Amount</td>
          <td style="color:${PRIMARY_LIGHT};font-size:13px;font-weight:700;text-align:right;">${amount} ${currency.toUpperCase()}</td>
        </tr>
      </table>
    `),
  }
}

export function paymentReceivedEmail(
  photographerName: string,
  clientEmail: string,
  projectName: string,
  amount: string,
  billingUrl: string
): { subject: string; html: string } {
  return {
    subject: `Payment received — ${amount} for ${projectName}`,
    html: layout(`
      <h1 style="font-size:28px;font-weight:800;color:${TEXT_COLOR};margin:0 0 16px;">You got paid!</h1>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.7;margin:0 0 24px;">
        <strong style="color:${PRIMARY_LIGHT};">${amount}</strong> received from <strong style="color:${TEXT_COLOR};">${clientEmail}</strong> for "${projectName}".
      </p>
      ${button('View in Billing', billingUrl)}
    `),
  }
}

export function paymentFailedEmail(
  projectName: string,
  amount: string,
  retryUrl: string
): { subject: string; html: string } {
  return {
    subject: `Payment failed — ${projectName}`,
    html: layout(`
      <h1 style="font-size:28px;font-weight:800;color:${TEXT_COLOR};margin:0 0 16px;">Payment Failed</h1>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.7;margin:0 0 24px;">
        Your payment of <strong style="color:#f87171;">${amount}</strong> for "${projectName}" could not be processed.
      </p>
      ${button('Retry Payment', retryUrl)}
      <p style="color:${MUTED_COLOR};font-size:12px;margin-top:16px;">
        If you continue to have issues, please contact the photographer directly.
      </p>
    `),
  }
}

export function projectPublishedEmail(
  photographerName: string,
  projectName: string,
  galleryUrl: string,
  photoCount: number
): { subject: string; html: string } {
  return {
    subject: `"${projectName}" is now published`,
    html: layout(`
      <h1 style="font-size:28px;font-weight:800;color:${TEXT_COLOR};margin:0 0 16px;">Gallery Published</h1>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.7;margin:0 0 24px;">
        "${projectName}" with ${photoCount} photos is live and ready to share with clients.
      </p>
      ${button('View Gallery', galleryUrl)}
    `),
  }
}

export function contractSentEmail(
  clientName: string,
  photographerName: string,
  contractTitle: string,
  signingUrl: string
): { subject: string; html: string } {
  return {
    subject: `Please sign your contract — ${contractTitle}`,
    html: layout(`
      <h1 style="font-size:28px;font-weight:800;color:${TEXT_COLOR};margin:0 0 16px;">Contract Ready to Sign</h1>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.6;margin:0 0 8px;">
        Hi ${clientName},
      </p>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.6;margin:0 0 24px;">
        <strong style="color:${TEXT_COLOR};">${photographerName}</strong> has sent you a contract to review and sign:
        <strong style="color:${PRIMARY_LIGHT};">${contractTitle}</strong>
      </p>
      ${button('Review & Sign Contract', signingUrl)}
      <p style="color:${MUTED_COLOR};font-size:12px;margin-top:24px;">
        This link is unique to you. The contract will be locked once all parties have signed.
      </p>
    `),
  }
}

export function bookingConfirmationEmail(
  clientName: string,
  photographerName: string,
  shootType: string,
  shootDate: string,
  location: string | undefined,
  packageDetails: string | undefined,
  dashboardUrl: string
): { subject: string; html: string } {
  return {
    subject: `Booking confirmed — ${shootType} with ${photographerName}`,
    html: layout(`
      <h1 style="font-size:28px;font-weight:800;color:${TEXT_COLOR};margin:0 0 16px;">Booking Confirmed!</h1>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.6;margin:0 0 24px;">
        Hi ${clientName}, your booking with <strong style="color:${TEXT_COLOR};">${photographerName}</strong> is confirmed.
      </p>
      <table style="width:100%;margin-bottom:24px;border:1px solid ${BORDER_COLOR};border-radius:12px;overflow:hidden;">
        <tr style="background:${SURFACE_COLOR};">
          <td style="color:${MUTED_COLOR};font-size:13px;padding:12px 16px;">Shoot Type</td>
          <td style="color:${TEXT_COLOR};font-size:13px;font-weight:600;padding:12px 16px;text-align:right;">${shootType}</td>
        </tr>
        <tr>
          <td style="color:${MUTED_COLOR};font-size:13px;padding:12px 16px;border-top:1px solid ${BORDER_COLOR};">Date</td>
          <td style="color:${PRIMARY_LIGHT};font-size:13px;font-weight:700;padding:12px 16px;border-top:1px solid ${BORDER_COLOR};text-align:right;">${shootDate}</td>
        </tr>
        ${location ? `<tr style="background:${SURFACE_COLOR};"><td style="color:${MUTED_COLOR};font-size:13px;padding:12px 16px;border-top:1px solid ${BORDER_COLOR};">Location</td><td style="color:${TEXT_COLOR};font-size:13px;padding:12px 16px;border-top:1px solid ${BORDER_COLOR};text-align:right;">${location}</td></tr>` : ''}
        ${packageDetails ? `<tr><td style="color:${MUTED_COLOR};font-size:13px;padding:12px 16px;border-top:1px solid ${BORDER_COLOR};">Package</td><td style="color:${TEXT_COLOR};font-size:13px;padding:12px 16px;border-top:1px solid ${BORDER_COLOR};text-align:right;">${packageDetails}</td></tr>` : ''}
      </table>
      <p style="color:${MUTED_COLOR};font-size:13px;line-height:1.6;margin:0 0 24px;">
        You will receive your gallery link via email after the shoot is processed. Questions? Reply to this email.
      </p>
    `),
  }
}

export function editRequestUpdateEmail(
  clientName: string,
  photoTitle: string,
  newStatus: 'priced' | 'in_progress' | 'delivered',
  price: number | null,
  approvalUrl: string | null,
  deliveryUrl: string | null
): { subject: string; html: string } {
  const statusLabels: Record<typeof newStatus, string> = {
    priced: 'Priced — Awaiting Your Approval',
    in_progress: 'In Progress',
    delivered: 'Delivered',
  }
  const statusColors: Record<typeof newStatus, string> = {
    priced: '#FBBF24',
    in_progress: '#A78BFA',
    delivered: '#34D399',
  }
  const label = statusLabels[newStatus]
  const color = statusColors[newStatus]

  const ctaHtml = newStatus === 'priced' && approvalUrl && price !== null
    ? `<p style="color:${MUTED_COLOR};font-size:14px;margin:0 0 16px;">Price: <strong style="color:${PRIMARY_LIGHT};">$${price}</strong></p>${button('Approve Edit Request', approvalUrl)}`
    : newStatus === 'delivered' && deliveryUrl
    ? button('View Delivered Edit', deliveryUrl)
    : ''

  return {
    subject: `Edit request update — ${photoTitle}`,
    html: layout(`
      <h1 style="font-size:28px;font-weight:800;color:${TEXT_COLOR};margin:0 0 16px;">Edit Request Update</h1>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${clientName}, your edit request for <strong style="color:${TEXT_COLOR};">${photoTitle}</strong> has been updated.
      </p>
      <div style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid ${BORDER_COLOR};border-radius:10px;padding:10px 18px;margin-bottom:24px;">
        <span style="color:${color};font-size:13px;font-weight:700;">${label}</span>
      </div>
      ${ctaHtml}
      <p style="color:${MUTED_COLOR};font-size:12px;margin-top:24px;">
        If you have questions, reply to this email to reach your photographer.
      </p>
    `),
  }
}
