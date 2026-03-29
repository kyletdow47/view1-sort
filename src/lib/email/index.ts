/**
 * Email sending convenience functions.
 * Each function renders a react-email template and sends via Resend.
 */

import React from 'react'
import { sendEmail } from './send'
import { WelcomeEmail } from './templates/welcome'
import { GalleryInvitationEmail } from './templates/gallery-invitation'
import { ProjectPublishedEmail } from './templates/project-published'
import { PaymentConfirmationEmail } from './templates/payment-confirmation'
import { PaymentReceivedEmail } from './templates/payment-received'
import { PaymentFailedEmail } from './templates/payment-failed'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://view1.studio'

export async function sendWelcomeEmail(to: string, displayName: string, userId?: string) {
  return sendEmail({
    to,
    subject: 'Welcome to View1 Sort',
    template: 'welcome',
    react: React.createElement(WelcomeEmail, { displayName, appUrl: APP_URL }),
    userId,
  })
}

export async function sendGalleryInvitationEmail(
  to: string,
  photographerName: string,
  projectName: string,
  galleryUrl: string,
) {
  return sendEmail({
    to,
    subject: `${photographerName} shared a gallery with you`,
    template: 'gallery_invitation',
    react: React.createElement(GalleryInvitationEmail, { photographerName, projectName, galleryUrl }),
  })
}

export async function sendProjectPublishedEmail(
  to: string,
  photographerName: string,
  projectName: string,
  photoCount: number,
  galleryUrl: string,
) {
  return sendEmail({
    to,
    subject: `Your photos from ${photographerName} are ready`,
    template: 'project_published',
    react: React.createElement(ProjectPublishedEmail, { photographerName, projectName, photoCount, galleryUrl }),
  })
}

export async function sendPaymentConfirmationEmail(
  to: string,
  clientName: string,
  projectName: string,
  amount: string,
  galleryUrl: string,
) {
  return sendEmail({
    to,
    subject: `Payment confirmed — ${amount} for ${projectName}`,
    template: 'payment_confirmation',
    react: React.createElement(PaymentConfirmationEmail, { clientName, projectName, amount, galleryUrl }),
  })
}

export async function sendPaymentReceivedEmail(
  to: string,
  photographerName: string,
  clientEmail: string,
  projectName: string,
  amount: string,
) {
  return sendEmail({
    to,
    subject: `You received ${amount} for ${projectName}`,
    template: 'payment_received',
    react: React.createElement(PaymentReceivedEmail, {
      photographerName,
      clientEmail,
      projectName,
      amount,
      dashboardUrl: `${APP_URL}/dashboard`,
    }),
  })
}

export async function sendPaymentFailedEmail(
  to: string,
  clientName: string,
  projectName: string,
  amount: string,
  retryUrl: string,
) {
  return sendEmail({
    to,
    subject: `Payment failed — ${amount} for ${projectName}`,
    template: 'payment_failed',
    react: React.createElement(PaymentFailedEmail, { clientName, projectName, amount, retryUrl }),
  })
}
