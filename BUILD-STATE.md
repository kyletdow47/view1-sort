# View1 Sort — Build State Tracker

> This file is read and updated by the design-to-dev agent at every run.
> It serves as build memory — what's done, what's next, what broke, what was learned.

Last updated: 2026-04-04
Last agent run: 2026-04-04T04:11Z

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
- Dashboard v2 — PR pending — completed 2026-04-03 — Responsive grid, quick actions bar, empty states, QuickStats CSS vars, glass-panel loading skeleton. Pencil frame jHMkx matched. QA passed 2026-04-04.
- Projects Page — branch feat/design-to-dev/projects-page — completed 2026-04-03 — Refined grid cards to match Pencil frame XBDLS: 3-col grid, 260px card height, rounded-[20px], hover action buttons, photo count badge, glass stat cards with top highlight, loading.tsx skeleton, error.tsx boundary. Push pending (no git creds in sandbox). QA passed 2026-04-04.
- AI Workspace Page — branch feat/design-to-dev/ai-workspace-projects-route — completed 2026-04-03 — Route /dashboard/projects/[id], Pencil frame I8wu6. 14 files, 1360 lines. Full tabbed workspace: ProjectHeader, TabBar (6 tabs), SubTabRow (Upload/Workspace/Preferences/Vibe Presets), CategoryColumns (4), AIAnalysisPanel, CullSliderBar, SelectionToolbar. Mock data for AI classifier. Push pending (no git creds in sandbox). QA passed 2026-04-04.
- AI Sort Workspace Tab — branch feat/design-to-dev/ai-sort-workspace-tab — completed 2026-04-03 — Workspace subtab content: SortControlsPanel (confidence threshold slider, sort algorithm selector, category mapping editor, duplicate/blur toggles, batch reclassify), enhanced AIAnalysisPanel (quality distribution bars, flagged issues rows), AISortWorkspace orchestrator. 5 files changed, 731 lines added. Push pending (no git creds in sandbox). QA passed 2026-04-04.
- AI Sort Preferences Tab — PR #23 — branch feat/design-to-dev/ai-sort-preferences-tab — completed 2026-04-03 — 8-section preferences panel matching Pencil frame z7scV: Shooting Style chips, Auto-Sort Categories toggles, Confidence Threshold slider, Auto-Reject Rules, Hero Shot Scoring sliders, Vibe Keywords tag input, Delivery Defaults dropdowns. Glass-morphism cards, #5749F4 accent, auto-save debounce. 3 files, 732 lines added. QA passed 2026-04-04.
- AI Sort Vibe Presets Tab — branch feat/design-to-dev/ai-sort-vibe-presets-tab — completed 2026-04-04 — VibePresetsTab: NL style input → AI parameter extraction → named preset cards with Apply/Edit/Delete, ApplyPresetModal with before/after comparison, mock /api/ai/parse-vibe route (TODO: Supabase Edge Function). 5 files, 856 lines. Push pending (no git creds in sandbox). QA passed 2026-04-04.
- Gallery Builder Page — PR #24 — branch feat/design-to-dev/gallery-builder — completed 2026-04-04 — Split-panel interface: left controls (PhotoSelector, ThemePicker, WatermarkConfigurator, AccessControls), right live preview (GalleryPreviewPanel with desktop/mobile toggle). 4 themes, watermark position grid, access permissions. Route /dashboard/project/[id]/gallery-builder. 11 files, 1108 lines. Mock data (Supabase integration TODO). QA passed 2026-04-04.
- Command Bar (⌘K) — merged to main (073227c) — completed 2026-04-04 — Global ⌘K command palette. CommandBarSetup wrapper in dashboard layout. Branch feat/design-to-dev/command-bar. QA passed 2026-04-04.
- Client Gallery Viewer — committed to main (2e00363) — completed 2026-04-04 — Rebuilt /client page + 7 ClientPortal components + types. Pencil frames XOUvs + 4lzWb. 12 files, 953 lines. No PR (committed direct to main). QA passed 2026-04-04 (after mobile nav fix applied).
- Deliver Gallery (Publish Flow) — branch feat/design-to-dev/publish-flow (871154d) — completed 2026-04-04 — DeliverGalleryView: 3-stage flow (Preselection/Client Selection/Finals Ready), stage advancement CTAs, PROJECT STATS sidebar, success banner on completion. 5 files. QA passed 2026-04-04.


