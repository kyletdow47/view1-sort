# View1 Sort — MVP Roadmap

> Updated: March 26, 2026
> Goal: Deployable MVP where a photographer can upload, AI-sort, publish a gallery, and get paid.

---

## Current State

The codebase has **real, production-ready code** for most of the stack, plus a **skeleton UI layer** (static mocks) deployed for prototyping. The MVP path is about reconnecting the real code to the skeleton pages, filling two gaps, and polishing the end-to-end flow.

### What's Real (production code exists)
| Area | Status | Details |
|------|--------|---------|
| Supabase Schema | Done | 13 tables, RLS policies, triggers, indexes, auto-provisioning |
| Auth (Supabase) | Done | Email/password, Google OAuth, session management, useAuth hook |
| Upload Pipeline | Done | TUS resumable uploads, IndexedDB persistence, concurrent queue |
| AI Classification | Done | Xenova CLIP zero-shot, browser-side Web Worker, label taxonomy |
| Stripe Billing | Done | 3 tiers (Free/Pro/Business), checkout, billing portal, webhooks |
| Stripe Connect | Done | Express accounts, onboarding, PaymentIntents with app fees |
| Gallery Components | Done | GalleryView, Paywall, AccessGate, Lightbox — all functional |
| Zustand Stores | Done | mediaStore, projectStore, uploadStore with real logic |
| Workspace Components | Done | WorkspaceView (340 lines), DashboardShell, multi-select, filters |
| API Routes | Done | Waitlist, gallery access, checkout, verify-payment, Stripe webhooks |

### What's Skeleton (UI placeholder only)
| Area | Status | Details |
|------|--------|---------|
| Dashboard pages | Skeleton | Currently static mocks — real DashboardShell exists but disconnected |
| Project workspace | Skeleton | Mock photo grid — real WorkspaceView exists but disconnected |
| Settings pages | Skeleton | Account, Connect, Themes, Booking Forms — all placeholder |
| Gallery page | Skeleton | Mock gallery — real GalleryView exists but disconnected |
| Onboarding | Skeleton | Mock 4-step wizard — real OnboardingWizard exists but disconnected |
| Auth pages | Skeleton | Mock login/signup — real auth hook exists but disconnected |

### What's Missing (not built yet)
| Area | Status | Details |
|------|--------|---------|
| Email (Resend) | Not started | DB table exists, no send logic or templates |
| Cloudflare Images | Not started | URL builder only, no upload/transform/watermark pipeline |
| Notifications | Not started | DB table exists, no UI or creation logic |
| PWA | Not started | No manifest, service worker, or offline support |
| ZIP Export | Not started | No zip generation logic |
| Batch Rename | Not started | No rename template engine |

---

## MVP Sprint Plan

### Sprint 1: Reconnect Real Code (3-4 days)
**Goal:** Replace all skeleton mocks with the real components. App works end-to-end with Supabase.

- [ ] **Re-enable auth middleware** — restore Supabase session checks, redirect logic
- [ ] **Reconnect dashboard page** — swap mock back to server component with DashboardShell
- [ ] **Reconnect project workspace** — swap mock back to WorkspaceView with real media store
- [ ] **Reconnect gallery** — swap mock back to real GalleryView + AccessGate + Paywall
- [ ] **Reconnect auth pages** — restore useAuth hook in login/signup
- [ ] **Reconnect onboarding** — restore OnboardingWizard with Supabase profile creation
- [ ] **Reconnect billing page** — restore Supabase profile fetch + Stripe checkout
- [ ] **Wire sidebar layout** — integrate real user profile, notification count, project list into sidebar
- [ ] **Set Vercel env vars** — add all Supabase + Stripe keys to Vercel project settings
- [ ] **Smoke test** — signup → onboard → create project → upload → sort → publish → gallery view

### Sprint 2: Cloudflare Images + Upload Flow (2-3 days)
**Goal:** Photos display properly with thumbnails, watermarks, and responsive sizes.

- [ ] **Cloudflare Images upload** — after Supabase Storage upload, push to Cloudflare for transforms
- [ ] **Thumbnail generation** — auto-generate thumbnail variant on upload complete
- [ ] **Watermark overlay** — Cloudflare transform for preview-tier gallery access
- [ ] **Responsive image URLs** — serve correct size based on viewport (srcset)
- [ ] **Wire into MediaCard** — replace placeholder gradients with real Cloudflare image URLs
- [ ] **Wire into Gallery** — watermarked previews for unpaid, clean for paid/delivered

### Sprint 3: Email + Notifications (2 days)
**Goal:** Transactional emails work. Photographers see activity in their dashboard.

