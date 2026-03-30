const BRAND_COLOR = '#ffb780'
const BG_COLOR = '#151312'
const SURFACE_COLOR = '#1d1b1a'
const TEXT_COLOR = '#e7e1df'
const MUTED_COLOR = '#a18d80'

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:Inter,Helvetica,Arial,sans-serif;color:${TEXT_COLOR};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_COLOR};padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:${SURFACE_COLOR};border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #534439;">
          <span style="font-size:24px;font-weight:800;color:${BRAND_COLOR};letter-spacing:-0.5px;">View1 Sort</span>
          <span style="font-size:10px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:2px;margin-left:8px;">Editorial Studio</span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:40px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #534439;text-align:center;">
          <span style="font-size:11px;color:${MUTED_COLOR};">View1 Sort — AI Photo Sorting for Professional Photographers</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function button(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${BRAND_COLOR},#d48441);color:#4e2600;font-weight:700;font-size:14px;text-decoration:none;border-radius:12px;margin:16px 0;">${text}</a>`
}

export function welcomeEmail(name: string, dashboardUrl: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to View1 Sort',
    html: layout(`
      <h1 style="font-size:28px;font-weight:800;color:${TEXT_COLOR};margin:0 0 16px;">Welcome, ${name}!</h1>
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.6;margin:0 0 24px;">
        Your editorial studio is ready. Upload your first shoot, let AI sort it, and deliver a stunning gallery to your clients.
      </p>
      ${button('Open Your Dashboard', dashboardUrl)}
      <p style="color:${MUTED_COLOR};font-size:13px;margin-top:24px;">
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
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.6;margin:0 0 8px;">
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
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.6;margin:0 0 24px;">
        Your payment of <strong style="color:${BRAND_COLOR};">${amount} ${currency.toUpperCase()}</strong> for <strong style="color:${TEXT_COLOR};">${projectName}</strong> has been received.
      </p>
      ${button('Download Your Photos', downloadUrl)}
      <table style="width:100%;margin-top:24px;border-top:1px solid #534439;padding-top:16px;">
        <tr>
          <td style="color:${MUTED_COLOR};font-size:13px;padding:4px 0;">Project</td>
          <td style="color:${TEXT_COLOR};font-size:13px;text-align:right;">${projectName}</td>
        </tr>
        <tr>
          <td style="color:${MUTED_COLOR};font-size:13px;padding:4px 0;">Amount</td>
          <td style="color:${BRAND_COLOR};font-size:13px;font-weight:700;text-align:right;">${amount} ${currency.toUpperCase()}</td>
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
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.6;margin:0 0 24px;">
        <strong style="color:${BRAND_COLOR};">${amount}</strong> received from <strong style="color:${TEXT_COLOR};">${clientEmail}</strong> for "${projectName}".
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
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.6;margin:0 0 24px;">
        Your payment of <strong style="color:#e7765f;">${amount}</strong> for "${projectName}" could not be processed.
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
      <p style="color:${MUTED_COLOR};font-size:15px;line-height:1.6;margin:0 0 24px;">
        "${projectName}" with ${photoCount} photos is live and ready to share with clients.
      </p>
      ${button('View Gallery', galleryUrl)}
    `),
  }
}
