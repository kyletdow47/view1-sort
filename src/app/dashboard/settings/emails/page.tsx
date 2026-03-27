'use client'

import { useState } from 'react'
import {
  Mail,
  Send,
  Pencil,
  UserPlus,
  Image,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Palette,
} from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  trigger: string
  status: 'active' | 'draft'
  subject: string
  previewBody: string
  ctaText: string
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome',
    trigger: 'Sent after photographer signup',
    status: 'active',
    subject: 'Welcome to View1 Studio',
    previewBody: 'Thanks for joining View1 Studio. Your account is ready to go. Start by uploading your first project...',
    ctaText: 'Get Started',
  },
  {
    id: 'gallery-invite',
    name: 'Gallery Invitation',
    trigger: 'Sent when gallery is shared with client',
    status: 'active',
    subject: 'Your gallery is ready to view',
    previewBody: 'Hi {client_name}, your photos from {project_name} are ready. Click below to view and select your favorites...',
    ctaText: 'View Gallery',
  },
  {
    id: 'project-published',
    name: 'Project Published',
    trigger: 'Sent when project is published live',
    status: 'active',
    subject: 'Your project is live!',
    previewBody: 'Great news! {project_name} has been published and is now accessible to your clients via the gallery link...',
    ctaText: 'View Project',
  },
  {
    id: 'payment-confirmation',
    name: 'Payment Confirmation',
    trigger: 'Sent after successful client payment',
    status: 'active',
    subject: 'Payment confirmed - {amount}',
    previewBody: 'We have received your payment of {amount} for {project_name}. Your download links are now unlocked...',
    ctaText: 'Download Photos',
  },
  {
    id: 'payment-received',
    name: 'Payment Received',
    trigger: 'Sent to photographer when client pays',
    status: 'draft',
    subject: 'You received a payment!',
    previewBody: '{client_name} has paid {amount} for {project_name}. The funds will be deposited into your connected account...',
    ctaText: 'View Earnings',
  },
  {
    id: 'payment-failed',
    name: 'Payment Failed',
    trigger: 'Sent when client payment fails',
    status: 'draft',
    subject: 'Payment failed - action required',
    previewBody: 'Unfortunately, the payment for {project_name} could not be processed. Please update your payment method...',
    ctaText: 'Update Payment',
  },
]

function EmailIcon({ templateId }: { templateId: string }) {
  const iconClass = 'text-[#ffb780]'
  const size = 16
  switch (templateId) {
    case 'welcome':
      return <UserPlus size={size} className={iconClass} />
    case 'gallery-invite':
      return <Image size={size} className={iconClass} />
    case 'project-published':
      return <Send size={size} className={iconClass} />
    case 'payment-confirmation':
      return <CheckCircle2 size={size} className="text-[#95d1d1]" />
    case 'payment-received':
      return <CreditCard size={size} className="text-[#95d1d1]" />
    case 'payment-failed':
      return <AlertTriangle size={size} className="text-[#e7765f]" />
    default:
      return <Mail size={size} className={iconClass} />
  }
}

function MiniEmailPreview({ template }: { template: EmailTemplate }) {
  return (
    <div className="rounded-xl bg-[#151312] border border-[#534439]/20 p-3 space-y-2.5">
      {/* Mini header with logo */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#ffb780] to-[#d48441]" />
        <div className="h-1.5 w-16 rounded-full bg-[#373433]" />
      </div>
      {/* Subject line */}
      <div className="h-2 w-3/4 rounded-full bg-[#2c2928]" />
      {/* Body preview */}
      <p className="text-[10px] leading-relaxed text-[#a18d80] line-clamp-2">
        {template.previewBody}
      </p>
      {/* CTA button */}
      <div className="pt-1">
        <div className="inline-block rounded-md bg-gradient-to-br from-[#ffb780]/80 to-[#d48441]/80 px-3 py-1">
          <span className="text-[9px] font-bold text-[#4e2600]">{template.ctaText}</span>
        </div>
      </div>
    </div>
  )
}

export default function EmailTemplatesPage() {
  const [fromName, setFromName] = useState('View1 Studio')
  const [replyTo, setReplyTo] = useState('hello@view1.studio')
  const [brandColor, setBrandColor] = useState('#ffb780')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl italic font-extrabold text-[#e7e1df]">
          Email Templates
        </h1>
        <p className="mt-1 text-sm text-[#d9c2b4]">
          Preview and customize your automated emails
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Email cards grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EMAIL_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-5 flex flex-col"
              >
                {/* Top row: name + status */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <EmailIcon templateId={tmpl.id} />
                    <h3 className="font-headline font-bold text-[#e7e1df]">{tmpl.name}</h3>
                  </div>
                  <span
                    className={`font-label text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md font-bold ${
                      tmpl.status === 'active'
                        ? 'bg-[#95d1d1]/15 text-[#95d1d1]'
                        : 'bg-[#373433]/60 text-[#a18d80]'
                    }`}
                  >
                    {tmpl.status}
                  </span>
                </div>

                {/* Trigger */}
                <p className="text-xs text-[#a18d80] mb-3">{tmpl.trigger}</p>

                {/* Mini preview */}
                <MiniEmailPreview template={tmpl} />

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2c2928] px-3 py-2 text-xs font-medium text-[#d9c2b4] ring-1 ring-[#534439]/40 transition-colors hover:ring-[#ffb780]/30 hover:text-[#ffb780]">
                    <Pencil size={12} />
                    Edit Template
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2c2928] px-3 py-2 text-xs font-medium text-[#d9c2b4] ring-1 ring-[#534439]/40 transition-colors hover:ring-[#95d1d1]/30 hover:text-[#95d1d1]">
                    <Send size={12} />
                    Send Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar: Email Settings */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6 sticky top-6 space-y-6">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-[#ffb780]" />
              <h2 className="font-headline font-bold text-lg text-[#e7e1df]">
                Email Settings
              </h2>
            </div>

            {/* From Name */}
            <div className="space-y-1.5">
              <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                From Name
              </span>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full rounded-lg bg-[#151312] px-4 py-2.5 text-sm text-[#e7e1df] outline-none ring-1 ring-[#534439]/40 focus:ring-[#ffb780]/50"
              />
            </div>

            {/* Reply-to Email */}
            <div className="space-y-1.5">
              <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                Reply-to Email
              </span>
              <input
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                className="w-full rounded-lg bg-[#151312] px-4 py-2.5 text-sm text-[#e7e1df] outline-none ring-1 ring-[#534439]/40 focus:ring-[#ffb780]/50"
              />
            </div>

            {/* Brand Color */}
            <div className="space-y-1.5">
              <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                Brand Color
              </span>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1 rounded-lg bg-[#151312] px-4 py-2.5 ring-1 ring-[#534439]/40">
                  <Palette size={14} className="text-[#a18d80]/50" />
                  <span className="text-sm font-mono text-[#e7e1df]">{brandColor}</span>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-1.5">
              <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                Email Logo
              </span>
              <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-[#534439]/40 bg-[#151312] cursor-pointer hover:border-[#ffb780]/30 transition-colors">
                <div className="flex flex-col items-center gap-1.5">
                  <Upload size={20} className="text-[#a18d80]/40" />
                  <span className="text-[11px] text-[#a18d80]">
                    Drop logo or click to upload
                  </span>
                  <span className="text-[10px] text-[#a18d80]/50">PNG, SVG up to 2MB</span>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button className="w-full rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] py-2.5 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
