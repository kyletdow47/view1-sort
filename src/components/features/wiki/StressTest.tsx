'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, Bug, Download } from 'lucide-react'

/* ─── Data ─── */

interface STItem {
  id: string
  label: string
  hint: string
  path?: string
}

interface STGroup {
  id: string
  emoji: string
  title: string
  persona: 'photographer' | 'client'
  items: STItem[]
}

const GROUPS: STGroup[] = [
  {
    id: 'auth', emoji: '🔐', title: '1 — Auth & Onboarding', persona: 'photographer',
    items: [
      { id: 'auth-1', label: 'Sign up with email + password', hint: 'Form validates, Supabase creates user, redirect to onboarding', path: '/auth/signup' },
      { id: 'auth-2', label: 'Sign up with Google OAuth', hint: 'OAuth button works, provider flow completes, new user created', path: '/auth/signup' },
      { id: 'auth-3', label: 'Login page — email + password', hint: 'Correct credentials → dashboard. Wrong credentials → error shown', path: '/auth/login' },
      { id: 'auth-4', label: 'Forgot password — email reset flow', hint: 'Email sends, link opens, new password saved, redirect to login', path: '/auth/reset-password' },
      { id: 'auth-5', label: 'Onboarding wizard — step 1: profile name + photo', hint: 'Field validates, avatar upload works, "Next" advances step', path: '/onboarding' },
      { id: 'auth-6', label: 'Onboarding — Stripe Connect step', hint: 'Connect button opens Stripe OAuth, account links, confirmation shows', path: '/onboarding' },
      { id: 'auth-7', label: 'Redirect guard — unauthenticated user visiting /dashboard', hint: 'Should redirect to /auth/login, not show dashboard', path: 'middleware' },
      { id: 'auth-8', label: 'Logout — session cleared, redirected to /auth/login', hint: 'Click Sign Out. Cookie/session gone. Can\'t revisit dashboard.', path: 'TopNav' },
    ],
  },
  {
    id: 'dash', emoji: '🏠', title: '2 — Dashboard & Global Navigation', persona: 'photographer',
    items: [
      { id: 'dash-1', label: 'Dashboard loads without errors', hint: 'Stat cards, AI briefing panel, calendar widget all render', path: '/dashboard' },
      { id: 'dash-2', label: 'Sidebar navigation — all links route correctly', hint: 'Every sidebar item navigates, active state highlights correctly' },
      { id: 'dash-3', label: 'Command bar ⌘K opens', hint: 'Keyboard shortcut and click both work. Dialog opens centered with backdrop.' },
      { id: 'dash-4', label: 'Command bar — search results, keyboard nav, ESC close', hint: 'Type "client" → results show. Arrow keys move selection. Enter navigates. ESC closes.' },
      { id: 'dash-5', label: 'Top nav — notifications bell opens dropdown', hint: 'Bell icon opens panel. Unread count badge visible. Click notification navigates.' },
      { id: 'dash-6', label: 'Top nav — profile/avatar menu', hint: 'Click avatar → dropdown with Settings, Billing, Sign Out links' },
      { id: 'dash-7', label: 'Dashboard stat cards — numbers render, no layout break', hint: 'Revenue, projects, shoots this month, pending items all show (even if 0)' },
      { id: 'dash-8', label: 'Dashboard responsive — mobile sidebar collapses', hint: 'Resize to 390px. Sidebar becomes hamburger. Content stacks. Nothing overflows.' },
    ],
  },
  {
    id: 'proj', emoji: '📁', title: '3 — Projects & Photo Upload', persona: 'photographer',
    items: [
      { id: 'proj-1', label: 'Projects page loads — grid and list view toggle', hint: 'Empty state shows on no projects. Grid/list toggle switches layout.', path: '/dashboard/projects' },
      { id: 'proj-2', label: '"New Project" button opens modal', hint: 'Modal opens. Project name required. Preset selector shows options. Cancel closes.' },
      { id: 'proj-3', label: 'Create project — form submits, project appears in list', hint: 'New project created in Supabase, card/row appears without page reload' },
      { id: 'proj-4', label: 'Upload Zone — drag and drop files', hint: 'Drag JPG/RAW files. Drop target highlights. Files queued in progress panel.' },
      { id: 'proj-5', label: 'Upload Zone — click to browse file picker', hint: 'Click zone → file picker opens. Multi-select works. Wrong type shows error.' },
      { id: 'proj-6', label: 'Upload progress bar — per-file and overall progress', hint: 'Each file shows filename, % progress, size. Overall bar moves. Completed tick green.' },
      { id: 'proj-7', label: 'Upload — invalid file type shows user-friendly error', hint: 'Drop a .pdf or .mp3. Error appears in zone, no crash, no silent fail.' },
    ],
  },
  {
    id: 'aiws', emoji: '🤖', title: '4 — AI Workspace & Sorting', persona: 'photographer',
    items: [
      { id: 'ai-1', label: 'AI Workspace loads — 6 tabs visible', hint: 'Upload, Sort, Review, Shot List, Gallery Preview, Settings tabs all present' },
      { id: 'ai-2', label: 'AI Sort button — triggers classification, progress shows', hint: 'Model loading indicator appears. % progress updates. Photos get category labels.' },
      { id: 'ai-3', label: 'Category scene tabs appear and filter photos', hint: 'After sort: Ceremony, Reception, Portraits tabs show with counts. Click filters grid.' },
      { id: 'ai-4', label: 'Photo selection — click selects, shift+click range select', hint: 'Selected photos highlight. Selection count in toolbar. Deselect with second click.' },
      { id: 'ai-5', label: 'Star rating (1–5) on photos', hint: 'Hover shows stars. Click sets rating. Rating persists on navigation. 0 clears.' },
      { id: 'ai-6', label: 'Color label assignment (red/yellow/green/blue/purple)', hint: 'Right-click or label button opens color picker. Label dot appears on thumbnail.' },
      { id: 'ai-7', label: 'Filter bar — filter by star rating and color label', hint: 'Select "3+ stars" → only 3–5 star photos show. Clear filter restores all.' },
      { id: 'ai-8', label: 'Sort controls — AI score, date, filename', hint: 'Each sort re-orders the grid. Toggle asc/desc. Active sort visually indicated.' },
      { id: 'ai-9', label: 'Grid / List view toggle', hint: 'Switch between grid and list. Both render correctly. Selection carries over.' },
      { id: 'ai-10', label: 'Shot list panel — items, priority badges, matched toggle', hint: 'Must-have vs nice-to-have labels. Sections collapsible. Matched items check off.' },
    ],
  },
  {
    id: 'gallery', emoji: '🖼', title: '5 — Gallery Builder & Delivery', persona: 'photographer',
    items: [
      { id: 'gal-1', label: 'Gallery Builder — split-panel loads correctly', hint: 'Left: settings panel. Right: live preview. Both visible and functional.' },
      { id: 'gal-2', label: 'Theme picker — dark / light / minimal / editorial', hint: 'Each theme changes preview in real time. Selection persists on save.' },
      { id: 'gal-3', label: 'Watermark toggle — on/off, position, opacity slider', hint: 'Toggle adds watermark to preview. Opacity slider adjusts. Position dropdown works.' },
      { id: 'gal-4', label: 'Access control — open / password / invitation-only toggle', hint: 'Each mode shows correct sub-options. Password field appears when "password" selected.' },
      { id: 'gal-5', label: 'Publish gallery — share link generated and copies', hint: '3-step wizard completes. "Copy link" copies /gallery/[id] URL. Toast confirms.' },
      { id: 'gal-6', label: 'Invite client by email — sends invite, access record created', hint: 'Enter client email. API call succeeds. Email sent (or logged in dev).' },
    ],
  },
  {
    id: 'booking', emoji: '📅', title: '6 — Booking, Calendar & Clients', persona: 'photographer',
    items: [
      { id: 'bk-1', label: 'Calendar — 4 view modes: Month, Week, Day, List', hint: 'Each view renders events. Active view button is highlighted.' },
      { id: 'bk-2', label: 'Add event from calendar — form opens, saves, event appears', hint: 'Click "+ New Event" or click a date cell. Form submits. Event dot/block visible.' },
      { id: 'bk-3', label: 'Booking page — packages display, inquiry form works', hint: 'Package cards show price/inclusions. Inquiry form submits without errors.' },
      { id: 'bk-4', label: 'Clients Kanban — all 6 stage columns render', hint: 'Inquiry → Quoted → Booked → Shooting → Delivered → Paid. Each column shows count.' },
      { id: 'bk-5', label: 'Add new client — modal opens, form submits, card appears', hint: 'Name, email, shoot type required. Card appears in correct stage column.' },
      { id: 'bk-6', label: 'Client Kanban — drag card between stage columns', hint: 'Drag card from Inquiry to Quoted. Card moves. Stage updates in DB.' },
      { id: 'bk-7', label: 'Clients list view — sort by name, date, stage, revenue', hint: 'Toggle to list view. Column header sorts. Search filters by name/email.' },
      { id: 'bk-8', label: 'Client detail page — tabs (Overview, Projects, Invoices)', hint: 'Click a client card. Detail page opens. All 3 tabs switch correctly.' },
    ],
  },
  {
    id: 'contracts', emoji: '📄', title: '7 — Contracts & Questionnaires', persona: 'photographer',
    items: [
      { id: 'ct-1', label: 'Contracts page — tabs: Contracts, Templates, Questionnaires', hint: 'All 3 tabs load. Empty states show correctly. Badge counts update.' },
      { id: 'ct-2', label: 'Create new contract — template selection and AI generator', hint: '"New Contract" opens modal. Pick template. AI fills variables. Body editable.' },
      { id: 'ct-3', label: 'Send contract for signature — HelloSign API, status updates', hint: 'Click "Send for Signature". Status changes to "Sent". HelloSign email sent.' },
      { id: 'ct-4', label: 'Questionnaire builder — drag-drop field order', hint: 'Add 3+ fields. Drag to reorder. Order saves. Field types all work.' },
      { id: 'ct-5', label: 'Questionnaire conditional logic — field shows/hides on answer', hint: 'Set condition: "Show field B if field A = Yes". Preview mode: answer A → B appears.' },
    ],
  },
  {
    id: 'finances', emoji: '💰', title: '8 — Finances, Analytics & Content Hub', persona: 'photographer',
    items: [
      { id: 'fin-1', label: 'Finances — revenue stats, invoice table render', hint: 'KPI cards show. Invoice rows display. Tabs (Invoices, Payouts) switch.' },
      { id: 'fin-2', label: 'Invoice creator — create, preview, send invoice', hint: 'Open invoice creator. Fill client/amount. Line items add/remove. "Send" calls API.' },
      { id: 'fin-3', label: 'Analytics — all 5 tabs load without errors', hint: 'Overview, Gallery, Revenue, Lead Funnel, AI Insights. Each loads charts/data.' },
      { id: 'fin-4', label: 'Analytics — Recharts render correctly, no overflow', hint: 'Charts fill their containers. Tooltips show on hover. Legend renders. No text clipping.' },
      { id: 'fin-5', label: 'Date range picker — changes analytics data range', hint: 'Select "Last 7 days" vs "Last 30 days". API re-fetches. Numbers change.' },
      { id: 'fin-6', label: 'Content Hub — post creator opens, photo picker works', hint: 'Open post creator. Select photos. Caption area. Platform toggles (IG/FB/TT/Pinterest).' },
      { id: 'fin-7', label: 'Content Hub — AI caption generation button', hint: 'Click "Generate Caption". API call to /api/ai/captions. Caption populates textarea.' },
      { id: 'fin-8', label: 'Content calendar — drag-drop posts to reschedule', hint: 'Switch to calendar. Drag a post to a new date. Post date updates.' },
    ],
  },
  {
    id: 'settings', emoji: '⚙️', title: '9 — Settings', persona: 'photographer',
    items: [
      { id: 'set-1', label: 'Settings layout — sidebar navigation, all links work', hint: 'Profile, Branding, Billing, Connect, AI, Notifications, Team, Integrations all route.' },
      { id: 'set-2', label: 'Settings > Profile — update name, bio, avatar', hint: 'Change display name. Upload avatar. Save. Reload. Changes persist in Supabase.' },
      { id: 'set-3', label: 'Settings > Branding — logo upload, brand colors, font', hint: 'Upload logo. Pick accent color. Changes apply to gallery preview.' },
      { id: 'set-4', label: 'Settings > Billing — plan shown, upgrade/manage works', hint: 'Current plan badge. "Manage Billing" opens Stripe portal. Plan features listed.' },
      { id: 'set-5', label: 'Settings > Connect — Stripe Connect setup flow', hint: 'Click "Connect Stripe Account". OAuth redirect. Returns with connected status.' },
      { id: 'set-6', label: 'Settings > Notifications — toggles save state', hint: 'Toggle each notification type. Save. Reload. Toggles reflect saved state.' },
    ],
  },
  {
    id: 'cauth', emoji: '✉️', title: '10 — Invitation & Client Auth', persona: 'client',
    items: [
      { id: 'ca-1', label: 'Invitation email received — layout correct, CTA button visible', hint: 'Check the email in a real inbox. View1 branding shows. "View your gallery" button prominent.' },
      { id: 'ca-2', label: 'Magic link token — clicking button in email authenticates client', hint: 'Token in URL is validated. Client session created. Redirected to gallery or client portal.' },
      { id: 'ca-3', label: 'Client login page — email entry, new link request', hint: 'Enter email. "Send new link" works. Expired/invalid token shows helpful error.' },
      { id: 'ca-4', label: 'Client portal loads — gallery cards, navigation tabs visible', hint: 'Gallery thumbnails shown. Galleries / Favorites / Invoices / Account tabs visible on mobile.' },
      { id: 'ca-5', label: 'Client portal — pending actions count badge visible', hint: '"Pending Actions" section shows: unsigned contracts, unanswered questionnaires.' },
    ],
  },
  {
    id: 'gview', emoji: '📸', title: '11 — Gallery Viewing', persona: 'client',
    items: [
      { id: 'gv-1', label: 'Gallery page loads — category tabs, photo grid renders', hint: 'All photos visible. Category tabs match AI sort output. Active tab highlighted.' },
      { id: 'gv-2', label: 'Lightbox opens on photo click — navigation arrows work', hint: 'Click photo → full-screen lightbox. Left/right arrows navigate. Photo counter shows.' },
      { id: 'gv-3', label: 'Lightbox — keyboard navigation (arrows) and ESC close', hint: '→ key = next. ← key = previous. ESC or × closes. No focus trap escape.' },
      { id: 'gv-4', label: 'Mobile swipe — lightbox swipe left/right gesture', hint: 'On 390px viewport: swipe left = next photo. Swipe right = previous. No accidental scroll.' },
      { id: 'gv-5', label: 'Favorite a photo — heart icon, favorites tab updates', hint: 'Click heart on photo. Fills red. Favorites tab count increases. Favorites tab shows it.' },
      { id: 'gv-6', label: 'Unfavorite — heart toggles off, removed from Favorites tab', hint: 'Click heart again → unfills. Favorites strip removes the photo.' },
      { id: 'gv-7', label: 'Watermark visible before purchase', hint: 'On a gallery with pricing: photos show watermark overlay. Download button prompts payment.' },
      { id: 'gv-8', label: 'Download single photo — triggers download', hint: 'On a free/purchased gallery: click download icon. Browser downloads the file.' },
      { id: 'gv-9', label: 'Category tabs scroll horizontally on mobile', hint: 'If many categories, tabs should be scrollable, not wrap or overflow screen.' },
    ],
  },
  {
    id: 'checkout', emoji: '💳', title: '12 — Checkout & Payment', persona: 'client',
    items: [
      { id: 'co-1', label: 'Checkout page — package options and price breakdown', hint: 'Packages listed. Price per photo and total clearly shown. Select changes summary.' },
      { id: 'co-2', label: 'Stripe payment form renders (card element loads)', hint: 'Stripe Elements card input visible. No "failed to load" errors. Input accepts test card.' },
      { id: 'co-3', label: 'Test card payment succeeds (4242 4242 4242 4242)', hint: 'Stripe test card. Payment confirms. Webhook fires. Access upgraded. Success screen shows.' },
      { id: 'co-4', label: 'Declined card shows user-friendly error (4000 0000 0000 0002)', hint: 'Stripe decline test card. Error message shown. Form stays open. User can retry.' },
      { id: 'co-5', label: 'Payment receipt email received after successful payment', hint: 'Check inbox for "Payment confirmed" email. Amount and project name correct.' },
      { id: 'co-6', label: 'Checkout — mobile keyboard doesn\'t break layout', hint: 'On mobile: tap card input. Virtual keyboard opens. Page doesn\'t scroll or shift weirdly.' },
    ],
  },
  {
    id: 'edits', emoji: '✏️', title: '13 — Edit Requests & Contract Signing', persona: 'client',
    items: [
      { id: 'ed-1', label: 'Client submits edit request from gallery', hint: 'Click "Request Edit" on a photo. Fill description. Submit. Photographer sees it in EditRequestsPanel.' },
      { id: 'ed-2', label: 'Photographer prices the edit — client receives update email', hint: 'Set price, "Send for Approval". Status → Priced. Client gets email with price + Approve CTA.' },
      { id: 'ed-3', label: 'Photographer marks delivered — status updates, client notified', hint: 'Mark In Progress then Delivered. Status badges update. Email sent to client.' },
      { id: 'ed-4', label: 'Contract signing link opens HelloSign embed', hint: 'Open signing URL from email. HelloSign embed renders. Signature fields visible. Client can sign.' },
      { id: 'ed-5', label: 'Contract signed — webhook fires, status updates to "Signed"', hint: 'After client signs: Supabase contracts.status = "signed". Photographer dashboard reflects this.' },
    ],
  },
  {
    id: 'ui', emoji: '🎨', title: '14 — UI, Design & Polish', persona: 'client',
    items: [
      { id: 'ui-1', label: 'Landing page — hero, features, pricing, waitlist render', hint: 'Scroll full page. No broken images, overflow, or cut-off text. CTA buttons work.' },
      { id: 'ui-2', label: 'Metallic rainbow gradient system — consistent across all pages', hint: 'Check 5 random pages. Primary actions use amber→pink→purple gradient. No plain blue/green buttons.' },
      { id: 'ui-3', label: 'Toast notifications — appear, auto-dismiss, no stacking overflow', hint: 'Trigger 3 rapid actions. Toasts stack correctly. Each auto-dismisses. X button closes early.' },
      { id: 'ui-4', label: 'Loading states — skeleton loaders show while data fetches', hint: 'Slow the network in devtools. Pages with loading.tsx show skeletons, not blank white.' },
      { id: 'ui-5', label: 'Error boundaries — error.tsx pages show gracefully', hint: 'Throw an error in a component. Error page shows, not crash.' },
      { id: 'ui-6', label: 'Typography — no font loading flash, correct weights render', hint: 'Hard refresh. Fonts load instantly (next/font). Headings use correct weight.' },
      { id: 'ui-7', label: 'All modals — open/close, click-outside dismiss, focus trap', hint: 'Test 3 different modals. Click outside → closes. Tab key cycles within. ESC closes.' },
      { id: 'ui-8', label: 'Empty states — all pages show empty state when no data', hint: 'On a fresh account: every page shows a useful empty state with a CTA, not a blank page.' },
      { id: 'ui-9', label: 'No horizontal scroll on any page (desktop 1280px)', hint: 'Set viewport to 1280px. Scroll every page. Nothing should overflow horizontally.' },
      { id: 'ui-10', label: 'PWA — installable prompt appears on mobile Chrome/Safari', hint: 'Open on mobile. Chrome shows "Add to Home Screen" banner or Safari shows share → "Add to Home Screen".' },
    ],
  },
]

