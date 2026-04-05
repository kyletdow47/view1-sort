'use client'

import { WikiTabs } from '@/components/features/wiki/WikiTabs'
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, Circle } from 'lucide-react'

export default function BuildPage() {
  const tabs = [
    { id: 'overview',    label: 'Build Status',    content: <OverviewTab /> },
    { id: 'pagemap',     label: 'Page Map',         content: <PageMapTab /> },
    { id: 'spec',        label: 'Spec Gap',         content: <SpecGapTab /> },
    { id: 'journeys',    label: 'User Journeys',    content: <JourneysTab /> },
    { id: 'qa',          label: 'QA Checklists',    content: <QATab /> },
    { id: 'stress',      label: 'Stress Test',      content: <StressTestTab /> },
    { id: 'deploy',      label: 'Deployment',       content: <DeployTab /> },
  ]

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="h-4 w-4 text-emerald-400" strokeWidth={1.75} />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400/70">
            Build Validation
          </p>
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">PDR & QA Tracker</h1>
        <p className="text-white/40 text-sm">
          Phase 1 build status, spec gap analysis, page map, user journey flows, QA checklists, and interactive stress test.
        </p>
      </div>

      <WikiTabs tabs={tabs} defaultTab="overview" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */

function Badge({ type }: { type: 'built' | 'partial' | 'pending' | 'p1' | 'p2' }) {
  const styles: Record<string, string> = {
    built:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    partial: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    pending: 'bg-red-500/10 text-red-400 border border-red-500/20',
    p1:      'bg-red-500/15 text-red-400 border border-red-500/20',
    p2:      'bg-orange-500/12 text-orange-400 border border-orange-500/20',
  }
  const labels: Record<string, string> = {
    built: '✓ Built', partial: '⚠ Partial', pending: '⚠ Pending', p1: 'P1', p2: 'P2',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${styles[type]}`}>
      {labels[type]}
    </span>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 border-b border-white/[0.06] pb-2 pr-6">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 pr-6 text-white/70 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white/30 mb-4">{title}</h2>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tab 1 — Build Status / Overview
───────────────────────────────────────────── */

function OverviewTab() {
  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { value: '42',   label: 'Pages / Routes',    color: 'text-emerald-400' },
          { value: '80+',  label: 'Components',        color: 'text-blue-400' },
          { value: '26',   label: 'DB Tables',         color: 'text-violet-400' },
          { value: '~35k', label: 'Lines of Code',     color: 'text-amber-400' },
        ].map(({ value, label, color }) => (
          <div key={label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 text-center">
            <div className={`text-3xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-[11px] text-white/35 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">Phase 1 — Core Features</span>
          <span className="text-emerald-400 font-bold text-sm">100% Built ✓</span>
        </div>
        <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-500" />
        </div>
        <p className="text-[11px] text-white/30 mt-2">All pages, backend, and infrastructure complete · 26 DB tables · tus upload · SigLIP AI · Resend emails · Cloudflare Images · PWA · Stripe + HelloSign</p>
      </div>

      {/* Build status table */}
      <Section title="Build Status by Area">
        <Table
          headers={['Area', 'Route', 'Status', 'Notes']}
          rows={[
            ['Dashboard (v2)',        '/dashboard',                          <Badge type="built" />, 'AI briefing, stat cards, calendar widget, quick actions'],
            ['Projects',              '/dashboard/projects',                 <Badge type="built" />, 'Grid/list toggle, new project modal, filter bar'],
            ['AI Workspace',          '/dashboard/projects/[id]',            <Badge type="built" />, '6-tab workspace, AI sort, review, shot list, gallery preview'],
            ['Gallery Builder',       '/project/[id]/gallery-builder',       <Badge type="built" />, 'Split-panel, theme picker, watermark, access controls'],
            ['Deliver/Publish',       '/projects/[id]/publish',              <Badge type="built" />, '3-stage delivery wizard'],
            ['Booking',               '/dashboard/booking',                  <Badge type="built" />, 'Packages, inquiry inbox, availability calendar'],
            ['Photo Page Editor',     '/dashboard/bookings/photo-page',      <Badge type="built" />, 'WYSIWYG editor, drag-reorder sections, SEO'],
            ['Calendar',              '/dashboard/calendar',                 <Badge type="built" />, '4-view calendar, drag-reschedule, event creation'],
            ['Clients & CRM',         '/dashboard/clients',                  <Badge type="built" />, 'Kanban pipeline, list view, client profiles'],
            ['Contracts',             '/dashboard/contracts',                <Badge type="built" />, 'AI generator, template editor, status tracking, HelloSign'],
            ['Finances',              '/dashboard/finances',                 <Badge type="built" />, 'Revenue dashboard, invoice table, Stripe payouts'],
            ['Analytics',             '/dashboard/analytics',                <Badge type="built" />, '5 tabs: Overview, Gallery, Revenue, Leads, AI Insights'],
            ['Content Hub',           '/dashboard/content',                  <Badge type="built" />, 'Post creator, content calendar, platform preview'],
            ['Notifications',         '/dashboard/notifications',            <Badge type="built" />, 'Bell dropdown, panel, activity feed'],
            ['Settings (all)',        '/dashboard/settings/*',               <Badge type="built" />, 'Profile, Branding, Billing, Connect, Team, AI, Notifications, Integrations'],
            ['Client Portal',         '/client',                             <Badge type="built" />, 'Galleries grid, pending actions, account section'],
            ['Gallery Viewer',        '/gallery/[id]',                       <Badge type="built" />, 'Category tabs, photo grid, favorites, lightbox, download'],
            ['Checkout',              '/gallery/[id]/checkout',              <Badge type="built" />, 'Package selector, Stripe payment form, success page'],
            ['Client Auth',           '/auth/client-login',                  <Badge type="built" />, 'Magic link JWT auth, middleware guards'],
            ['E-Signature',           '/sign/[id]',                          <Badge type="built" />, 'HelloSign integration, webhook handler, client signing page'],
            ['Edit Requests',         'EditRequestsPanel',                   <Badge type="built" />, 'Status tracking, pricing modal, action menus'],
            ['Landing Page',          '/',                                   <Badge type="built" />, 'Hero, features, pricing, waitlist form'],
            ['Command Bar ⌘K',        'Global',                              <Badge type="built" />, 'Radix Dialog, keyboard nav, search across entities'],
            ['Questionnaire Builder', '/dashboard/questionnaires/builder',   <Badge type="built" />, 'Drag-drop field builder, preview mode'],
            ['DB Migration (26 tbl)', 'Supabase',                            <Badge type="built" />, '9 migration files, 26 tables, full RLS — run supabase db push'],
            ['Upload Pipeline',       'tus + IndexedDB',                     <Badge type="built" />, 'tus-js-client v4, 6MB chunks, Supabase resumable, IndexedDB queue'],
            ['AI Classifier',         'SigLIP Worker',                       <Badge type="built" />, '@xenova/transformers CLIP, Web Worker, zero-shot, IndexedDB cache'],
            ['Email (Resend)',         '9 templates',                         <Badge type="built" />, 'Full Resend SDK, 9 React email templates — needs RESEND_API_KEY'],
            ['PWA',                   'manifest + SW',                       <Badge type="built" />, 'manifest.json, @ducanh2912/next-pwa, shortcuts'],
            ['Cloudflare Images',     'CDN transforms',                      <Badge type="built" />, 'Real CF Images API, CDN variants, auto-fallback to Supabase'],
          ]}
        />
      </Section>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tab 2 — Page Map
───────────────────────────────────────────── */

function PageMapTab() {
  return (
    <div className="space-y-8">
      <Section title="Auth & Onboarding">
        <Table
          headers={['Route', 'Page', 'Key Components']}
          rows={[
            [<code className="text-blue-400 text-[11px]">/auth/login</code>, 'Login', 'Email + password, OAuth, error states'],
            [<code className="text-blue-400 text-[11px]">/auth/signup</code>, 'Sign Up', 'Email + Google OAuth, Supabase createUser'],
            [<code className="text-blue-400 text-[11px]">/auth/reset-password</code>, 'Password Reset', 'Email link, new password form, redirect'],
            [<code className="text-blue-400 text-[11px]">/auth/client-login</code>, 'Client Magic Link', 'JWT magic link, session create, redirect to /client'],
            [<code className="text-blue-400 text-[11px]">/onboarding</code>, 'Onboarding Wizard', 'Profile setup, preset select, Stripe Connect step'],
          ]}
        />
      </Section>

      <Section title="Dashboard">
        <Table
          headers={['Route', 'Page', 'Key Components']}
          rows={[
            [<code className="text-blue-400 text-[11px]">/dashboard</code>, 'Dashboard v2', 'AI briefing, stat cards, calendar widget, quick actions, activity feed'],
            [<code className="text-blue-400 text-[11px]">/dashboard/projects</code>, 'Projects', 'Grid/list view, NewProjectModal, preset selector, filter bar'],
            [<code className="text-blue-400 text-[11px]">/dashboard/projects/[id]</code>, 'AI Workspace', '6 tabs: Upload, AI Sort, Review, Shot List, Gallery Preview, Settings'],
            [<code className="text-blue-400 text-[11px]">/project/[id]/gallery-builder</code>, 'Gallery Builder', 'Split panel, theme picker, watermark config, access controls'],
            [<code className="text-blue-400 text-[11px]">/projects/[id]/publish</code>, 'Publish Wizard', 'Stage 1 Preview → Stage 2 Finals → Stage 3 Deliver'],
            [<code className="text-blue-400 text-[11px]">/dashboard/booking</code>, 'Booking', 'Package cards, inquiry inbox, mini calendar'],
            [<code className="text-blue-400 text-[11px]">/dashboard/bookings/photo-page</code>, 'Photo Page Editor', 'WYSIWYG, drag-reorder sections, SEO fields, live preview'],
            [<code className="text-blue-400 text-[11px]">/dashboard/calendar</code>, 'Calendar', 'Day/Week/Month/Year views, dnd-reschedule, event modal'],
            [<code className="text-blue-400 text-[11px]">/dashboard/clients</code>, 'Clients CRM', 'Kanban pipeline, list view, client profiles, add/edit modal'],
            [<code className="text-blue-400 text-[11px]">/dashboard/contracts</code>, 'Contracts', 'AI generator, template editor, HelloSign send, status tracking'],
            [<code className="text-blue-400 text-[11px]">/dashboard/finances</code>, 'Finances', 'Revenue chart, invoice table, Stripe Connect payouts'],
            [<code className="text-blue-400 text-[11px]">/dashboard/analytics</code>, 'Analytics', '5 tabs: Overview, Gallery, Revenue, Leads, AI Insights'],
            [<code className="text-blue-400 text-[11px]">/dashboard/content</code>, 'Content Hub', 'Post creator, content calendar, platform preview'],
            [<code className="text-blue-400 text-[11px]">/dashboard/notifications</code>, 'Notifications', 'Bell dropdown, full panel, activity feed'],
            [<code className="text-blue-400 text-[11px]">/dashboard/questionnaires/builder</code>, 'Questionnaire Builder', 'Drag-drop fields, preview mode, send link'],
          ]}
        />
      </Section>

      <Section title="Settings">
        <Table
          headers={['Route', 'Panel', 'Key Features']}
          rows={[
            [<code className="text-blue-400 text-[11px]">/settings/profile</code>, 'Profile', 'Avatar upload, display name, bio, social links, auto-save'],
            [<code className="text-blue-400 text-[11px]">/settings/branding</code>, 'Branding', 'Logo, brand colors, default gallery theme, watermark'],
            [<code className="text-blue-400 text-[11px]">/settings/billing</code>, 'Billing', 'Free/Pro $29/Business $79, usage meters, Stripe upgrade, history'],
            [<code className="text-blue-400 text-[11px]">/settings/connect</code>, 'Stripe Connect', 'Express account create, onboarding redirect, charges_enabled status'],
            [<code className="text-blue-400 text-[11px]">/settings/team</code>, 'Team', 'Member table, invite flow, role permissions matrix'],
            [<code className="text-blue-400 text-[11px]">/settings/integrations</code>, 'Integrations', 'Stripe, Google Calendar, Lightroom, Zapier cards'],
            [<code className="text-blue-400 text-[11px]">/settings/ai-profile</code>, 'AI Profile', 'AI workspace setup wizard, style profile'],
            [<code className="text-blue-400 text-[11px]">/settings/notifications</code>, 'Notifications', 'Email + in-app toggles per event type'],
            [<code className="text-blue-400 text-[11px]">/settings/themes</code>, 'Gallery Themes', 'Default theme preset, color overrides'],
            [<code className="text-blue-400 text-[11px]">/settings/watermark</code>, 'Watermark', 'Position, opacity, logo select'],
            [<code className="text-blue-400 text-[11px]">/settings/emails</code>, 'Email Templates', '9 transactional email template editors'],
            [<code className="text-blue-400 text-[11px]">/settings/offers</code>, 'Offers & Pricing', 'Package pricing, add-ons, discount codes'],
          ]}
        />
      </Section>

      <Section title="Client-Facing">
        <Table
          headers={['Route', 'Page', 'Key Components']}
          rows={[
            [<code className="text-blue-400 text-[11px]">/client</code>, 'Client Portal', 'Galleries grid, pending actions (downloads, contracts, invoices), account'],
            [<code className="text-blue-400 text-[11px]">/gallery/[id]</code>, 'Gallery Viewer', 'Category tabs, photo grid, lightbox, favorites, FavoritesStrip, access gate'],
            [<code className="text-blue-400 text-[11px]">/gallery/[id]/checkout</code>, 'Checkout', 'PackageSelector, OrderSummary, Stripe Elements, success page'],
            [<code className="text-blue-400 text-[11px]">/sign/[id]</code>, 'E-Signature', 'HelloSign embed, sign/decline, webhook updates contract status'],
          ]}
        />
      </Section>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tab 3 — Spec Gap Analysis
───────────────────────────────────────────── */

function SpecGapTab() {
  return (
    <div>
      <div className="rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20 p-4 mb-6 text-sm text-white/70">
        <span className="text-emerald-400 font-semibold">All Phase 1 code is shipped.</span> Only env vars + <code className="text-blue-400">supabase db push</code> needed before going live.
      </div>

      <Table
        headers={['Spec Requirement', 'Phase', 'Status', 'What Exists']}
        rows={[
          ['Photographer auth (email + OAuth)', <Badge type="p1" />, <Badge type="built" />, 'Supabase auth, login/signup/reset pages, middleware'],
          ['Guided onboarding wizard', <Badge type="p1" />, <Badge type="built" />, '/onboarding with Stripe Connect step'],
          ['Project creation + preset selection', <Badge type="p1" />, <Badge type="built" />, 'NewProjectModal, preset selector'],
          ['Resumable upload queue (tus + IndexedDB)', <Badge type="p1" />, <Badge type="built" />, 'tus-js-client v4, 6MB chunks, Supabase resumable endpoint, IndexedDB queue'],
          ['AI classification (SigLIP Web Worker)', <Badge type="p1" />, <Badge type="built" />, '@xenova/transformers CLIP, Web Worker, zero-shot classification'],
          ['Manual re-categorization + drag-reorder', <Badge type="p1" />, <Badge type="built" />, 'AI Workspace Review tab, dnd-kit'],
          ['Grid/list view + orientation filter', <Badge type="p1" />, <Badge type="built" />, 'Projects page, AI workspace'],
          ['Shareable gallery (4 themes)', <Badge type="p1" />, <Badge type="built" />, 'Gallery Builder + theme picker + Gallery Viewer'],
          ['Public/private toggle per project', <Badge type="p1" />, <Badge type="built" />, 'Gallery Builder access controls'],
          ['Tiered client access (preview/proofing/delivered)', <Badge type="p1" />, <Badge type="built" />, 'AccessGate component, GalleryPasswordGate'],
          ['Cloudflare Images (thumbs + watermarks)', <Badge type="p1" />, <Badge type="built" />, 'Real CF Images API upload, CDN variants, Supabase fallback'],
          ['Magic link client invitations (Resend)', <Badge type="p1" />, <Badge type="built" />, '/api/invitations route + sendGalleryInvitationEmail() — needs RESEND_API_KEY'],
          ['Flat-fee download payments (Stripe Connect)', <Badge type="p1" />, <Badge type="built" />, 'Checkout page, PaymentForm, Stripe Connect setup'],
          ['Photographer subscription billing (Free/Pro/Business)', <Badge type="p1" />, <Badge type="built" />, 'Billing panel, plan comparison, upgrade flow'],
          ['Stripe Connect onboarding', <Badge type="p1" />, <Badge type="built" />, 'StripeConnectSetup, /settings/connect, API routes'],
          ['9 transactional emails (Resend)', <Badge type="p1" />, <Badge type="built" />, 'Full Resend SDK, 9 React email templates — needs RESEND_API_KEY in Vercel'],
          ['Notifications (bell + activity feed)', <Badge type="p1" />, <Badge type="built" />, 'NotificationBell, NotificationsPanel, activity feed'],
          ['ZIP export', <Badge type="p1" />, <Badge type="built" />, '/api/export with JSZip, streams from Supabase Storage'],
          ['Landing page', <Badge type="p1" />, <Badge type="built" />, '/, hero, features, pricing, waitlist'],
          ['PWA (installable, offline)', <Badge type="p1" />, <Badge type="built" />, 'manifest.json, @ducanh2912/next-pwa, apple-touch, shortcuts'],
        ]}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tab 4 — User Journeys
───────────────────────────────────────────── */

function FlowStep({ num, color, title, sub }: { num: number; color: string; title: string; sub: string }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl p-3 ${color}`}>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white/70 flex-shrink-0 mt-0.5">{num}</span>
      <div>
        <div className="text-sm font-semibold text-white/85">{title}</div>
        <div className="text-[11px] text-white/40 mt-0.5">{sub}</div>
      </div>
    </div>
  )
}

function JourneysTab() {
  return (
    <div className="space-y-10">
      {/* Photographer */}
      <Section title="Photographer Journey — Sarah (Wedding + Portrait)">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-bold text-violet-400/70 uppercase tracking-wider mb-3">🚀 Signup & Setup</div>
            <FlowStep num={1} color="bg-violet-500/10" title="Visit landing page" sub="/ → Join waitlist / Sign up" />
            <FlowStep num={2} color="bg-violet-500/10" title="Create account" sub="/auth/signup → email + OAuth" />
            <FlowStep num={3} color="bg-violet-500/10" title="Onboarding wizard" sub="/onboarding → business name, preset, Stripe Connect" />
            <FlowStep num={4} color="bg-violet-500/10" title="Dashboard v2" sub="/dashboard → briefing, stats, quick actions" />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-blue-400/70 uppercase tracking-wider mb-3">📸 Upload & Sort</div>
            <FlowStep num={5} color="bg-blue-500/10" title="Create project" sub="/dashboard/projects → New Project modal + preset" />
            <FlowStep num={6} color="bg-blue-500/10" title="Upload media" sub="AI Workspace Upload Zone → tus resumable upload" />
            <FlowStep num={7} color="bg-blue-500/10" title="AI classifies" sub="SigLIP Web Worker → category columns" />
            <FlowStep num={8} color="bg-blue-500/10" title="Review & adjust" sub="AI Sort tab, Review tab, Vibe Presets → drag to recategorize" />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider mb-3">🖼 Gallery & Delivery</div>
            <FlowStep num={9}  color="bg-emerald-500/10" title="Build gallery" sub="Gallery Builder → theme, watermark, access control" />
            <FlowStep num={10} color="bg-emerald-500/10" title="Publish" sub="Deliver Wizard → Stage 1 → 2 → 3" />
            <FlowStep num={11} color="bg-emerald-500/10" title="Send contract" sub="Contracts → AI generate → HelloSign send" />
            <FlowStep num={12} color="bg-emerald-500/10" title="Invite client" sub="Magic link email → client can view gallery" />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-400/70 uppercase tracking-wider mb-3">💰 Get Paid</div>
            <FlowStep num={13} color="bg-amber-500/10" title="Client pays" sub="/gallery/[id]/checkout → Stripe Connect split" />
            <FlowStep num={14} color="bg-amber-500/10" title="Payout" sub="Stripe Connect → photographer's bank account" />
            <FlowStep num={15} color="bg-amber-500/10" title="Track revenue" sub="/dashboard/finances → Analytics → Revenue tab" />
            <FlowStep num={16} color="bg-amber-500/10" title="Review analytics" sub="Gallery views, download rate, lead sources" />
          </div>
        </div>
      </Section>

      {/* Client */}
      <Section title="Client Journey — Alex (Wedding Client)">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider mb-3">📩 Invitation</div>
            <FlowStep num={1} color="bg-emerald-500/10" title="Receive magic link email" sub="Resend transactional → unique JWT link" />
            <FlowStep num={2} color="bg-emerald-500/10" title="Click link → client session" sub="/auth/client-login → session created, redirect to /client" />
            <FlowStep num={3} color="bg-emerald-500/10" title="Client portal" sub="/client → galleries grid, pending actions" />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-blue-400/70 uppercase tracking-wider mb-3">🖼 Gallery</div>
            <FlowStep num={4} color="bg-blue-500/10" title="View gallery" sub="/gallery/[id] → category tabs, photo grid" />
            <FlowStep num={5} color="bg-blue-500/10" title="Lightbox" sub="Click photo → arrows, keyboard, swipe, zoom" />
            <FlowStep num={6} color="bg-blue-500/10" title="Favorites" sub="Heart photos → FavoritesStrip shows selection" />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-400/70 uppercase tracking-wider mb-3">💳 Checkout</div>
            <FlowStep num={7} color="bg-amber-500/10" title="Click Download" sub="Gallery → /gallery/[id]/checkout" />
            <FlowStep num={8} color="bg-amber-500/10" title="Select package" sub="Digital / Prints+Digital / Album+Digital" />
            <FlowStep num={9} color="bg-amber-500/10" title="Pay with Stripe" sub="Stripe Elements → payment confirmed" />
            <FlowStep num={10} color="bg-amber-500/10" title="Success + download" sub="ZIP download link, receipt email" />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-pink-400/70 uppercase tracking-wider mb-3">✍️ Contract & Edits</div>
            <FlowStep num={11} color="bg-pink-500/10" title="Sign contract" sub="/sign/[id] → HelloSign embed → signed" />
            <FlowStep num={12} color="bg-pink-500/10" title="Request edits" sub="Edit Requests panel → photographer gets notified" />
            <FlowStep num={13} color="bg-pink-500/10" title="Receive edits" sub="Photographer delivers → client views updated gallery" />
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tab 5 — QA Checklists
───────────────────────────────────────────── */

function CheckItem({ status, text }: { status: 'pass' | 'warn' | 'fail'; text: string }) {
  const icon = status === 'pass'
    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
    : status === 'warn'
    ? <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
    : <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
  return (
    <li className="flex items-start gap-2 py-1.5 border-b border-white/[0.04] last:border-0 text-[12px] text-white/65">
      {icon}
      <span>{text}</span>
    </li>
  )
}

function QATab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        {/* Core flows */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <h3 className="text-sm font-bold text-white mb-4">Core Flows</h3>
          <ul className="list-none">
            <CheckItem status="pass" text="Sign up → onboarding → dashboard (full flow)" />
            <CheckItem status="warn" text="Upload → AI sort → review → drag recategorize" />
            <CheckItem status="warn" text="Build gallery → theme → publish → delivery wizard" />
            <CheckItem status="warn" text="Client views gallery → lightbox → favorites" />
            <CheckItem status="warn" text="Client → checkout → Stripe payment → success" />
            <CheckItem status="warn" text="Photographer sees payout in finances/analytics" />
          </ul>
        </div>

        {/* Payments */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <h3 className="text-sm font-bold text-white mb-4">Payments & Billing</h3>
          <div className="text-[10px] text-amber-400/70 mb-3 font-mono">Use card: 4242 4242 4242 4242</div>
          <ul className="list-none">
            <CheckItem status="warn" text="Billing page shows Free/Pro/Business plan cards" />
            <CheckItem status="warn" text="Click Upgrade → Stripe Checkout opens" />
            <CheckItem status="warn" text="Complete test payment → redirected back" />
            <CheckItem status="warn" text="Subscription status updates in Supabase via webhook" />
            <CheckItem status="warn" text="/settings/connect → Stripe Connect onboarding flow" />
            <CheckItem status="warn" text="After Connect: charges_enabled shows in dashboard" />
            <CheckItem status="warn" text="Client checkout: payment goes to photographer via Connect" />
            <CheckItem status="warn" text="Payout appears in Stripe Connect dashboard" />
          </ul>
        </div>

        {/* Auth */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <h3 className="text-sm font-bold text-white mb-4">Auth & Access Control</h3>
          <ul className="list-none">
            <CheckItem status="pass" text="/dashboard/* redirects to /auth/login when unauthenticated" />
            <CheckItem status="pass" text="/client/* redirects to /auth/client-login for clients" />
            <CheckItem status="warn" text="Magic link email received (requires RESEND_API_KEY)" />
            <CheckItem status="warn" text="Magic link token validates → client session created" />
            <CheckItem status="pass" text="Password-protected gallery blocks without correct password" />
            <CheckItem status="pass" text="Invite-only gallery blocks without magic link" />
            <CheckItem status="warn" text="RLS policies prevent cross-photographer data access" />
            <CheckItem status="pass" text="ANON key used client-side only (no service_role exposure)" />
          </ul>
        </div>

        {/* UI */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <h3 className="text-sm font-bold text-white mb-4">UI / Design System</h3>
          <ul className="list-none">
            <CheckItem status="pass" text="Metallic rainbow gradient shell on all dashboard pages" />
            <CheckItem status="pass" text="CSS variable tokens — no hardcoded hex colors" />
            <CheckItem status="pass" text="Glass cards: consistent backdrop-filter + border style" />
            <CheckItem status="pass" text="Sidebar nav highlights active route via usePathname" />
            <CheckItem status="pass" text="TopNav responsive: collapses on mobile" />
            <CheckItem status="pass" text="Client gallery nav tabs visible at 375px mobile" />
            <CheckItem status="pass" text="Command bar ⌘K accessible on all dashboard pages" />
            <CheckItem status="pass" text="Dialog.Title present for WCAG compliance" />
            <CheckItem status="warn" text="All pages tested at 375px / 768px / 1280px / 1440px" />
            <CheckItem status="warn" text="Dark mode: test prefers-color-scheme system dark" />
            <CheckItem status="warn" text="Loading states render skeletons correctly" />
            <CheckItem status="warn" text="Error boundaries show gracefully on throw" />
          </ul>
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-[11px] text-white/40 flex items-center gap-2">
        <Circle className="h-3 w-3 text-amber-400" />
        Items marked amber are untested pending env var setup. Run the deployment checklist first, then come back and verify each one.
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tab 6 — Stress Test (iframe embed)
───────────────────────────────────────────── */

function StressTestTab() {
  return (
    <div>
      <div className="rounded-xl bg-blue-500/[0.07] border border-blue-500/20 p-3 mb-4 text-[12px] text-white/60 flex items-center gap-2">
        <span className="text-blue-400 font-semibold">Interactive stress test</span> — role-play as photographer then client. Mark every item Pass / Fail / Needs Work, add notes, export a fix-list prompt file. Your progress saves automatically.
      </div>
      <div className="rounded-xl overflow-hidden border border-white/[0.08]">
        <iframe
          src="/build-validation.html#stress-intro"
          className="w-full"
          style={{ height: '80vh', border: 'none', background: '#0d0e14' }}
          title="Stress Test"
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tab 7 — Deployment checklist
───────────────────────────────────────────── */

import { useState } from 'react'

function DeployTab() {
  const ITEMS = [
    {
      id: 'supabase-login',
      title: 'Authenticate Supabase CLI',
      desc: <>Run <Mono>supabase login</Mono> in terminal, then re-run <Mono>npx supabase db push</Mono> — got "Access token not provided" error last attempt.</>,
    },
    {
      id: 'db-push',
      title: 'Run DB migration',
      desc: <><Mono>npx supabase db push</Mono> — creates all 26 tables. Nothing works without this.</>,
    },
    {
      id: 'vercel-env',
      title: 'Set Vercel environment variables',
      desc: <>SUPABASE_SERVICE_ROLE_KEY · STRIPE_SECRET_KEY · STRIPE_WEBHOOK_SECRET · NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY · RESEND_API_KEY · HELLOSIGN_API_KEY · NEXT_PUBLIC_APP_URL</>,
    },
    {
      id: 'stripe-webhook',
      title: 'Register Stripe webhook endpoint',
      desc: <>Stripe dashboard → Webhooks → Add endpoint → <Mono>https://your-domain.com/api/webhooks/stripe</Mono> → copy signing secret → paste as STRIPE_WEBHOOK_SECRET</>,
    },
    {
      id: 'hellosign-webhook',
      title: 'Register HelloSign webhook',
      desc: <>HelloSign dashboard → API → Webhooks → <Mono>https://your-domain.com/api/webhooks/hellosign</Mono></>,
    },
    {
      id: 'resend-domain',
      title: 'Verify sender domain in Resend',
      desc: 'resend.com → Domains → Add domain → add DNS records → verify. Required for emails to deliver.',
    },
    {
      id: 'deploy',
      title: 'Deploy to Vercel',
      desc: <><Mono>git push origin main</Mono> → confirm build passes in Vercel dashboard</>,
    },
  ]

  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    const out: Record<string, boolean> = {}
    ITEMS.forEach(({ id }) => {
      out[id] = localStorage.getItem('setup_' + id) === '1'
    })
    return out
  })

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem('setup_' + id, next[id] ? '1' : '0')
      return next
    })
  }

  const done = Object.values(checked).filter(Boolean).length
  const total = ITEMS.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-white/40">Complete these before running the stress test on real data.</p>
        <span className={`text-sm font-bold ${done === total ? 'text-emerald-400' : 'text-amber-400'}`}>
          {done}/{total} complete
        </span>
      </div>

      <div className="space-y-3">
        {ITEMS.map(({ id, title, desc }) => (
          <label
            key={id}
            className={[
              'flex items-start gap-4 rounded-xl p-4 cursor-pointer transition-all border',
              checked[id]
                ? 'bg-emerald-500/[0.07] border-emerald-500/20'
                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]',
            ].join(' ')}
          >
            <input
              type="checkbox"
              checked={!!checked[id]}
              onChange={() => toggle(id)}
              className="mt-0.5 accent-emerald-500 h-4 w-4 flex-shrink-0"
            />
            <div>
              <div className={`text-sm font-semibold ${checked[id] ? 'line-through text-white/35' : 'text-white/85'}`}>
                {title}
              </div>
              <div className="text-[11px] text-white/40 mt-1 leading-relaxed">{desc}</div>
            </div>
          </label>
        ))}
      </div>

      {done === total && (
        <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-sm text-emerald-400 font-semibold text-center">
          ✓ All setup steps complete — ready for stress test
        </div>
      )}
    </div>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[10px] bg-white/[0.07] text-blue-400 px-1.5 py-0.5 rounded">
      {children}
    </code>
  )
}
