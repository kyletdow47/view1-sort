# view1-sort STATE
Last updated: 2026-04-01 by setup-agents.sh (agent system install)
Mode: STANDBY

## Schedule
Build window: 10pm–8am
Current mode: standby — run coordinator to begin

## Build Progress

### Phase 1 — Core (in progress)
- [x] Supabase schema — all tables + migrations (7 migration files)
- [x] Auth flow — Supabase Auth (login, signup, reset, magic-link, OAuth callback)
- [x] Project creation + preset selection
- [x] Upload pipeline — tus resumable + IndexedDB queue + progress tracking
- [x] AI classifier — Web Worker (src/lib/ai/) + presets + labels
- [x] Photographer workspace UI — dashboard, projects, ai-sort wizard
- [x] Client gallery — src/app/gallery/ + delivery
- [x] Stripe billing + Connect — plans, checkout, connect, identity
- [x] Email (Resend) — src/lib/email/ + templates
- [x] Notifications — src/lib/notifications.ts
- [x] Landing page — pixel-perfect from Pencil design
- [x] Onboarding wizard — src/app/onboarding/
- [ ] PWA — manifest.ts exists, service worker incomplete
- [ ] Analytics dashboard — src/app/dashboard/analytics/ scaffolded, not wired
- [ ] Booking system — src/app/dashboard/booking-forms/ + book/ scaffolded
- [ ] Contracts — src/app/dashboard/contracts/ scaffolded
- [ ] On-set mode — src/app/on-set/ scaffolded

### Open PRs
- PR #7: [jarvis] Scroll-linked video background + 3D ScrollCard — resolved rebase of PR #4 on current main (open, awaiting Vercel CI)

## Currently Broken (fix before new features)
- 3 pre-existing test failures: share.test.ts (toStartWith), waitlist/route.test.ts (mock mismatch), webhooks/stripe/route.test.ts (mock response) — Asana GID 1213991942226801
- Landing page scroll sections render black after hero — PR #7 scroll-linked video bg covers downstream content — Asana GID 1213991992303028
- AI Sort "Run AI Sort" button is a setTimeout stub (AIWorkspaceView.tsx:119) — CLIP classifier never actually runs — Asana GID 1213991942293079
- Manual re-categorization drag-drop not wired to DB — CategoryColumn.tsx has TODO comment — Asana GID 1213991987294981
- Star/flag/keep/reject handlers are all TODO stubs (AIWorkspaceView.tsx:147-160) — Asana GID 1213991921072634
- Upload progress bar may not reflect real tus progress (verify against live)
- Media card drag-and-drop on mobile — not confirmed working

## Session Budget
Window:             Not started
Started:            —
Resets:             —
Auto-resume:        —
Tasks done:         0
Avg tokens/task:    — (update every 3 tasks)
% window remaining: 100%
Tasks fit:          unknown
Budget mode:        NORMAL
Weekly cap:         OK

## Pending Design Questions (for morning send)
None — run design-extractor on .pen files in project root first

## Pencil Changes Detected Tonight
None yet — coordinator will run git diff on .pen files at 10pm startup

## Asana Tasks Generated from Pencil
Run task-sync at session start to pull from asana-tasks.csv + SPEC.md

## Browser Test Results
Not run — run /test to launch browser-tester against https://photo-sorter-theta.vercel.app

## Security Notes
- RLS recursion fix committed (fix(rls): resolve infinite recursion in workspace/workspace_members)
- No outstanding CRITICAL or HIGH findings on record

## Tonight's Instructions (from you)
None — add TONIGHT: [instruction] via Telegram to queue instructions before 10pm

## Operator Notes
- Vercel production URL: https://photo-sorter-theta.vercel.app
- GitHub repo: https://github.com/kyletdow47/view1-sort
- 74 commits on main as of 2026-04-01
- asana-tasks.csv + asana-pilot-tasks.csv present in repo root — task-sync should seed Asana from these