- [ ] **Resend SDK setup** — install, configure API key
- [ ] **Email templates** (react-email) — Welcome, Gallery Invitation, Project Published, Payment Confirmation, Payment Received, Payment Failed
- [ ] **Send triggers** — hook emails into signup, gallery invite, publish, and Stripe webhook handlers
- [ ] **Notification creation** — insert notification rows on key events (new booking, payment, gallery view)
- [ ] **Bell dropdown** — real notification list in sidebar header (fetch from notifications table)
- [ ] **Activity feed** — dashboard home shows recent notifications across projects

### Sprint 4: Gallery Publishing + Client Flow (2-3 days)
**Goal:** Full publish → invite → client views → client pays → client downloads flow.

- [ ] **Publish flow page** — connect real logic: set project status to 'published', generate gallery URL
- [ ] **Client invitation** — magic link email via Resend, create project_clients row
- [ ] **Gallery access resolver** — implement `resolve_gallery_access` RPC (check access level + payment status)
- [ ] **Download handler** — serve signed Supabase Storage URLs for authorized downloads
- [ ] **ZIP export** — generate organized ZIP (folders per category) for "Download All"
- [ ] **Gallery theme selection** — wire theme picker in project settings to projects.theme column
- [ ] **Public/private toggle** — wire gallery_public toggle in project settings

### Sprint 5: Settings + Polish (2-3 days)
**Goal:** Settings pages work. App feels complete.

- [ ] **Account settings** — real profile update (name, business name, avatar upload)
- [ ] **Stripe Connect page** — real onboarding flow, status display, payout info
- [ ] **Billing page** — reconnect to real Stripe (already has full logic, just needs env vars)
- [ ] **Theme selection page** — save to project, preview themes
- [ ] **Project settings page** — real metadata editing, preset selection, pricing config, client access
- [ ] **Batch rename** — implement template token engine ({property}, {category}, {n}, {date})
- [ ] **Keyboard shortcuts** — arrow keys, space select, s star, delete remove
- [ ] **Loading states** — skeleton loaders for all data-fetching pages
- [ ] **Empty states** — friendly prompts when no projects, no photos, no clients
- [ ] **Error boundaries** — catch and display errors gracefully
- [ ] **Mobile responsive** — pass on all pages (sidebar collapses, gallery grid adapts)

### Sprint 6: Testing + Launch Prep (2-3 days)
**Goal:** Confident enough to launch to first users.

- [ ] **End-to-end test** — full photographer journey: signup → onboard → upload → sort → publish → invite → pay → download
- [ ] **Stripe test mode** — verify all payment flows (subscription, gallery purchase, Connect payout)
- [ ] **Webhook testing** — simulate all Stripe events, verify DB updates
- [ ] **Security review** — RLS policies, no exposed secrets, signed URLs, CORS
- [ ] **Performance** — Lighthouse audit, image optimization, bundle size check
- [ ] **Landing page** — final copy, remove "Coming Soon" badge, update CTAs to "Get Started Free"
- [ ] **Domain setup** — connect custom domain on Vercel
- [ ] **Production env vars** — switch from test to live Stripe keys
- [ ] **Deploy** — production release

---

## Timeline Estimate

| Sprint | Duration | Dates (estimated) |
|--------|----------|-------------------|
| Sprint 1: Reconnect | 3-4 days | Mar 27-30 |
| Sprint 2: Images | 2-3 days | Mar 31 - Apr 2 |
| Sprint 3: Email | 2 days | Apr 3-4 |
| Sprint 4: Gallery Flow | 2-3 days | Apr 5-7 |
| Sprint 5: Settings + Polish | 2-3 days | Apr 8-10 |
| Sprint 6: Test + Launch | 2-3 days | Apr 11-13 |

**Total: ~14-19 working days → MVP launch mid-April 2026**

---

## Post-MVP (Phase 2)

These features have skeleton pages ready but are explicitly deferred:

- Public booking page (`/book/[photographerId]`)
- Booking forms (preset templates + custom fields)
- Deposit / balance payment flows
- Per-file download pricing + cart checkout
- Edit request workflow (6-status)
- Client profiles inside photographer dashboard
- Client "Approve & Complete" button
- Refund flow (full + partial)
- Currency conversion display
- PWA (offline viewing, installability)

---

## Key Dependencies

| Dependency | Needed By | Status |
|------------|-----------|--------|
| Supabase project credentials | Sprint 1 | Needs setup in Vercel env vars |
| Stripe test keys | Sprint 1 | Needs setup in Vercel env vars |
| Stripe Connect client ID | Sprint 4 | Needs Stripe dashboard config |
| Cloudflare Images account | Sprint 2 | Needs account + API token |
| Resend API key | Sprint 3 | Needs Resend account setup |
| Custom domain | Sprint 6 | TBD — purchase + DNS config |
