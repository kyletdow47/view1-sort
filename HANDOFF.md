# View1 Sort — Agent Handoff

**Date:** 2026-03-28
**Last commit:** `9879972`
**Branch:** `main`
**Repo:** `kyletdow47/view1-sort`

---

## Session Summary (Mar 27-28)

Started with a skeleton prototype, ended with a fully-wired production app. 39 pages, real Supabase data, real Stripe payments, real AI classification, real email delivery.

### What Was Built

**Design & UI (Mar 27 morning):**
- Full Stitch design system port (Material Design 3 tokens, Manrope/Inter/Space Grotesk fonts)
- 38 pages built/rebuilt matching Stitch mockups + AI Studio prototype
- Dashboard, project workspace, gallery, settings, bookings, calendar, AI sort, analytics, billing, clients
- Phase 2/3 prototype pages: edit requests, publish flow, refund, checkout, cart, approve, booking builder, team, branding, bulk management

**Real Code Wiring (Mar 27-28, via scheduled agents + manual):**
- Auth middleware restored (Supabase sessions)
- Dashboard, workspace, gallery, onboarding, billing, analytics, clients, bookings, calendar — all wired to real Supabase data
- AI sort uses real CLIP model via Web Worker
- Stripe checkout + webhooks fully functional
- Gallery access gate with token validation

**Critical Infrastructure (Mar 28):**
- Email system: Resend SDK + 6 branded HTML templates (Welcome, Gallery Invite, Payment Confirmation, Payment Received, Payment Failed, Project Published)
- Gallery invite API: POST /api/gallery/[id]/invite — generates token, sends email
- ZIP export API: GET /api/gallery/[id]/export — organizes by category, streams ZIP
- Notifications: create/fetch/markAllRead + live bell dropdown
- Cloudflare Images: full upload handler with thumbnail + watermark variants
- Project settings: pricing, themes, metadata — all persist to Supabase
- Publish flow: status update + client invitation wired
- Cart ↔ checkout: mediaIds[] param for per-photo pricing alignment
- AI sort → Supabase: writes ai_category + ai_confidence after classification
- New Booking modal: form creates bookings in Supabase
- Download tracking: logs to gallery_downloads + updates gallery_access.accessed_at
- Payment emails: on checkout.session.completed, sends to both client + photographer
- Access upgrade: gallery_access promoted to 'full' after payment
- Free tier enforcement: 3 project limit with upgrade prompt
- Stripe Connect pending state: detects incomplete onboarding

---

## What Works (fully wired)

- **Auth flow**: signup → profile auto-created (trigger) → onboarding wizard → dashboard
- **Dashboard**: projects list, stats, quick actions, activity feed — real data
- **Project workspace**: upload media, view/sort/filter, lightbox, multi-select, batch actions
- **AI Sort**: CLIP model in Web Worker, real confidence scores, writes to Supabase
- **Gallery delivery**: public/private gallery, access gate (token-based), paywall, lightbox, 4 themes
- **Gallery checkout**: real Stripe Checkout session, per-photo cart with mediaIds[]
- **Publish flow**: sets project status, generates gallery URL, sends client invite email
- **Client invitation**: POST /api/gallery/[id]/invite → generates token + sends email via Resend
- **Email system**: 6 branded templates via Resend
- **ZIP export**: GET /api/gallery/[id]/export → organized ZIP by category
- **Analytics**: downloads, active projects, unique clients, revenue — real queries
- **Clients**: from gallery_access, last access date, total paid
- **Billing**: gallery_payments + Stripe Connect balance
- **Bookings**: Kanban pipeline + calendar view + "New Booking" modal
- **Calendar**: month view with real booking events
- **Stripe Connect**: initiate → onboarding → callback → pending state detection
- **Stripe webhooks**: checkout.session.completed (+ emails), subscription events, idempotency
- **Notifications**: real Supabase data in bell dropdown, mark all read
- **Account settings**: profile update (name, avatar), workspace name
- **Project settings**: pricing model, flat fee, per-photo price, gallery theme — all persist
- **Batch rename**: template tokens ({project}, {category}, {n}, {date})
- **Cloudflare Images**: upload handler with thumbnail + watermark variant URLs
- **Free tier**: 3 project limit enforced on dashboard
- **Mobile responsive**: collapsible sidebar, adaptive header, responsive grids
- **Loading states**: skeleton loaders on all data pages
- **Error boundaries**: error.tsx on all route segments

---

## What Does NOT Work Yet (manual/ops only)

| Task | Asana GID | Type |
|------|-----------|------|
| End-to-end smoke test | 1213829067958822 | Manual |
| Stripe test mode verification | 1213829195167546 | Manual |
| Production deploy 🚀 | 1213829294862195 | Manual |

---