const ALL_ITEMS = GROUPS.flatMap((g) => g.items)
const LS = 'wiki_st_'

type Status = '' | 'pass' | 'fail' | 'needs-work' | 'skip'

/* ─── Main component ─── */

export function StressTest() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [exportMd, setExportMd] = useState('')
  const [copied, setCopied] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const s: Record<string, Status> = {}
    const n: Record<string, string> = {}
    ALL_ITEMS.forEach(({ id }) => {
      const sv = localStorage.getItem(LS + 'status_' + id) as Status | null
      const nv = localStorage.getItem(LS + 'note_' + id)
      if (sv) s[id] = sv
      if (nv) n[id] = nv
    })
    setStatuses(s)
    setNotes(n)
  }, [])

  const setStatus = useCallback((id: string, val: Status) => {
    setStatuses((prev) => {
      const next = { ...prev, [id]: val }
      localStorage.setItem(LS + 'status_' + id, val)
      return next
    })
  }, [])

  const setNote = useCallback((id: string, val: string) => {
    setNotes((prev) => {
      const next = { ...prev, [id]: val }
      localStorage.setItem(LS + 'note_' + id, val)
      return next
    })
  }, [])

  const toggleGroup = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))

  // Counters
  const total = ALL_ITEMS.length
  const pass = ALL_ITEMS.filter(({ id }) => statuses[id] === 'pass').length
  const fail = ALL_ITEMS.filter(({ id }) => statuses[id] === 'fail').length
  const needs = ALL_ITEMS.filter(({ id }) => statuses[id] === 'needs-work').length
  const tested = ALL_ITEMS.filter(({ id }) => statuses[id] && statuses[id] !== 'skip').length

  // Generate MD export
  function generateExport() {
    const issues = ALL_ITEMS.filter(({ id }) => statuses[id] === 'fail' || statuses[id] === 'needs-work')
    if (!issues.length) {
      setExportMd('No failed or needs-work items yet.')
      return
    }
    const lines: string[] = [
      '# View1 Sort — QA Fix List',
      `Generated: ${new Date().toISOString().split('T')[0]}`,
      `Issues: ${issues.length}`,
      '',
      '---',
      '',
    ]
    issues.forEach((item, i) => {
      const status = statuses[item.id] === 'fail' ? '🔴 FAIL' : '🟡 NEEDS WORK'
      const group = GROUPS.find((g) => g.items.some((it) => it.id === item.id))
      lines.push(`## Issue ${i + 1}: ${item.label}`)
      lines.push(`**Status:** ${status}  `)
      if (item.path) lines.push(`**Location:** \`${item.path}\`  `)
      lines.push(`**Group:** ${group?.emoji} ${group?.title}  `)
      lines.push(`**Hint:** ${item.hint}  `)
      if (notes[item.id]) {
        lines.push('')
        lines.push(`**Notes:** ${notes[item.id]}`)
      }
      lines.push('')
      lines.push('**Fix Prompt:**')
      lines.push(`> Fix the following issue in View1 Sort: **${item.label}**${item.path ? ` (${item.path})` : ''}.`)
      if (notes[item.id]) lines.push(`> ${notes[item.id]}`)
      lines.push(`> Make the fix minimal and targeted. Do not change unrelated code.`)
      lines.push('')
      lines.push('---')
      lines.push('')
    })
    setExportMd(lines.join('\n'))
  }

  function copyMd() {
    navigator.clipboard.writeText(exportMd).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function clearAll() {
    if (!confirm('Clear all saved stress test data?')) return
    ALL_ITEMS.forEach(({ id }) => {
      localStorage.removeItem(LS + 'status_' + id)
      localStorage.removeItem(LS + 'note_' + id)
    })
    setStatuses({})
    setNotes({})
    setExportMd('')
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: total, color: 'text-blue-400' },
          { label: 'Passed', value: pass, color: 'text-emerald-400' },
          { label: 'Failed', value: fail, color: 'text-red-400' },
          { label: 'Needs Work', value: needs, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-center">
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-[11px] text-white/30 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-[11px] text-white/30 mb-1">
          <span>Progress</span>
          <span>{tested}/{total} tested</span>
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-500 transition-all"
            style={{ width: `${total ? (tested / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Persona headers */}
      <PersonaHeader type="photographer" />

      {/* Groups */}
      {GROUPS.map((group, gi) => {
        const groupStatuses = group.items.map(({ id }) => statuses[id])
        const groupPass = groupStatuses.filter((s) => s === 'pass').length
        const groupTotal = group.items.length
        const isOpen = !!open[group.id]

        // Insert client persona header before group 10
        const showClientHeader = group.id === 'cauth'

        return (
          <div key={group.id}>
            {showClientHeader && <PersonaHeader type="client" />}

            <div className="mb-2">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-all text-left"
              >
                <span className="text-sm font-bold text-white/85">
                  {group.emoji} {group.title}
                </span>
                <span className="flex items-center gap-3">
                  <span className={`text-[11px] font-mono ${groupPass === groupTotal ? 'text-emerald-400' : 'text-white/30'}`}>
                    {groupPass}/{groupTotal}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 text-white/30 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    strokeWidth={2}
                  />
                </span>
              </button>

              {/* Group items */}
              {isOpen && (
                <div className="border border-t-0 border-white/[0.06] rounded-b-xl overflow-hidden">
                  {group.items.map((item) => (
                    <Item
                      key={item.id}
                      item={item}
                      status={statuses[item.id] ?? ''}
                      note={notes[item.id] ?? ''}
                      onStatus={(v) => setStatus(item.id, v)}
                      onNote={(v) => setNote(item.id, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Export section */}
      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 mb-4">
          <Bug className="h-4 w-4 text-red-400" strokeWidth={1.75} />
          <span className="text-sm font-bold text-white/80">Export Fix List</span>
          <span className="text-[10px] text-white/30 ml-1">
            {[...Object.values(statuses)].filter((s) => s === 'fail' || s === 'needs-work').length} issues
          </span>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={generateExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-pink-500 to-violet-500 hover:opacity-90 transition-opacity"
          >
            <Download className="h-3.5 w-3.5" />
            Generate Fix List MD
          </button>
          {exportMd && (
            <button
              onClick={copyMd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70 bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.10] transition-all"
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          )}
          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-xl text-sm font-medium text-red-400/70 bg-red-500/[0.07] border border-red-500/20 hover:bg-red-500/[0.12] transition-all"
          >
            Clear All Data
          </button>
        </div>

        {exportMd && (
          <pre className="mt-4 p-4 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] text-white/50 font-mono whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
            {exportMd}
          </pre>
        )}
      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

function PersonaHeader({ type }: { type: 'photographer' | 'client' }) {
  const isPhoto = type === 'photographer'
  return (
    <div className={[
      'flex items-center gap-3 px-4 py-3 rounded-xl mb-4',
      isPhoto
        ? 'bg-violet-500/10 border border-violet-500/20'
        : 'bg-emerald-500/10 border border-emerald-500/20',
    ].join(' ')}>
      <span className="text-2xl">{isPhoto ? '📷' : '🖼'}</span>
      <div>
        <div className="text-sm font-bold text-white">
          {isPhoto ? 'Persona A — The Photographer' : 'Persona B — The Client'}
        </div>
        <div className="text-[11px] text-white/40 mt-0.5">
          {isPhoto
            ? 'You are Sarah, a wedding photographer. Test every workflow from onboarding to getting paid.'
            : 'You are Alex, a wedding client. Test gallery viewing, checkout, contract signing, and edit requests.'}
        </div>
      </div>
    </div>
  )
}

const STATUS_OPTS: { value: Status; label: string }[] = [
  { value: '', label: '— untested' },
  { value: 'pass', label: '✓ Pass' },
  { value: 'fail', label: '✗ Fail' },
  { value: 'needs-work', label: '⚠ Needs Work' },
  { value: 'skip', label: '— Skip' },
]

const STATUS_STYLES: Record<string, string> = {
  '':           'bg-white/[0.05] text-white/40 border-white/[0.10]',
  pass:         'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  fail:         'bg-red-500/15 text-red-400 border-red-500/30',
  'needs-work': 'bg-amber-500/12 text-amber-400 border-amber-500/25',
  skip:         'bg-white/[0.03] text-white/25 border-white/[0.06]',
}

function Item({
  item,
  status,
  note,
  onStatus,
  onNote,
}: {
  item: STItem
  status: Status
  note: string
  onStatus: (v: Status) => void
  onNote: (v: string) => void
}) {
  const showNote = status === 'fail' || status === 'needs-work'

  return (
    <div className="px-4 py-3 border-b border-white/[0.04] last:border-0 bg-white/[0.01]">
      <div className="flex items-start gap-3">
        {/* Label */}
        <div className="flex-1 min-w-0">
          <span className="text-[12px] text-white/80 leading-relaxed">{item.label}</span>
          {item.path && (
            <code className="ml-2 text-[10px] text-blue-400 bg-blue-400/[0.08] px-1.5 py-0.5 rounded font-mono">
              {item.path}
            </code>
          )}
          <div className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{item.hint}</div>
        </div>

        {/* Status select */}
        <select
          value={status}
          onChange={(e) => onStatus(e.target.value as Status)}
          className={[
            'flex-shrink-0 appearance-none rounded-lg border text-[11px] font-medium px-2 py-1.5 cursor-pointer outline-none transition-all',
            STATUS_STYLES[status] ?? STATUS_STYLES[''],
          ].join(' ')}
        >
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Note textarea */}
      {showNote && (
        <textarea
          value={note}
          onChange={(e) => onNote(e.target.value)}
          placeholder="Describe the issue or observation…"
          rows={2}
          className="mt-2 w-full rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/70 placeholder-white/20 px-3 py-2 resize-none outline-none focus:border-white/20 font-sans"
        />
      )}
    </div>
  )
}
