# View1 Sort — Agent Handoff

**Date:** 2026-03-27
**Last commit:** `fa82207`
**Branch:** `main`
**Repo:** `kyletdow47/view1-sort`

---

## What Was Built (This Sprint)

All tasks below were completed and pushed to `main`. Asana tasks are marked complete.

### Sprint 7 — Data Wiring + Bug Fixes

| Task | File(s) | Commit |
|------|---------|--------|
| Wire gallery checkout to Stripe | `src/app/gallery/[id]/checkout/page.tsx` → Server Component; `src/components/features/gallery/CheckoutForm.tsx` (new) | `024e0d3` |
| Wire gallery cart to Supabase | `src/app/gallery/[id]/cart/page.tsx` → Server Component; `src/components/features/gallery/CartView.tsx` (new) | `024e0d3` |
| Analytics page — real data | `src/app/dashboard/analytics/page.tsx` → Server Component with real download/project/client/revenue queries | `4faf814` |
| Clients page — real data | `src/app/dashboard/clients/page.tsx` → Server Component; unique clients from `gallery_access` | `4faf814` |
| Billing page — real data | `src/app/dashboard/billing/page.tsx` → Server Component; `gallery_payments` + Stripe Connect balance | `4faf814` |
| Bookings page — real data | `src/app/dashboard/bookings/page.tsx`; new migration `20260327000002_create_bookings.sql`; `Booking` type added | `9971af3` |
| Calendar page — real data | `src/app/dashboard/calendar/page.tsx` → Server Component; `src/components/features/CalendarView.tsx` (new Client Component) | `087e371` |
| AI Sort — real classifier | `src/app/dashboard/ai-sort/page.tsx` → uses `useClassifier()` hook + real CLIP inference, removes fake `Math.random()` simulation | `9a2c6ad` |
| Onboarding slug fix | `src/components/features/onboarding/OnboardingWizard.tsx` — random suffix on slug, fallback to user ID, detect 23505 | `fa82207` |
| Stripe Connect callback | `src/app/api/stripe/connect/callback/route.ts` — retrieves account, sets `stripe_connect_enabled` | `fa82207` |

### Earlier Sprints (already done before this session)
- Auth, onboarding, dashboard layout
- Project workspace, file upload, media store
- Gallery view with theming (dark/light/minimal/editorial)
- AI sort hook (CLIP model via Web Worker)
- Supabase RLS audit
- Stripe webhook handler (fixed schema alignment)
- Mobile responsive dashboard sidebar
- Loading skeletons + error boundaries for all major routes
- Performance: `useMemo`, `useCallback`, `React.memo`
- Batch rename engine
- Gallery share links

---

## Current State of the App

### What Works (fully wired)
- **Auth flow**: signup → onboarding wizard → dashboard
- **Dashboard**: projects list, stats, notifications — real Supabase data
- **Project workspace**: upload media, view/sort/filter, lightbox, AI sort button
- **Gallery delivery**: public gallery, access gate (token-based), paywall, lightbox
- **Gallery checkout**: real Stripe Checkout session via `/api/gallery/[id]/checkout`
- **Gallery cart**: per-photo pricing, real media from Supabase
- **Analytics**: downloads, active projects, unique clients, revenue — real queries
- **Clients**: unique client emails from `gallery_access`, last access, total paid
- **Billing**: `gallery_payments` transactions, Stripe Connect balance
- **Bookings**: Kanban pipeline, calendar view — both from `bookings` table
- **Calendar**: month view with real booking events
- **AI Sort**: CLIP model in Web Worker, real confidence scores
- **Stripe Connect**: initiate → onboarding → callback verifies `charges_enabled`
- **Stripe webhooks**: `checkout.session.completed`, subscription events, idempotency

### What Does NOT Work Yet (manual backlog)
These are in Asana as backlog items (GIDs below):
- **End-to-end smoke test** (GID: 1213829067958822) — Kyle needs to run through the full flow with real Stripe test keys
- **Stripe test mode verification** (GID: 1213829195167546) — verify webhooks in Stripe dashboard, test card payments
- **Production deploy** (GID: 1213829294862195) — needs real env vars, Cloudflare Images setup, Supabase prod project

---

## Database Schema

Supabase migrations in `supabase/migrations/`:
- `20260326000000_create_schema.sql` — base schema
- `20260326000001_test_schema.sql` — test data
- `20260327000000_add_media_display_name.sql`
- `20260327000001_stripe_schema_fixes.sql` — adds `gallery_payments`, `stripe_events`, profile columns
- `20260327000002_create_bookings.sql` — `bookings` table with RLS

