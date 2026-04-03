# View1 Sort — Build State Tracker

> This file is read and updated by the design-to-dev agent at every run.
> It serves as build memory — what's done, what's next, what broke, what was learned.

Last updated: 2026-04-03
Last agent run: 2026-04-03T11:17Z

## Priority Tiers (P0 = do first, P5 = do last)

| Tier | Label | Description |
|------|-------|-------------|
| P0 | Foundations | Shared layout, design system, dashboard — everything else depends on these |
| P1 | Core Product | Projects list, AI Workspace, AI Sort — the main product loop |
| P2 | Gallery & Delivery | Gallery builder, publish, client viewer, checkout — the delivery pipeline |
| P3 | Business Workflow | Clients, bookings, contracts, invoicing, calendar — revenue features |
| P4 | Enhancements | Settings, analytics, team, integrations — nice-to-haves for launch |
| P5 | Deferred | Content Hub — post-launch |

## Completed Builds

<!-- Format: - [page-name] — PR #XX — completed YYYY-MM-DD — notes -->
- Dashboard v2 — PR pending — completed 2026-04-03 — Responsive grid, quick actions bar, empty states, QuickStats CSS vars, glass-panel loading skeleton. Pencil frame jHMkx matched.
- Projects Page — branch feat/design-to-dev/projects-page — completed 2026-04-03 — Refined grid cards to match Pencil frame XBDLS: 3-col grid, 260px card height, rounded-[20px], hover action buttons, photo count badge, glass stat cards with top highlight, loading.tsx skeleton, error.tsx boundary. Push pending (no git creds in sandbox).
- AI Workspace Page — branch feat/design-to-dev/ai-workspace-projects-route — completed 2026-04-03 — Route /dashboard/projects/[id], Pencil frame I8wu6. 14 files, 1360 lines. Full tabbed workspace: ProjectHeader, TabBar (6 tabs), SubTabRow (Upload/Workspace/Preferences/Vibe Presets), CategoryColumns (4), AIAnalysisPanel, CullSliderBar, SelectionToolbar. Mock data for AI classifier. Push pending (no git creds in sandbox).


## Currently Building

None.

## Failed / Blocked

<!-- Format: - [page-name] — reason — date — what needs to happen -->
None.

## Build Decisions Log

<!-- Decisions made during builds that future runs need to know -->
<!-- Format: - YYYY-MM-DD: [decision] — [why] -->
- 2026-04-03: Initial build state file created. Priority tiers P0-P5 match Asana task name prefixes.
- 2026-04-03: Font conflict — PLAN.md says "Plus Jakarta Sans only" but CLAUDE.md says Inter + Geist Mono. Needs resolution from Kyle before building typography-heavy pages.
- 2026-04-03: Dashboard v2 QuickStats — replaced hardcoded hex gradient colors with CSS custom properties using var() with fallbacks (e.g., var(--chart-orange, #FF8E53)). Future pages should follow this pattern.
- 2026-04-03: Dashboard v2 uses mock data for upcomingShoots, revenueThisMonth, pendingActions — needs bookings and invoices DB tables to show real data.
- 2026-04-03: Dashboard v2 Quick Actions bar added per acceptance criteria — routes to /dashboard/projects?new=1, /dashboard/projects, /dashboard/gallery, /dashboard/finances?new-invoice=1.
- 2026-04-03: Git lock files (.git/HEAD.lock, .git/index.lock) were immutable on mounted filesystem — had to copy repo to /sessions/ working dir to commit. Future runs may hit same issue.
- 2026-04-03: Projects page already had full Supabase integration, grid/list views, search, filter, and new project modal. Only visual refinements needed to match Pencil — not a ground-up build.
- 2026-04-03: Git push requires credentials not available in sandbox. Branch created locally; needs manual push: `git push -u origin feat/design-to-dev/projects-page`
- 2026-04-03: Landing page is being handled by a separate session — do NOT pick up landing page tasks.
- 2026-04-03: AI Workspace SubTabRow updated to match Pencil — tabs are Upload/Workspace/Preferences/Vibe Presets (not Panoramas/Fit All/Keeps/Rejects). Action buttons are Approve All + Re-Sort (not Upload/Filter/Sort).
- 2026-04-03: TabBar icons updated to match Pencil — Review uses Eye icon (not CheckCircle), Details uses FileText (not Settings). Gallery label shortened from "Gallery Preview" to "Gallery".
- 2026-04-03: AI Workspace uses Geist font from Pencil design (not Inter per CLAUDE.md). Font conflict still unresolved — awaiting Kyle's decision.

## Shared Components Built

<!-- Track reusable components so later pages can import them instead of rebuilding -->
<!-- Format: - ComponentName — src/components/path — used by [pages] -->
- GlassPanel — src/components/features/dashboard-v2/GlassPanel.tsx — used by [Dashboard v2 widgets]
- TopNav — src/components/features/dashboard-v2/TopNav.tsx — used by [DashboardClientLayout]
- QuickActions — src/components/features/dashboard-v2/QuickActions.tsx — used by [Dashboard v2]
- ProgressRing — src/components/features/dashboard-v2/ProgressRing.tsx — used by [QuickStats]
- TodoPanel — src/components/features/dashboard-v2/TodoPanel.tsx — used by [TopNav]
- Skeleton — src/components/common/Skeleton.tsx — used by [loading states]
- AIWorkspaceView — src/components/features/AIWorkspace/AIWorkspaceView.tsx — used by [project detail page]
- ProjectHeader — src/components/features/AIWorkspace/ProjectHeader.tsx — used by [AIWorkspaceView]
- TabBar — src/components/features/AIWorkspace/TabBar.tsx — used by [AIWorkspaceView]
- SubTabRow — src/components/features/AIWorkspace/SubTabRow.tsx — used by [AIWorkspaceView]
- CategoryColumn — src/components/features/AIWorkspace/CategoryColumn.tsx — used by [AIWorkspaceView]
- AIAnalysisPanel — src/components/features/AIWorkspace/AIAnalysisPanel.tsx — used by [AIWorkspaceView]
- CullSliderBar — src/components/features/AIWorkspace/CullSliderBar.tsx — used by [AIWorkspaceView]
- WorkspaceSelectionToolbar — src/components/features/AIWorkspace/WorkspaceSelectionToolbar.tsx — used by [AIWorkspaceView]

## Known Missing Infrastructure

<!-- Things that don't exist yet but are needed by multiple pages -->
- [ ] 17 new DB tables (ARCHITECTURE-DECISIONS.md §Decision 8) — migration not run yet
- [ ] Stripe Connect setup — needed by booking, invoicing, client checkout
- [ ] HelloSign API integration — needed by contracts page
- [ ] Resend email setup — needed by notifications, gallery sharing
- [ ] AI classifier (SigLIP Web Worker) — needed by AI Workspace, AI Sort
- [ ] ESLint config migration — .eslintrc.json format doesn't work with ESLint v9; needs eslint.config.js