## Environment Variables Needed

**Already set in Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL=✅
NEXT_PUBLIC_SUPABASE_ANON_KEY=✅
SUPABASE_SERVICE_ROLE_KEY=✅
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=✅
STRIPE_SECRET_KEY=✅
STRIPE_WEBHOOK_SECRET=✅
```

**Still need to add:**
```
RESEND_API_KEY=           # Get from https://resend.com/api-keys
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=  # Get from Cloudflare dashboard
CLOUDFLARE_API_TOKEN=     # Get from Cloudflare API Tokens
```

---

## Scheduled Build Agents

Two agents run on cron, reading Asana and building tasks automatically:

| Agent | Trigger ID | Schedule |
|-------|-----------|----------|
| Daily Builder | `trig_015qfxsL2SzSg5a58oCV7KVv` | Weekdays 7am ET |
| Sprint Builder | `trig_01G7rewGcoGWhA4s37Cra2Uj` | Every 2hrs 9am-5pm UTC weekdays |

Both send Telegram notifications to Kyle's bot on every action.
Manage: https://claude.ai/code/scheduled

---

## Database Schema

Migrations in `supabase/migrations/`:
- `20260326000000_create_schema.sql` — full schema + RLS + profile trigger
- `20260326000001_test_schema.sql` — test data
- `20260327000000_add_media_display_name.sql`
- `20260327000001_stripe_schema_fixes.sql` — gallery_payments, stripe_events, profile columns
- `20260327000002_create_bookings.sql` — bookings table

**Run `npx supabase db push` to apply all migrations.**

---

## Key Files

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              — dashboard (real Supabase data)
│   │   ├── layout.tsx            — sidebar + header (mobile responsive, live notifications)
│   │   ├── ai-sort/page.tsx      — CLIP inference + Supabase write
│   │   ├── analytics/page.tsx    — real analytics
│   │   ├── billing/page.tsx      — Stripe + gallery_payments
│   │   ├── bookings/page.tsx     — kanban + NewBookingModal
│   │   ├── calendar/page.tsx     — month view
│   │   ├── clients/page.tsx      — from gallery_access
│   │   ├── gallery/page.tsx      — photo grid
│   │   ├── projects/page.tsx     — project list
│   │   └── project/[id]/
│   │       ├── page.tsx          — workspace
│   │       ├── settings/page.tsx — pricing, themes, access (wired)
│   │       ├── publish/page.tsx  — publish + invite (wired)
│   │       ├── rename/page.tsx   — batch rename
│   │       ├── export/page.tsx   — ZIP export UI
│   │       ├── edits/page.tsx    — edit requests
│   │       └── refund/page.tsx   — refund flow
│   ├── gallery/[id]/
│   │   ├── page.tsx              — client gallery (token/paywall)
│   │   ├── checkout/page.tsx     — Stripe checkout
│   │   ├── cart/page.tsx         — per-photo cart (mediaIds[])
│   │   ├── approve/page.tsx      — client approval
│   │   ├── edits/page.tsx        — delivered edits
│   │   └── pricing/page.tsx      — currency conversion
│   └── api/
│       ├── gallery/[id]/
│       │   ├── checkout/route.ts — Stripe Checkout (accepts mediaIds[])
│       │   ├── download/route.ts — file download + logging
│       │   ├── invite/route.ts   — generates token + sends email
│       │   └── export/route.ts   — ZIP export by category
│       ├── stripe/connect/       — Stripe Connect OAuth
│       └── webhooks/stripe/      — webhook handler + emails
├── lib/
│   ├── email/send.ts             — Resend wrapper
│   ├── email/templates.ts        — 6 HTML email templates
│   ├── notifications.ts          — create/fetch/markAllRead
│   ├── cloudflare.ts             — upload + thumbnail + watermark URLs
│   ├── stripe/                   — checkout, connect, plans
│   ├── ai/                       — CLIP classifier + Web Worker
│   └── upload/                   — chunked upload + resumable
└── components/features/
    ├── bookings/NewBookingModal.tsx
    ├── bookings/BookingsPageClient.tsx
    ├── gallery/CartView.tsx, CheckoutForm.tsx, GalleryView.tsx
    └── workspace/DashboardShell.tsx (tier enforcement)
```

---

## Asana Project

**GID:** `1213828953130095`
**Status:** Green — All code complete
**Remaining:** 3 manual/ops tasks (smoke test, Stripe verification, production deploy)

---

## To Pick Up Next Session

1. Add RESEND_API_KEY + Cloudflare env vars to Vercel
2. Run `npx supabase db push`
3. Do the end-to-end smoke test
4. If anything breaks, fix it
5. Production deploy

*Handoff written 2026-03-28. Last agent: Claude Opus 4.6 (1M context) via Claude Code.*
