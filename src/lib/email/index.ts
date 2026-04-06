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
import { ContractSentEmail } from './templates/contract-sent'
import { BookingConfirmationEmail } from './templates/booking-confirmation'
import { EditRequestUpdateEmail } from './templates/edit-request-update'
import { WaitlistConfirmationEmail } from './templates/waitlist-confirmation'
import { WaitlistDay3Email } from './templates/waitlist-day3'
import { WaitlistPrelaunchEmail } from './templates/waitlist-prelaunch'

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

export async function sendContractSentEmail(
  to: string,
  clientName: string,
  photographerName: string,
  contractTitle: string,
  signingUrl: string,
) {
  return sendEmail({
    to,
    subject: `Please sign your contract — ${contractTitle}`,
    template: 'contract_sent',
    react: React.createElement(ContractSentEmail, { clientName, photographerName, contractTitle, signingUrl }),
  })
}

export async function sendBookingConfirmationEmail(
  to: string,
  clientName: string,
  photographerName: string,
  shootType: string,
  shootDate: string,
  location?: string,
  packageDetails?: string,
) {
  return sendEmail({
    to,
    subject: `Booking confirmed — ${shootType} with ${photographerName}`,
    template: 'booking_confirmation',
    react: React.createElement(BookingConfirmationEmail, {
      clientName,
      photographerName,
      shootType,
      shootDate,
      location,
      packageDetails,
    }),
  })
}

export async function sendWaitlistConfirmationEmail(to: string, name?: string) {
  const firstName = name?.split(' ')[0] ?? 'there'
  return sendEmail({
    to,
    subject: "You're on the list — View1 Sort",
    template: 'waitlist_confirmation',
    react: React.createElement(WaitlistConfirmationEmail, { firstName }),
  })
}

export async function sendWaitlistDay3Email(to: string, name?: string) {
  const firstName = name?.split(' ')[0] ?? 'there'
  return sendEmail({
    to,
    subject: '184 commits. 11 days. Here\'s everything I built.',
    template: 'waitlist_day3',
    react: React.createElement(WaitlistDay3Email, { firstName }),
  })
}

export async function sendWaitlistPrelaunchEmail(to: string, name?: string) {
  const firstName = name?.split(' ')[0] ?? 'there'
  return sendEmail({
    to,
    subject: 'Launching in 3 days. You\'re first.',
    template: 'waitlist_prelaunch',
    react: React.createElement(WaitlistPrelaunchEmail, { firstName }),
  })
}

export async function sendEditRequestUpdateEmail(
  to: string,
  clientName: string,
  photoTitle: string,
  newStatus: 'priced' | 'in_progress' | 'delivered',
  price?: number,
  approvalUrl?: string,
  deliveryUrl?: string,
) {
  const statusLabels = {
    priced: 'Priced — awaiting approval',
    in_progress: 'In Progress',
    delivered: 'Delivered',
  }
  return sendEmail({
    to,
    subject: `Edit request update — ${statusLabels[newStatus]} for "${photoTitle}"`,
    template: 'edit_request_update',
    react: React.createElement(EditRequestUpdateEmail, {
      clientName,
      photoTitle,
      newStatus,
      price,
      approvalUrl,
      deliveryUrl,
    }),
  })
}
