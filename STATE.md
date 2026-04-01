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
- [ ] Auth flow
- [ ] Upload pipeline — tus + IndexedDB
- [ ] AI classifier — SigLIP Web Worker (src/lib/ai/classifier.worker.ts)
- [ ] Stripe billing + Connect
- [ ] Email (Resend)
- [ ] PWA

### 12-Page App Architecture (see docs/strategy/APP-ARCHITECTURE.html)
- [ ] Dashboard page — AI briefing, stat cards, quick actions, week calendar
- [ ] Projects page — filter bar, project cards, AI prompt creation
- [ ] AI Workspace page — scene tabs, review modes, shot list
- [ ] Gallery Builder page — AI curation, themes, slideshow, print store
- [ ] Booking page — packages, inquiry inbox, availability calendar
- [ ] Clients & CRM page — Kanban pipeline, client profiles, workflow automation
- [ ] Contracts page — AI generator, questionnaires
- [ ] Finances page — revenue dashboard, invoicing, income reports
- [ ] Analytics page — AI business intelligence, gallery metrics
- [ ] Content Hub page — social media calendar, post creator, AI captions
- [ ] Client Portal page — gallery viewer, selections, comments
- [ ] Settings page — AI workspace setup wizard, branding, integrations

## Currently Broken (fix before new features)
- DashboardV2 has hardcoded hex colors — MUST migrate to CSS variable tokens BEFORE design-extractor runs. grep src/app/dashboard/ for #[0-9a-fA-F], replace with var(--color-*) or Tailwind tokens, commit as "chore: migrate dashboard hardcoded colors to tokens"
- upload progress bar does not reflect real tus progress
- media card drag-and-drop crashes on mobile

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
