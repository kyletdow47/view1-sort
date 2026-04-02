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
- [x] DashboardV2 hardcoded hex colors — migrated ~130 instances across 18 files to CSS variable tokens (--chart-*, --brand-*) and Tailwind semantic classes. themes/page.tsx left as-is (swatch data). A few theme-preset bg values (#f5f3f0, #1a1a1a, #1d1916) left as unique light-mode swatches.
- [x] Upload progress bar — onProgress callback now captures bytesTotal from tus and updates fileSize in store for accurate progress %.
- [x] Media card drag-and-drop — removed non-functional drag handle from MediaCard; added TouchSensor with activation constraints to InvoiceBuilder for mobile support.

## Session Budget
Window:             Manual session (2026-04-02)
Started:            now
Resets:             —
Auto-resume:        —
Tasks done:         3
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
