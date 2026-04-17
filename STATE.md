# view1-sort STATE
Last updated: SETUP by setup-agents.sh
Mode: STANDBY

## Schedule
Build window: 10pm–8am
Current mode: standby — run coordinator to begin

## Build Progress
### Foundation
- [x] Supabase schema — all 11 existing tables
- [x] Project creation + preset selection
- [ ] DB migration — 17 new tables (see ARCHITECTURE-DECISIONS.md §Decision 8)
- [x] Auth flow (client portal) — /auth/client-login, /auth/client-callback, /api/invitations, middleware /client protection (branch feat/design-to-dev/client-portal-auth)
- [ ] Upload pipeline — tus + IndexedDB
- [ ] AI classifier — SigLIP Web Worker (src/lib/ai/classifier.worker.ts)
- [ ] Stripe billing + Connect
- [ ] Email (Resend)
- [ ] PWA

### 12-Page App Architecture (see docs/strategy/APP-ARCHITECTURE.html)
- [ ] Dashboard page — AI briefing, stat cards, quick actions, week calendar
- [x] Projects page — filter bar, project cards, AI prompt creation (branch: feat/design-to-dev/projects-page)
- [x] AI Workspace page — scene tabs, review modes, shot list (branch: feat/design-to-dev/ai-workspace-projects-route)
- [x] AI Sort Vibe Presets Tab — NL style presets, AI extraction, before/after apply (branch: feat/design-to-dev/ai-sort-vibe-presets-tab)
- [x] Gallery Builder page — split-panel builder with photo selector, themes, watermark, access controls (branch: feat/design-to-dev/gallery-builder, PR #24)
- [x] Booking page — packages, inquiry inbox, availability calendar (branch: feat/design-to-dev/bookings-pipeline)
- [x] Bookings Photo Page Builder — WYSIWYG editor tab with drag-to-reorder sections, hero upload, portfolio, testimonials, contact form, custom domain, SEO (branch: feat/design-to-dev/bookings-photo-page-builder, commit 94c8cf7)
- [x] Calendar page — 4-view calendar with drag-reschedule, event creation, URL-view persistence (branch: feat/design-to-dev/calendar-page)
- [ ] Clients & CRM page — Kanban pipeline, client profiles, workflow automation
- [x] Contracts page — AI generator, questionnaires (branch: feat/design-to-dev/contracts-documents-page)
- [ ] Finances page — revenue dashboard, invoicing, income reports
- [ ] Analytics page — AI business intelligence, gallery metrics
- [ ] Content Hub page — social media calendar, post creator, AI captions
- [ ] Client Portal page — gallery viewer, selections, comments
- [ ] Settings page — AI workspace setup wizard, branding, integrations

## Currently Broken (fix before new features)
- [x] DashboardV2 hardcoded hex colors — migrated ~130 instances across 18 files to CSS variable tokens (--chart-*, --brand-*) and Tailwind semantic classes. themes/page.tsx left as-is (swatch data). A few theme-preset bg values (#f5f3f0, #1a1a1a, #1d1916) left as unique light-mode swatches.
- [x] Upload progress bar — onProgress callback now captures bytesTotal from tus and updates fileSize in store for accurate progress %.
- [x] Media card drag-and-drop — removed non-functional drag handle from MediaCard; added TouchSensor with activation constraints to InvoiceBuilder for mobile support.
- [x] Notification bell/panel state race — useNotifications recreated its Supabase client every render, re-firing the fetch effect and transiently clearing `notifications` while the panel was open. Memoized with useMemo + added 5 regression tests. PR #49 (branch feat/dev-agent/notification-badge-empty-panel, Asana 1213998715323386).
- [x] Gallery hero "Create Gallery" button — migrated bg-indigo-500 to brand bg-cta gradient to match GalleryEmptyState. PR #51 (branch feat/dev-agent/gallery-button-consistency, Asana 1213998502806329). The other three fixes in that task (empty state, tab active style, NOTE removal) already landed in PR #46.

## Completed Builds
| Timestamp (ISO) | Task ID | Branch | PR | Files changed |
|---|---|---|---|---|
| 2026-04-17T06:55Z | 1213998502806329 | feat/dev-agent/gallery-button-consistency | [#51](https://github.com/kyletdow47/view1-sort/pull/51) | 1 |

## Session Budget
Window:             Manual session (2026-04-02)
Started:            now
Resets:             —
Auto-resume:        —
Tasks done:         16
Avg tokens/task:    — (update every 3 tasks)
% window remaining: 100%
Tasks fit:          3 fix tasks
Budget mode:        NORMAL
Weekly cap:         OK

## Pending Design Questions (for morning send)
None yet — run design-extractor on Pencil screens first

## Pencil Changes Detected Tonight
None yet

## Asana Tasks Generated from Pencil
None yet

## Browser Test Results
Not run yet

## Security Notes
None

## Tonight's Instructions (from you)
None

## Operator Notes
None