## Currently Building

None. Last fix: Client Gallery Viewer mobile nav (PR #26, 2026-04-04).

## Failed / Blocked

<!-- Format: - [page-name] — reason — date — what needs to happen -->
- Client Gallery Viewer mobile nav — FIXED 2026-04-04 — PR #26 branch fix/design-to-dev/client-gallery-mobile-nav. Changed hidden sm:flex to flex overflow-x-auto on ClientNav line 56. QA passed 2026-04-04.

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
- 2026-04-03: AI Sort Workspace Tab uses glass-morphism panel for SortControlsPanel (280px wide) matching AIAnalysisPanel (260px wide) style. Both use backdrop-blur-[40px], gradient fills, white/alpha borders.
- 2026-04-03: AIAnalysisPanel updated to show quality distribution bars (90+/70-89/<70) matching Pencil exactly. Previous version had simpler progress bar — new version matches Pencil node layout.
- 2026-04-03: Category mapping editor supports toggle on/off and adding custom categories. Drag-to-reorder deferred until dnd-kit is integrated.
- 2026-04-03: Batch re-classify uses 3-second mock timer. Needs SigLIP Web Worker for real classification.
- 2026-04-03: AI Preferences uses ToggleSwitch, GlassCard, SectionHeader, PreferencesSlider, DropdownSelect as internal sub-components. Not extracted to common/ yet — could be reused by Settings page later.
- 2026-04-03: Vibe Keywords chosen over Asana task's "Style Profile sliders" — Pencil design shows tag-based keywords (golden hour, candid, moody, warm tones), not warm/cool or tight/wide sliders. Following Pencil as source of truth.
- 2026-04-04: Vibe Presets tab has no dedicated Pencil content frame — only tab button (id: ZfXsr) exists in AI Workspace frame (I8wu6). Built from task spec using existing glass-morphism design system.
- 2026-04-04: VibePresetsTab uses two-panel layout: left (preset grid, 1-col or xl:2-col), right (280px chat panel). Pattern matches AISortPreferences width ratio.
- 2026-04-04: /api/ai/parse-vibe mock uses heuristic keyword matching. Real implementation needs claude-haiku-4-5-20251001 via Supabase Edge Function (path documented in route.ts comments).
- 2026-04-04: AI Sort Preferences Tab (PR #23) was built in a previous run but Asana task was not moved to Code Review. Added cleanup comment to that Asana task; manual move needed.
- 2026-04-04: Gallery Builder uses split-panel pattern (340px left controls + flex-1 right preview). Left panel has 4 tabbed sections (Photos/Theme/Watermark/Access). Preview renders a simulated gallery matching the selected theme.
- 2026-04-04: Gallery Builder Pencil frame iTVxS was referenced in task spec but Pencil app was not running. Built from task description + existing GalleryView component patterns + design-system.md glass tokens.
- 2026-04-04: WatermarkConfigurator uses local blob URLs from file input. Real implementation needs Cloudflare Images upload API integration.
- 2026-04-04: Gallery Builder reuses existing GalleryTheme type ('dark'|'light'|'minimal'|'editorial') and theme CSS modules from src/components/features/gallery/themes/.
- 2026-04-04: QA review — 0 pages in Code Review queue. No tasks to review.
- 2026-04-04: QA review — 7 pages reviewed, 7 passed, 0 failed. Pages: Dashboard v2, Projects, AI Workspace, AI Sort Workspace Tab, AI Sort Preferences Tab, AI Sort Vibe Presets Tab, Gallery Builder. No fix tasks created. Note: Pencil app was not running so comparison was against build specs only. Tasks marked complete in Asana (manual move to Deployed section needed).
- 2026-04-04: QA review (second run) — 0 pages in Code Review queue. All 7 prior tasks already marked completed from earlier run. No new pages to review.
- 2026-04-04: QA review (third run) — 1 page reviewed, 1 passed, 0 failed. Command Bar (⌘K): all interactions verified (open/close/search/arrow-nav/ESC/backdrop/mobile/cross-page). MINOR: missing Dialog.Title causes WCAG warning + Next.js "1 Issue" badge. Fix task created: [P0] Fix: Command Bar — Missing Dialog.Title causes accessibility warning.
- 2026-04-04: QA review (fourth run) — 2 pages reviewed, 1 passed, 1 failed. Deliver Gallery (Publish Flow): PASS — all 3 stage cards, full advancement flow tested, stats sidebar, success banner, mobile layout. Client Gallery Viewer: FAIL — mobile nav tabs hidden at <640px (hidden sm:flex), no mobile menu fallback. Fix tasks created: [P0] Fix: Client Gallery Viewer — Mobile nav tabs hidden at 375px.
- 2026-04-04: QA review (sixth run) — 2 pages reviewed, 2 passed, 0 failed. Client Gallery Viewer: PASS — all sections present, tab switching works, mobile nav accessible via horizontal scroll after fix. Mobile nav fix (PR #26): PASS — flex overflow-x-auto confirmed, all 3 tabs in DOM, tab switching verified at 375px and desktop. MINOR: thumbnailUrl: '' in mock data causes 204 console errors (img src=""). Fix task created: [P0] Fix: Client Gallery Viewer — thumbnailUrl empty string causes 204 console errors (GID: 1213923424865236).
- 2026-04-04: Command Bar Dialog.Title fix applied — PR #25 — branch fix/design-to-dev/command-bar-dialog-title. One-line fix: added sr-only Dialog.Title, removed aria-label on Dialog.Content. QA task created in Code Review queue.
- 2026-04-04: QA review (fifth run) — 2 pages reviewed, 1 passed, 1 still failing. Command Bar Dialog.Title fix: PASS — Dialog.Title sr-only confirmed in main (CommandBar.tsx:314), all logic intact, task marked complete. Client Gallery Viewer: STILL FAIL — ClientNav.tsx line 56 still has hidden sm:flex, P0 fix task remains in Dev Pickup (GID: 1213923182545588).

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
- AISortWorkspace — src/components/features/AIWorkspace/AISortWorkspace.tsx — used by [AIWorkspaceView workspace subtab]
- SortControlsPanel — src/components/features/AIWorkspace/SortControlsPanel.tsx — used by [AISortWorkspace]
- AISortPreferences — src/components/features/AIWorkspace/AISortPreferences.tsx — used by [AIWorkspaceView preferences subtab]
- VibePresetsTab — src/components/features/AIWorkspace/VibePresetsTab.tsx — used by [AIWorkspaceView vibe-presets subtab]
- GalleryBuilderView — src/components/features/gallery-builder/GalleryBuilderView.tsx — used by [gallery-builder page]
- PhotoSelector — src/components/features/gallery-builder/PhotoSelector.tsx — used by [GalleryBuilderView]
- ThemePicker — src/components/features/gallery-builder/ThemePicker.tsx — used by [GalleryBuilderView]
- WatermarkConfigurator — src/components/features/gallery-builder/WatermarkConfigurator.tsx — used by [GalleryBuilderView]
- AccessControls — src/components/features/gallery-builder/AccessControls.tsx — used by [GalleryBuilderView]
- GalleryPreviewPanel — src/components/features/gallery-builder/GalleryPreviewPanel.tsx — used by [GalleryBuilderView]

## Known Missing Infrastructure

<!-- Things that don't exist yet but are needed by multiple pages -->
- [ ] 17 new DB tables (ARCHITECTURE-DECISIONS.md §Decision 8) — migration not run yet
- [ ] Stripe Connect setup — needed by booking, invoicing, client checkout
- [ ] HelloSign API integration — needed by contracts page
- [ ] Resend email setup — needed by notifications, gallery sharing
- [ ] AI classifier (SigLIP Web Worker) — needed by AI Workspace, AI Sort
- [ ] ESLint config migration — .eslintrc.json format doesn't work with ESLint v9; needs eslint.config.js
- [ ] Supabase Edge Function: parse-vibe — needed by VibePresetsTab real AI extraction; Claude Haiku call pattern ready in /api/ai/parse-vibe/route.ts TODOs