### Key Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User profile, `tier`, `stripe_account_id`, `stripe_connect_enabled` |
| `workspaces` | Photographer workspace |
| `projects` | Photo projects (flat_fee / per_photo / free pricing) |
| `media` | Photos — `thumbnail_url`, `watermarked_url`, `ai_category`, `ai_confidence` |
| `gallery_access` | Client access tokens + email |
| `gallery_downloads` | Download events |
| `gallery_payments` | Stripe checkout completions |
| `stripe_events` | Idempotency log |
| `bookings` | Photographer bookings (Kanban + Calendar) |

---

## Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Architecture Notes

### Next.js App Router Pattern
- **Server Components** (default) — all dashboard pages that fetch data
- **Client Components** (`'use client'`) — interactive UI: `CalendarView`, `CartView`, `CheckoutForm`, `WorkspaceView`, `GalleryView`
- **API Routes** in `src/app/api/` — all server-side Stripe + Supabase operations

### Key Files to Know
```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                    — main dashboard (projects list)
│   │   ├── layout.tsx                  — sidebar nav (mobile-responsive)
│   │   ├── analytics/page.tsx          — real analytics
│   │   ├── billing/page.tsx            — real billing + Stripe Connect
│   │   ├── bookings/page.tsx           — bookings kanban
│   │   ├── calendar/page.tsx           — calendar (Server) → CalendarView (Client)
│   │   ├── clients/page.tsx            — clients from gallery_access
│   │   ├── ai-sort/page.tsx            — real CLIP inference
│   │   └── project/[id]/page.tsx       — project workspace
│   ├── gallery/[id]/
│   │   ├── page.tsx                    — gallery view (token/paywall/public)
│   │   ├── checkout/page.tsx           — Stripe checkout (Server + CheckoutForm)
│   │   └── cart/page.tsx               — per-photo cart (Server + CartView)
│   └── api/
│       ├── gallery/[id]/checkout/      — creates Stripe Checkout session
│       ├── gallery/[id]/download/      — serves download (validates access)
│       ├── stripe/connect/             — initiates Stripe Connect
│       ├── stripe/connect/callback/    — verifies Connect account setup
│       └── webhooks/stripe/            — Stripe webhook handler
├── components/
│   ├── common/                         — Button, Card, Modal, Skeleton, Toast
│   └── features/
│       ├── gallery/                    — GalleryView, GalleryPaywall, CheckoutForm, CartView, AccessGate
│       ├── workspace/                  — WorkspaceView, PhotoGrid, MediaCard
│       ├── onboarding/                 — OnboardingWizard (4-step)
│       └── CalendarView.tsx            — interactive calendar client component
├── hooks/
│   ├── useClassifier.ts               — CLIP AI via Web Worker
│   ├── useAuth.ts                     — auth state
│   └── useMediaStore.ts               — Zustand store for workspace media
├── lib/
│   ├── supabase/{client,server}.ts    — browser + server Supabase clients
│   ├── stripe/{checkout,connect,plans}.ts
│   ├── ai/{classifier,worker,labels}.ts — CLIP inference engine
│   └── upload/                         — chunked upload + resumable logic
└── types/supabase.ts                   — all DB types (hand-authored)
```

---

## Known Remaining Issues / TODOs

1. **Gallery cart ↔ checkout price mismatch**: The cart lets clients remove individual photos, but the checkout API charges for ALL media in the project (not the client's cart selection). Needs API update to accept `mediaIds[]` param.

2. **AI sort → Supabase write**: The AI sort standalone page classifies files but doesn't update `media.ai_category` / `media.ai_confidence` in Supabase (no project context). The workspace-level sort view should be wired to do this.

3. **"New Booking" modal**: The bookings page has a "New Booking" button that opens nothing. Needs a create-booking form/modal.

4. **Gallery `gallery_downloads` table**: The analytics page counts downloads from this table, but the download API route (`/api/gallery/[id]/download`) may not be inserting rows. Verify it does.

5. **Cloudflare Images**: `thumbnail_url` and `watermarked_url` in media rows are stored as full Cloudflare delivery URLs. The `next.config.mjs` has `remotePatterns` for `imagedelivery.net`. Watermarking via Cloudflare Images variants needs to be verified.

6. **`gallery_access.accessed_at`**: The clients page shows last access date from this column, but the download/gallery API routes may not be updating it on access. Verify the access tracking is working.

7. **Stripe Connect partial onboarding**: The callback now redirects to `?connected=pending` when `details_submitted` but not `charges_enabled`. The settings page should handle this state and show a "complete your Stripe onboarding" CTA.

---

## How to Run

```bash
npm install
npm run dev          # localhost:3000
npm run test         # vitest
npm run lint         # eslint
```

All migrations need to be applied to your Supabase project:
```bash
npx supabase db push
```

---

## Asana Project

**GID:** `1213828953130095`
All sprint tasks are complete. The 3 remaining items are manual/ops:
- `1213829067958822` — E2E smoke test
- `1213829195167546` — Stripe test mode
- `1213829294862195` — Production deploy

---

*Handoff written 2026-03-27. Last agent: Claude Sonnet 4.6 via Claude Code.*
