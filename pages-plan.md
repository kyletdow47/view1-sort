# View1 Sort — Pages Plan

> Generated: 2026-04-01
> Source of truth: PLAN.md (Product Plan v2.0), ROADMAP.md (MVP Sprints), SPEC.md (Full Spec), design-system.md, existing codebase

---

## Architectural Notes (Read First)

### Font Discrepancy
PLAN.md declares "Plus Jakarta Sans only — no font mixing" as non-negotiable. The codebase currently uses Inter (body), Geist (headlines), Geist Mono (code) via `src/app/layout.tsx` and `tailwind.config.ts`. The Pencil design file uses Geist, Plus Jakarta Sans, and Inter. **This must be resolved before page work begins** — either migrate to Plus Jakarta Sans everywhere or update PLAN.md to ratify the current multi-font stack.

### Hardcoded Colors
DashboardV2 components use hardcoded hex colors (`#1a1440`, `#2d1b69`, `#4f46e5`) instead of CSS variable tokens. PLAN.md non-negotiable #4 says "no hardcoded colors anywhere." All new page components must use only semantic token classes from `tailwind.config.ts`.

### ProjectStatus Enum Gap
PLAN.md defines a 10-stage pipeline: Draft → Culling → AI Sorting → Preselection Sent → Client Selecting → Editing → Review Sent → Revision Requested → Final Delivered → Archived. The DB schema and TypeScript types only have 3 statuses: `active | archived | published`. A migration is needed before pages 1, 2, 3, and 11 can show proper status badges.

### Missing DB Tables
Current schema covers 13+ tables. Tables not yet created that pages will need: `client_profiles`, `project_clients`, `project_pricing`, `edit_requests`, `file_purchases`, `booking_form_fields`, `contracts`, `contract_templates`, `questionnaires`, `questionnaire_responses`, `content_posts`, `social_connections`, `packages`, `inquiries`, `communications`, `workflows`, `analytics_events`.

---

## 1. Dashboard

### Page Overview
- **Purpose:** The photographer's home screen. Shows AI-generated daily briefing, key stats, quick actions, recent projects, items needing attention, upcoming schedule, and a global AI command bar.
- **Primary user actions:** Review daily briefing, check stats, launch quick actions (new project, upload, send gallery), respond to action-required items, open command bar (⌘K).
- **Phase:** MVP — Phase 1 Core (Sprint 1: Reconnect)

### Layout Structure
- **Top-level layout:** Single-column center content (max ~1080px) within `DashboardShell`. Optional floating right panel for `TodoPanel`/`ActionRequiredPanel`.
- **Responsive:** On mobile, widgets stack vertically. Floating panel collapses into the main flow. TopNav hamburger menu replaces pill nav.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| Welcome / AI Briefing | Greets user, shows AI daily summary (next shoots, overdue items, revenue snapshot) | `profiles`, `projects`, `bookings`, `invoices`, `notifications` | Yes — AI summarizes daily priorities |
| Quick Stats | 4 stat cards: active projects, unfinished tasks, upcoming shoots, revenue this month | `projects`, `media`, `bookings`, `invoices` | No |
| Quick Actions Bar | Row of action buttons: New Project, Upload, Send Gallery, Create Invoice | None (triggers modals/routes) | No |
| Recent Projects | List of recent projects with thumbnails, status badges, photo counts | `projects`, `media` | No |
| Recent Activity | Feed of recent events (uploads, payments, gallery views) | `notifications` | No |
| Action-Required Panel | Items needing attention: unsigned contracts, unpaid invoices, pending reviews | `invoices`, `bookings`, `contracts` | No |
| Week-Ahead Calendar | Mini calendar showing upcoming shoots and deadlines | `bookings`, `projects` | No |
| Global Command Bar (⌘K) | Search projects, clients, actions; AI natural language queries | All tables | Yes — NL search |

### Component Breakdown

**Shared/Reusable (in `src/components/common/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `StatCard` | `{ icon: ReactNode; label: string; value: string \| number; trend?: { value: number; direction: 'up' \| 'down' } }` | Client | New — extract from QuickStats |
| `PageHeader` | `{ title: string; subtitle?: string; actions?: ReactNode }` | Client | New |
| `EmptyState` | `{ icon: ReactNode; title: string; description: string; action?: ReactNode }` | Client | New |
| `CommandBar` | `{ open: boolean; onClose: () => void }` | Client | New — mount in dashboard layout |
| `StatusBadge` | `{ status: ProjectStatus; size?: 'sm' \| 'md' }` | Client | New — wraps Badge with status colors |

**Page-Specific (in `src/components/features/dashboard-v2/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `DashboardV2` | `{ profile: Profile; projects: Project[] }` | Client | Existing — needs token migration |
| `WelcomeSection` | `{ profile: Profile }` | Client | Existing — extend with AI briefing |
| `AIBriefingCard` | `{ briefing: { summary: string; items: BriefingItem[] } }` | Client | New |
| `QuickActionsBar` | `{ onAction: (action: string) => void }` | Client | New |
| `QuickStats` | `{ stats: DashboardStats }` | Client | Existing |
| `RecentProjects` | `{ projects: Project[] }` | Client | Existing |
| `RecentActivity` | `{ notifications: Notification[] }` | Client | Existing |
| `ActionRequiredPanel` | `{ items: ActionItem[] }` | Client | New — replaces/extends TodoPanel |
| `CalendarWidget` | `{ bookings: Booking[] }` | Client | Existing |
| `TopNav` | `{ profile: Profile }` | Client | Existing |
| `GlassPanel` | `{ children: ReactNode; className?: string }` | Client | Existing |
| `ProgressRing` | `{ value: number; max: number; size: number; color: string }` | Client | Existing |

### State & Data Requirements
- **Supabase fetches:** `profiles` (user), `projects` (recent, with media counts), `bookings` (upcoming), `invoices` (pending), `notifications` (unread + recent)
- **Local UI state:** `commandBarOpen: boolean`, `activeWidget: string` (for mobile tab switching)
- **Real-time subscriptions:** `notifications` table via Supabase Realtime (already stubbed in `useNotifications`)

### Key Interactions
1. **⌘K** opens CommandBar — searches projects, clients, triggers actions
2. **Click project card** → navigates to `/dashboard/project/[id]`
3. **Quick action buttons** → open modals (NewProjectModal) or navigate to routes
4. **Notification bell** → dropdown with recent notifications (existing in layout)
5. **Calendar date click** → navigates to `/dashboard/calendar`

---

## 2. Projects

### Page Overview
- **Purpose:** Browse, search, and manage all photographer projects. Grid or list view with filtering and AI-assisted project creation.
- **Primary user actions:** Search/filter projects, switch view modes, create new project, click into project workspace.
- **Phase:** MVP — Phase 1 Core (Sprint 1: Reconnect)

### Layout Structure
- **Top-level layout:** PageHeader with search/filter bar → responsive card grid (or table rows in list mode). Full-width within dashboard shell.
- **Responsive:** Grid adapts from 4 cols → 3 → 2 → 1. List view becomes card view on mobile.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| Search & Filter Bar | Text search, status filter, preset filter, sort dropdown, view toggle | None (filters client-side) | No |
| Project Card Grid | Responsive grid of project cards with thumbnail, status, photo count, payment status, deadline | `projects`, `media`, `invoices`, `bookings` | No |
| Project List View | Table rows with same data as cards | Same as grid | No |
| Create Project | AI prompt or form modal to create new project | `profiles` (for preset default) | Yes — AI parses natural language to prefill project details |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `SearchFilterBar` | `{ onSearch: (q: string) => void; filters: FilterConfig[]; activeFilters: Record<string, string>; onFilterChange: (key: string, val: string) => void }` | Client | New common component |
| `StatusBadge` | (see Dashboard) | Client | Reused |
| `EmptyState` | (see Dashboard) | Client | Reused |
| `PageHeader` | (see Dashboard) | Client | Reused |

**Page-Specific (in `src/components/features/workspace/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `ProjectCard` | `{ project: Project; photoCount: number; onClick: () => void }` | Client | Existing — extend with payment status + deadline |
| `ProjectListRow` | `{ project: Project; photoCount: number; paymentStatus: string; deadline: string \| null }` | Client | New — list view row with sub-tag line per PLAN.md |
| `NewProjectModal` | `{ open: boolean; onClose: () => void; onCreated: (project: Project) => void }` | Client | Existing |
| `ViewToggle` | `{ mode: 'grid' \| 'list'; onChange: (mode: 'grid' \| 'list') => void }` | Client | New |

### State & Data Requirements
- **Supabase fetches:** `projects` (all for workspace, with joins to `media` for counts, `invoices` for payment status, `bookings` for deadlines)
- **Local UI state:** `viewMode: 'grid' | 'list'`, `searchQuery: string`, `filters: { status, preset, sort }`, `newProjectModalOpen: boolean`
- **Real-time subscriptions:** None needed (data doesn't change frequently enough)

### Key Interactions
1. **Type in search** → filters project list client-side in real-time
2. **Toggle grid/list** → switches between ProjectCard grid and ProjectListRow table
3. **Click project card** → navigates to `/dashboard/project/[id]`
4. **"New Project" button** → opens NewProjectModal
5. **Filter by status** → shows count badges on filter chips

---

## 3. AI Workspace (Project Detail)

### Page Overview
- **Purpose:** The core workspace for a single project. Tabbed interface for AI sorting, review, shot list management, gallery preview, client management, and project details. This is the product's differentiator.
- **Primary user actions:** Run AI sort, review/cull photos, flag issues, compare photos side-by-side, manage categories, preview gallery, manage client access.
- **Phase:** Phase 3 (AI Sort & Intelligence) — basic workspace in MVP Sprint 1, full AI features in Phase 3

### Layout Structure
- **Top-level layout:** Full-width. Header bar (project name, status badge, publish button). Tab bar below header. Content area fills remaining height. Bottom toolbar appears when photos are selected.
- **Responsive:** Tabs collapse to dropdown on mobile. Side panels become bottom sheets. Photo grid adapts columns.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| Project Header | Project name, status timeline, publish button | `projects` | No |
| Tab Bar | Switches between AI Sort, Review, Shot List, Gallery, Client, Details | None | No |
| AI Sort Tab | Scene columns, quality ranking, blur/duplicate flags, cull-to-number slider | `media` (with AI fields) | Yes — AI classification, quality scoring, duplicate detection |
| Review Tab | Loupe view, survey view, compare mode, keyboard shortcuts, star/flag/color labels | `media` | No (uses AI results but review is manual) |
| Shot List Tab | Checklist of planned shots, AI-generated from booking form data | `bookings`, future `shot_lists` | Yes — auto-generates shot list from intake answers |
| Gallery Tab | Preview of what client will see | `projects`, `media` | No |
| Client Tab | Client access management, invite, activity log | `project_clients`, `gallery_access` | No |
| Details Tab | Project metadata editor, preset, pricing, shoot date/location | `projects`, `project_pricing` | No |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `StatusBadge` | (see Dashboard) | Client | Reused |
| `EmptyState` | (see Dashboard) | Client | Reused |

**Page-Specific (in `src/components/features/workspace/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `WorkspaceView` | `{ project: Project; media: Media[] }` | Client | Existing (340 lines) — foundation for AI Sort tab |
| `ProjectTabBar` | `{ activeTab: string; onTabChange: (tab: string) => void; project: Project }` | Client | New |
| `AISortTab` | `{ project: Project; media: Media[] }` | Client | New — wraps WorkspaceView with AI controls |
| `AIQualityPanel` | `{ media: Media[]; onFlag: (ids: string[], flag: string) => void }` | Client | New — shows AI-detected blur, duplicates, exposure issues |
| `CullSlider` | `{ total: number; cullTo: number; onChange: (n: number) => void }` | Client | New — "Keep top N" slider with AI recommendation |
| `ReviewTab` | `{ project: Project; media: Media[] }` | Client | New |
| `CompareView` | `{ mediaA: Media; mediaB: Media; onSelect: (id: string) => void }` | Client | New — side-by-side with zoom sync |
| `LabelToolbar` | `{ selectedIds: string[]; onStar: () => void; onFlag: (color: string) => void; onLabel: (label: string) => void }` | Client | New — star, flag, color label controls |
| `ShotListTab` | `{ projectId: string; shotList: ShotListItem[] }` | Client | New |
| `GalleryPreviewTab` | `{ project: Project; media: Media[] }` | Client | New — uses GalleryView in preview mode |
| `ClientTab` | `{ projectId: string; clients: ProjectClient[] }` | Client | New |
| `DetailsTab` | `{ project: Project }` | Client | New |
| `CategorySection` | `{ category: string; media: Media[]; onDrop: (mediaId: string) => void }` | Client | Existing |
| `MediaCard` | `{ media: Media; selected: boolean; onSelect: () => void }` | Client | Existing |
| `PhotoGrid` | `{ media: Media[]; viewMode: string; onSelect: (id: string) => void }` | Client | Existing |
| `SelectionToolbar` | `{ selectedCount: number; onAction: (action: string) => void }` | Client | Existing |
| `Lightbox` | `{ media: Media; onClose: () => void }` | Client | Existing |
| `UploadZone` | `{ projectId: string; onUpload: (files: File[]) => void }` | Client | Existing |
| `UploadProgress` | `{ uploads: UploadItem[] }` | Client | Existing |
| `ProjectStatusTimeline` | `{ status: ProjectStatus; history: StatusChange[] }` | Client | Existing |

### State & Data Requirements
- **Supabase fetches:** `projects` (project details), `media` (all media with AI fields: `ai_category`, `ai_confidence`, `ai_labels`), `categories`, `gallery_access`, `notifications` (project-specific)
- **Local UI state:** `activeTab: string`, `selectedMediaIds: string[]`, `viewMode: string`, `filters: MediaFilters`, `compareMode: boolean`, `comparePair: [string, string]`
- **Zustand stores:** `mediaStore` (selection, filtering, grouping), `uploadStore` (upload queue), `projectStore` (current project)
- **Real-time subscriptions:** `media` table for upload progress updates
- **Hooks:** `useClassifier` (AI classification via Web Worker), `useBatchSelect` (shift+click multi-select)

### Key Interactions
1. **Run AI Sort** → triggers classification via Web Worker, assigns categories, ranks quality
2. **Drag photos between category columns** → reassigns category
3. **Arrow keys + space/s/1-5** → navigate, select, star, rate in Review tab
4. **Compare mode** → select two photos for side-by-side comparison with synced zoom
5. **Publish button** → triggers publish flow (Sprint 4)

---

## 4. Gallery Builder

### Page Overview
- **Purpose:** Build and customize the client-facing gallery. Select which photos to include, apply themes, configure watermarks, set access controls, create slideshows, and configure print store.
- **Primary user actions:** Select photos for gallery, pick theme, configure watermark, set access permissions, publish gallery.
- **Phase:** Phase 4 (Gallery & Delivery) — basic gallery publish in MVP Sprint 4; slideshow and print store are post-MVP

### Layout Structure
- **Top-level layout:** Split panel — left controls panel (scrollable, ~350px) + right live preview (fills remaining width). Preview updates in real-time as controls change.
- **Responsive:** On mobile, controls become a bottom sheet over the preview. Preview takes full width.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| AI Curation Panel | AI recommends best photos for gallery based on quality + narrative diversity | `media` (with AI fields) | Yes — AI selects optimal photo set |
| Photo Selector | Drag-select photos from sorted library to include in gallery | `media`, `categories` | No |
| Theme Picker | Visual theme selector with live preview thumbnails | `projects.theme`, `profiles.plan` (for tier gating) | No |
| Watermark Controls | Logo upload, placement, size, opacity, live preview overlay | `profiles` (logo), `projects` | No |
| Access Controls | Password, expiry, download permissions, per-stage access | `project_pricing`, `gallery_access` | No |
| Slideshow Creator | Photo ordering, transitions, music, duration | `media` | No |
| Print Store Config | Enable store, set products and prices | Future `print_products` | Yes — AI recommends best photos for printing |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `PageHeader` | (see Dashboard) | Client | Reused |

**Page-Specific (in `src/components/features/gallery-builder/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `GalleryBuilderLayout` | `{ project: Project; media: Media[] }` | Client | New — split panel layout |
| `AICurationPanel` | `{ media: Media[]; onApplyCuration: (selectedIds: string[]) => void }` | Client | New |
| `PhotoSelectorPanel` | `{ media: Media[]; selected: string[]; onToggle: (id: string) => void }` | Client | New |
| `ThemePicker` | `{ current: GalleryTheme; onSelect: (theme: GalleryTheme) => void; tier: UserTier }` | Client | New |
| `WatermarkConfigurator` | `{ config: WatermarkConfig; onChange: (c: WatermarkConfig) => void }` | Client | New |
| `AccessControlPanel` | `{ settings: AccessSettings; onChange: (s: AccessSettings) => void }` | Client | New |
| `SlideshowCreator` | `{ media: Media[]; onSave: (config: SlideshowConfig) => void }` | Client | New — post-MVP |
| `PrintStoreConfig` | `{ enabled: boolean; products: PrintProduct[]; onChange: (p: PrintProduct[]) => void }` | Client | New — post-MVP |

**Existing components reused:**
- `GalleryView` — preview mode in right panel
- `GalleryLightbox` — full-screen preview
- `ThemeSwitcher` — adapt for gallery-specific theme selection

### State & Data Requirements
- **Supabase fetches:** `projects` (theme, gallery_public, pricing), `media` (all project media with categories), `profiles` (logo for watermark, tier for theme gating)
- **Local UI state:** `selectedPhotoIds: string[]`, `currentTheme: GalleryTheme`, `watermarkConfig: WatermarkConfig`, `accessSettings: AccessSettings`, `previewMode: boolean`
- **Real-time subscriptions:** None

### Key Interactions
1. **Drag photos** from selector to gallery inclusion list
2. **Theme change** instantly updates live preview
3. **Watermark toggle** shows/hides overlay on preview photos
4. **"Publish Gallery"** triggers publish API route and sends client invitations
5. **AI curate button** → AI selects optimal N photos

---

## 5. Booking

### Page Overview
- **Purpose:** Manage the booking pipeline — edit the public booking page, manage service packages, view availability, configure deposits/payments, respond to inquiries with AI assistance, and convert leads to projects.
- **Primary user actions:** Edit public booking page, create/edit packages, respond to inquiries, configure payment terms, convert booking to project.
- **Phase:** Phase 6 (Business Workflow) — Post-MVP per ROADMAP.md

### Layout Structure
- **Top-level layout:** Tab-based within dashboard shell. Tabs: Inbox, Packages, Calendar, Page Editor, Settings.
- **Responsive:** Tabs collapse to dropdown on mobile. Calendar becomes list view. Inbox messages stack vertically.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| Public Booking Page Editor | WYSIWYG editor for `/book/[photographerId]` | `profiles`, `packages` | No |
| Packages Manager | CRUD for service packages (name, price, deposit, inclusions) | Future `packages` | No |
| Availability Calendar | Live calendar showing booked/available slots | `bookings`, Google Calendar API | No |
| Deposit/Payment Config | Deposit %, auto-charge on delivery, payment plans | `project_pricing` | No |
| Inquiry Inbox | List of booking inquiries with AI-drafted replies | Future `inquiries` | Yes — AI drafts reply from inquiry context |
| Lead-to-Project Conversion | Convert confirmed booking into project with client pre-attached | `bookings`, `projects`, `client_profiles` | No |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `SearchFilterBar` | (see Projects) | Client | Reused for inbox filtering |
| `EmptyState` | (see Dashboard) | Client | Reused |
| `PageHeader` | (see Dashboard) | Client | Reused |
| `DateRangePicker` | `{ value: DateRange; onChange: (range: DateRange) => void }` | Client | New common component |

**Page-Specific (in `src/components/features/bookings/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `BookingsPageClient` | `{ bookings: Booking[] }` | Client | Existing — extend |
| `NewBookingModal` | `{ open: boolean; onClose: () => void }` | Client | Existing |
| `BookingPageEditor` | `{ photographerId: string; config: BookingPageConfig }` | Client | New |
| `PackagesManager` | `{ packages: Package[]; onSave: (p: Package[]) => void }` | Client | New |
| `AvailabilityCalendar` | `{ bookings: Booking[]; workingHours: WorkingHours }` | Client | New |
| `DepositPaymentConfig` | `{ config: DepositConfig; onChange: (c: DepositConfig) => void }` | Client | New |
| `InquiryInbox` | `{ inquiries: Inquiry[] }` | Client | New |
| `AIReplyDraft` | `{ inquiry: Inquiry; onSend: (reply: string) => void }` | Client | New |
| `LeadConversionFlow` | `{ inquiry: Inquiry; onConvert: (project: ProjectInsert) => void }` | Client | New |

### State & Data Requirements
- **Supabase fetches:** `bookings`, `profiles`, future: `packages`, `inquiries`, `booking_form_fields`
- **Local UI state:** `activeTab: string`, `selectedInquiry: Inquiry | null`, `editingPackage: Package | null`
- **Real-time subscriptions:** `bookings` table for new inquiry notifications
- **External:** Google Calendar API for availability sync

### Key Interactions
1. **Inquiry click** → opens reply panel with AI-drafted response
2. **"Convert to Project"** → creates project + auto-attaches client
3. **Package drag-to-reorder** → updates display order
4. **Calendar date click** → shows booking details or creates new
5. **Page editor save** → updates public `/book/[photographerId]` content

---

## 6. Clients & CRM

### Page Overview
- **Purpose:** Manage the full client pipeline from lead to paid delivery. Kanban board for pipeline visualization, full client profiles with activity-focused stats (not financial per PLAN.md), and natural language workflow automation.
- **Primary user actions:** Drag leads through pipeline stages, view client profile, log communications, create automations.
- **Phase:** Phase 5 (Client Experience) for profiles; Phase 6 (Business Workflow) for pipeline and automation

### Layout Structure
- **Top-level layout:** Default view is Kanban board (full-width). Client profile is a separate full page at `/dashboard/clients/[id]`. Toggle between Kanban and list view.
- **Responsive:** Kanban columns scroll horizontally on mobile. Client profile tabs stack vertically.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| Lead Pipeline Kanban | Drag-drop columns: Inquiry → Quoted → Booked → Shooting → Delivered → Paid | `client_profiles`, `projects`, `bookings`, `invoices` | No |
| Client Profile Page | Full client detail: activity stats, history, communications, documents | `client_profiles`, `projects`, `bookings`, `communications` | No |
| Activity Stats | Active tasks, outreach history, upcoming shoots, pending actions (NOT financial) | `projects`, `bookings`, `notifications` | No |
| Communication Timeline | Chronological log of emails, messages, notes | Future `communications` | No |
| Workflow Automation Builder | Natural language input → automation rules | Future `workflows` | Yes — NL to automation rules |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `KanbanBoard` | `{ columns: KanbanColumn[]; onCardMove: (cardId: string, toColumn: string, index: number) => void }` | Client | New common component — uses dnd-kit |
| `SearchFilterBar` | (see Projects) | Client | Reused |
| `StatusBadge` | (see Dashboard) | Client | Reused |
| `PageHeader` | (see Dashboard) | Client | Reused |
| `EmptyState` | (see Dashboard) | Client | Reused |
| `DataTable` | `{ columns: ColumnDef[]; data: unknown[]; onRowClick?: (row: unknown) => void; sortable?: boolean; paginated?: boolean }` | Client | New common component |

**Page-Specific (in `src/components/features/clients/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `LeadPipelineKanban` | `{ leads: Lead[]; onMove: (leadId: string, toStage: string) => void }` | Client | New — wraps KanbanBoard with CRM columns |
| `ClientProfilePage` | `{ client: ClientProfile; projects: Project[]; communications: Communication[] }` | Client | New |
| `ClientActivityStats` | `{ stats: ClientStats }` | Client | New — activity-focused per PLAN.md |
| `CommunicationTimeline` | `{ comms: Communication[] }` | Client | New |
| `WorkflowAutomationBuilder` | `{ workflows: Workflow[]; onSave: (w: Workflow) => void }` | Client | New |
| `ClientSearchBar` | `{ onSearch: (q: string) => void; filters: ClientFilters }` | Client | New |

### State & Data Requirements
- **Supabase fetches:** Future `client_profiles`, `projects` (per client), `bookings` (per client), `invoices` (internal tracking only), `notifications` (client-related)
- **Local UI state:** `viewMode: 'kanban' | 'list'`, `selectedClient: string | null`, `searchQuery: string`, `stageFilters: string[]`
- **Real-time subscriptions:** `bookings` table for pipeline updates

### Key Interactions
1. **Drag lead card** between Kanban columns → updates client pipeline stage
2. **Click client card** → navigates to full profile page `/dashboard/clients/[id]` (not a modal, per PLAN.md)
3. **Communication timeline** supports inline reply
4. **Workflow builder** parses natural language: "When booking confirmed, send contract" → creates rule
5. **Search/filter** narrows client list by stage, last contact, project count

---

## 7. Contracts & Documents

### Page Overview
- **Purpose:** Generate contracts from booking details using AI, manage template library by shoot type, handle e-signature flow, build intake questionnaires, and auto-generate shot lists from answers.
- **Primary user actions:** Generate contract from template, send for signature, create questionnaire, review shot list.
- **Phase:** Phase 6 (Business Workflow)

### Layout Structure
- **Top-level layout:** Tab-based: Contracts, Templates, Questionnaires. Main area shows list with detail panel on click.
- **Responsive:** Detail panel becomes full-screen on mobile. Template grid adapts columns.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| Contract Generator | AI fills contract from booking details; photographer reviews/edits | `bookings`, `contract_templates` | Yes — AI populates from booking context |
| Template Library | Grid of templates by shoot type: Wedding, Architecture, Commercial, Portrait, Event | Future `contract_templates` | No |
| Contract Editor | Rich text editor with variable insertion (client name, date, price) | `contracts` | No |
| E-Signature Flow | Signature pad, initials, date; email notification to client | `contracts`, `client_profiles` | No |
| Questionnaire Builder | Drag-drop form builder (text, textarea, date, dropdown, checkbox, file upload) | Future `questionnaires` | No |
| Shot List Generator | AI reads questionnaire answers, generates shot list | `questionnaire_responses` | Yes — answers → shot list |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `PageHeader` | (see Dashboard) | Client | Reused |
| `EmptyState` | (see Dashboard) | Client | Reused |
| `StatusBadge` | (see Dashboard) | Client | Reused |
| `ConfirmDialog` | `{ open: boolean; title: string; description: string; onConfirm: () => void; onCancel: () => void; destructive?: boolean }` | Client | New common — wraps Modal |

**Page-Specific (in `src/components/features/contracts/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `ContractGenerator` | `{ booking: Booking; template: ContractTemplate; onGenerate: (c: Contract) => void }` | Client | New |
| `ContractTemplateLibrary` | `{ templates: ContractTemplate[]; onSelect: (t: ContractTemplate) => void }` | Client | New |
| `ContractEditor` | `{ contract: Contract; onChange: (c: Contract) => void }` | Client | New |
| `ESignatureFlow` | `{ contract: Contract; signers: Signer[]; onComplete: (c: Contract) => void }` | Client | New |
| `QuestionnaireBuilder` | `{ fields: QuestionnaireField[]; onSave: (f: QuestionnaireField[]) => void }` | Client | New |
| `QuestionnaireShotListGenerator` | `{ answers: Record<string, string>; onGenerate: (shots: ShotListItem[]) => void }` | Client | New |
| `ContractStatusTracker` | `{ contracts: Contract[] }` | Client | New |

### State & Data Requirements
- **Supabase fetches:** Future `contracts`, `contract_templates`, `questionnaires`, `questionnaire_responses`, `bookings`, `profiles`
- **Local UI state:** `activeTab: string`, `selectedContract: Contract | null`, `editorContent: string`, `signatureData: SignatureData`
- **Real-time subscriptions:** `contracts` table for signature status updates

### Key Interactions
1. **Select template + booking** → AI generates pre-filled contract
2. **Send for signature** → email to client with signing link
3. **Client signs** → status updates to "Signed", auto-triggers invoice generation
4. **Questionnaire answers** → AI generates shot list for project
5. **Template CRUD** → create, duplicate, edit, delete templates

---

## 8. Finances

### Page Overview
- **Purpose:** Revenue overview, invoice management, payment tracking, auto-reminders, income reporting, and Stripe Connect payout history.
- **Primary user actions:** View revenue stats, create invoices, track payment status, configure reminders, export reports, view payouts.
- **Phase:** Phase 6 (Business Workflow) for invoices; Phase 7 for analytics charts. BillingView reconnect in MVP Sprint 5.

### Layout Structure
- **Top-level layout:** Revenue stats at top (stat cards + chart), then tabbed sections: Invoices, Reports, Payouts, Settings.
- **Responsive:** Stat cards stack 2x2 on mobile. Chart adapts width. Invoice table becomes card list.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| Revenue Dashboard | Stat cards: total revenue, outstanding, paid this month, avg project value. Line chart for trends. | `invoices`, `gallery_payments` | No |
| Invoice Creator | Line item editor, tax, payment plans, due date | `client_profiles`, `projects` | No |
| Invoice Status Tracker | Table: client, amount, status, sent date, due date. Row actions: resend, mark paid, refund. | `invoices` | No |
| Auto-Reminder Config | Days before/after due, frequency, channels (email/SMS) | Settings (JSONB or new table) | No |
| Income Reports | Filterable by date, client, project. CSV export. | `invoices`, `gallery_payments` | No |
| Payout History | Stripe Connect payouts with status and dates | Stripe API | No |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `StatCard` | (see Dashboard) | Client | Reused |
| `DataTable` | (see Clients) | Client | Reused |
| `DateRangePicker` | (see Booking) | Client | Reused |
| `PageHeader` | (see Dashboard) | Client | Reused |
| `EmptyState` | (see Dashboard) | Client | Reused |
| `StatusBadge` | (see Dashboard) | Client | Reused |

**Page-Specific (in `src/components/features/finances/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `BillingView` | `{ subscription: Subscription }` | Client | Existing — reconnect in Sprint 5 |
| `RevenueDashboard` | `{ stats: RevenueStats; period: DateRange }` | Client | New |
| `RevenueChart` | `{ data: ChartDataPoint[]; period: 'week' \| 'month' \| 'quarter' \| 'year' }` | Client | New — recharts or chart.js |
| `InvoiceCreator` | `{ clients: ClientProfile[]; onSave: (inv: InvoiceInsert) => void }` | Client | New |
| `InvoiceTable` | `{ invoices: Invoice[]; onAction: (id: string, action: string) => void }` | Client | New — wraps DataTable |
| `AutoReminderConfig` | `{ config: ReminderConfig; onChange: (c: ReminderConfig) => void }` | Client | New |
| `IncomeReport` | `{ data: IncomeData[]; period: DateRange }` | Client | New |
| `PayoutHistory` | `{ payouts: Payout[] }` | Client | New |

### State & Data Requirements
- **Supabase fetches:** `invoices`, `gallery_payments`, `subscriptions`, `profiles` (stripe_connect_id)
- **Stripe API:** Payout history, balance, upcoming payouts (via API routes)
- **Local UI state:** `activeTab: string`, `dateRange: DateRange`, `invoiceModalOpen: boolean`
- **Real-time subscriptions:** `invoices` table for payment status updates

### Key Interactions
1. **"Create Invoice"** → opens InvoiceCreator modal
2. **Invoice row click** → expands detail + actions (resend, mark paid, refund)
3. **Date range change** → filters all stat cards and charts
4. **CSV export** → downloads filtered report
5. **Payout row** → links to Stripe dashboard for details

---

## 9. Analytics

### Page Overview
- **Purpose:** AI-powered business intelligence. Proactive insights, gallery performance metrics, booking/revenue trends, lead conversion funnel, and AI hours-saved tracker.
- **Primary user actions:** Review AI insights, filter by date range, drill into gallery stats, view conversion funnel.
- **Phase:** Phase 7 (Analytics) — Per SPEC.md, explicitly deferred from Phase 1 and Phase 2

### Layout Structure
- **Top-level layout:** Date range picker at top. Grid of analytics panels below (2-3 columns). AI insights feed in left column.
- **Responsive:** Panels stack single-column on mobile. Charts adapt to container width.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| AI Insights Feed | Proactive AI-generated business insights | All tables (aggregated) | Yes — AI analyzes patterns and generates insights |
| Gallery Performance | Per-gallery metrics: views, visitors, time, download rate, conversion | `gallery_access`, `gallery_downloads`, `gallery_payments` | No |
| Booking/Revenue Trends | Dual-axis chart: booking count + revenue over time | `bookings`, `invoices` | No |
| Lead Conversion Funnel | Visual funnel: Inquiry → Quoted → Booked → Completed → Paid with drop-off rates | `client_profiles`, `bookings`, `invoices` | No |
| AI Hours-Saved Tracker | Estimated time saved by AI sorting, auto-responses, contract generation | Future `ai_usage_log` | Yes — calculates from AI usage data |
| Package Analytics | Which packages sell, avg project value, repeat client rate | `packages`, `invoices`, `bookings` | No |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `StatCard` | (see Dashboard) | Client | Reused |
| `DateRangePicker` | (see Booking) | Client | Reused |
| `PageHeader` | (see Dashboard) | Client | Reused |
| `EmptyState` | (see Dashboard) | Client | Reused |

**Page-Specific (in `src/components/features/analytics/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `AnalyticsDashboardLayout` | `{ period: DateRange; onPeriodChange: (r: DateRange) => void }` | Client | New |
| `AIInsightsFeed` | `{ insights: AIInsight[] }` | Client | New |
| `GalleryPerformancePanel` | `{ galleries: GalleryMetric[] }` | Client | New |
| `BookingRevenueTrends` | `{ data: TrendData[]; period: DateRange }` | Client | New |
| `LeadConversionFunnel` | `{ stages: FunnelStage[] }` | Client | New |
| `AIHoursSavedTracker` | `{ stats: HoursSavedStats }` | Client | New |
| `PackageAnalytics` | `{ packages: PackageMetric[] }` | Client | New |

### State & Data Requirements
- **Supabase fetches:** `projects`, `media`, `invoices`, `bookings`, `gallery_access`, `gallery_downloads`, `gallery_payments`, future `analytics_events`, `ai_usage_log`
- **Local UI state:** `dateRange: DateRange`, `selectedGallery: string | null`
- **Real-time subscriptions:** None (analytics data refreshes on page load or manual refresh)

### Key Interactions
1. **Date range picker** → filters all panels simultaneously
2. **Gallery row click** → drills into detailed stats for that gallery
3. **AI insights refresh** → re-runs AI analysis on demand
4. **Funnel stage click** → shows clients in that stage
5. **Hours-saved card** → expandable detail showing breakdown by AI feature

---

## 10. Content Hub

### Page Overview
- **Purpose:** Manage social media content creation and scheduling. Content calendar with drag-drop, post creator with AI caption generation, hashtag suggestions, platform previews, and cross-platform scheduling.
- **Primary user actions:** Create posts from project photos, generate AI captions, schedule posts, view content calendar.
- **Phase:** v3+ (fully deferred — not in any current build phase)

### Layout Structure
- **Top-level layout:** Calendar view (month/week toggle) as primary. Create/edit panel slides in from right.
- **Responsive:** Calendar becomes list view on mobile. Post creator becomes full-screen modal.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| Content Calendar | Month/week view with drag-drop posts, color-coded by platform | Future `content_posts` | No |
| Post Creator | Select photo, write/generate caption, schedule, select platforms | `media`, `projects`, future `social_connections` | Yes — AI caption generation |
| Photo Library Picker | Browse project photos by category to use in posts | `media`, `projects` | No |
| AI Caption Generator | 3 tone options: professional, casual, storytelling | `media` (context) | Yes — generates 3 caption variations |
| Hashtag Suggester | AI suggests relevant hashtags from photo + caption | `media` (category), caption text | Yes — contextual hashtag recommendations |
| Platform Preview | Shows how post looks on Instagram, Facebook, TikTok, Pinterest | Post content | No |
| Cross-Post Scheduler | Select platforms, customize per-platform, set schedule | Future `content_posts`, `social_connections` | No |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `DateRangePicker` | (see Booking) | Client | Reused |
| `PageHeader` | (see Dashboard) | Client | Reused |
| `EmptyState` | (see Dashboard) | Client | Reused |

**Page-Specific (in `src/components/features/content-hub/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `ContentCalendar` | `{ posts: ContentPost[]; onDateClick: (date: Date) => void; onPostMove: (id: string, date: Date) => void }` | Client | New |
| `PostCreator` | `{ onSave: (post: ContentPost) => void; mediaLibrary: Media[] }` | Client | New |
| `PhotoFromLibraryPicker` | `{ media: Media[]; onSelect: (id: string) => void }` | Client | New |
| `AICaptionGenerator` | `{ media: Media; tone: 'professional' \| 'casual' \| 'storytelling'; onGenerate: (caption: string) => void }` | Client | New |
| `HashtagSuggester` | `{ caption: string; category: string; onSelect: (tags: string[]) => void }` | Client | New |
| `PlatformPreview` | `{ post: ContentPost; platform: 'instagram' \| 'facebook' \| 'tiktok' \| 'pinterest' }` | Client | New |
| `CrossPostScheduler` | `{ post: ContentPost; platforms: string[]; onSchedule: (s: PostSchedule) => void }` | Client | New |

### State & Data Requirements
- **Supabase fetches:** Future `content_posts`, `social_connections`, `media`, `projects`
- **Local UI state:** `calendarView: 'month' | 'week'`, `selectedDate: Date`, `editingPost: ContentPost | null`, `selectedTone: string`
- **Real-time subscriptions:** None
- **External:** Social platform APIs (Instagram Graph API, Facebook API, etc.) for posting

### Key Interactions
1. **Drag post on calendar** → reschedule
2. **Click date** → create new post
3. **AI caption button** → generates 3 variations, photographer picks one
4. **Platform preview tabs** → toggle between platform mockups
5. **Schedule button** → queues post for automated publishing

---

## 11. Client Portal (Client-Facing)

### Page Overview
- **Purpose:** The client's view of the platform. Home dashboard showing all their galleries and pending actions, gallery viewer with favorites/comments/download/purchase, slideshow player, document access.
- **Primary user actions:** View gallery, favorite photos, download (gated), make payments, sign contracts, fill questionnaires.
- **Phase:** Phase 5 (Client Experience) — Gallery viewing in MVP Sprint 4; full portal in Phase 5

### Layout Structure
- **Top-level layout:** Client home at `/client` is a simple dashboard. Gallery viewer at `/gallery/[id]` is the primary experience — full-width, photographer's brand-forward. Minimal chrome.
- **Responsive:** Mobile-first per PLAN.md non-negotiable #5. Gallery grid adapts. Download bar sticky at bottom. Lightbox is full-screen.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| Client Home Dashboard | Overview: galleries, pending actions, invoices | `gallery_access`, `invoices`, `projects` | No |
| Gallery Viewer | Category-based photo sections with lightbox | `projects`, `media`, `gallery_access`, `gallery_payments` | No |
| Favorites | Heart icon per photo, favorites bar with download | Future `client_reactions` | No |
| Comments | Threaded comments per photo | Future `client_reactions` (v3) | No |
| Download/Purchase | Download button, payment gate, cart for per-file | `gallery_payments`, `file_purchases`, `project_pricing` | No |
| Slideshow Player | Full-screen slideshow with transitions and music | `media`, slideshow config | No |
| Print Shop | Browse print products, select per photo | Future `print_products` | Yes — AI recommends best photos for printing |
| Document Access | View signed contracts, fill pending questionnaires | Future `contracts`, `questionnaires` | No |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `StatusBadge` | (see Dashboard) | Client | Reused for invoice/project status |
| `EmptyState` | (see Dashboard) | Client | Reused |

**Page-Specific — existing (in `src/components/features/gallery/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `GalleryView` | `{ project: Project; media: Media[]; theme: GalleryTheme }` | Client | Existing — functional |
| `GalleryLightbox` | `{ media: Media; onClose: () => void }` | Client | Existing |
| `GalleryPaywall` | `{ project: Project; amountOwed: number }` | Client | Existing |
| `CheckoutForm` | `{ project: Project; amount: number }` | Client | Existing |
| `CartView` | `{ items: CartItem[]; onCheckout: () => void }` | Client | Existing |
| `AccessGate` | `{ projectId: string; children: ReactNode }` | Client | Existing |
| `PhotoCommentPanel` | `{ mediaId: string; comments: Comment[] }` | Client | Existing |

**Page-Specific — new (in `src/components/features/client-portal/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `ClientHomeDashboard` | `{ galleries: GalleryAccess[]; pendingActions: PendingAction[]; invoices: Invoice[] }` | Client | New |
| `ClientGalleryViewer` | `{ project: Project; media: Media[]; access: GalleryAccessLevel; favorites: string[] }` | Client | New — extends GalleryView with favorites/comments |
| `FavoritesBar` | `{ favorites: Media[]; onRemove: (id: string) => void; onDownload: () => void }` | Client | New |
| `SlideshowPlayer` | `{ media: Media[]; config: SlideshowConfig }` | Client | New — post-MVP |
| `ClientPrintShop` | `{ media: Media[]; products: PrintProduct[] }` | Client | New — post-MVP |
| `ClientDocumentAccess` | `{ contracts: Contract[]; questionnaires: Questionnaire[] }` | Client | New |
| `ClientInvoiceList` | `{ invoices: Invoice[]; onPay: (id: string) => void }` | Client | New |

### State & Data Requirements
- **Supabase fetches:** `gallery_access`, `projects`, `media`, `gallery_payments`, `invoices`, future: `client_profiles`, `client_reactions`, `contracts`
- **Supabase RPC:** `resolve_gallery_access` — determines canView, canDownload, amountOwed (defined in SPEC.md, not yet implemented)
- **Local UI state:** `favoriteIds: string[]`, `lightboxOpen: boolean`, `currentMediaId: string`, `cartItems: CartItem[]`
- **Real-time subscriptions:** None (client view is relatively static)

### Key Interactions
1. **Magic link** → access gallery without account (basic viewing per SPEC.md)
2. **Heart icon** → toggle favorite on a photo
3. **Download button** → checks access + payment status, serves signed URL or triggers paywall
4. **Pay button** → Stripe checkout flow (existing CheckoutForm)
5. **Slideshow auto-play** → full-screen with transitions

---

## 12. Settings

### Page Overview
- **Purpose:** Complete photographer configuration. AI workspace setup via natural language, branding (logo, colors, domain, watermark), profile management, team members + roles, integrations, AI preferences, subscription & billing.
- **Primary user actions:** Configure AI via natural language, upload logo/branding, manage team, connect Stripe, manage subscription.
- **Phase:** Phase 1 (foundations: profile, Connect, billing) in MVP Sprint 5; AI wizard and integrations in later phases

### Layout Structure
- **Top-level layout:** Left sidebar navigation with settings sections. Content area shows selected section. Settings at `/dashboard/settings` with sub-routes.
- **Responsive:** Settings sidebar becomes top tabs on mobile. Forms stack vertically.

### Sections & Components

| Section | What it does | Data needed | AI-powered? |
|---------|-------------|-------------|-------------|
| AI Setup Wizard | Plain English → full workspace config. "I shoot weddings and real estate, warm style, 500-1000 photos" | `profiles` | Yes — NL → AI config generation |
| Branding Panel | Logo upload, primary/secondary colors, custom domain, watermark default, business info | `profiles`, future `branding` | No |
| Profile | Name, email, avatar, business name, bio, social links | `profiles` | No |
| Team Members | List with role badges. Invite by email. Roles: owner, admin, member. | `workspace_members`, `workspaces` | No |
| Integrations | Stripe Connect, Google Calendar, Lightroom, Zapier. Connection status + toggle. | `profiles` (Stripe), future `integrations` | No |
| AI Preferences | Aggressiveness, auto-cull threshold, preferred categories, style profile | Future `ai_config` or `profiles.metadata` | No |
| Subscription & Billing | Current plan, usage stats, upgrade/downgrade, billing portal link | `subscriptions`, Stripe API | No |

### Component Breakdown

**Shared/Reusable:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `PageHeader` | (see Dashboard) | Client | Reused |
| `EmptyState` | (see Dashboard) | Client | Reused |
| `ConfirmDialog` | (see Contracts) | Client | Reused for destructive actions |

**Page-Specific — existing:**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `BillingView` | `{ subscription: Subscription }` | Client | Existing — reconnect Sprint 5 |
| `ThemeSwitcher` | `{ currentTheme: string; onSwitch: (theme: string) => void }` | Client | Existing |

**Page-Specific — new (in `src/components/features/settings/`):**
| Component | Props | Server/Client | Notes |
|-----------|-------|---------------|-------|
| `AISetupWizard` | `{ profile: Profile; onComplete: (config: AIConfig) => void }` | Client | New |
| `BrandingPanel` | `{ branding: BrandingConfig; onChange: (b: BrandingConfig) => void }` | Client | New |
| `ProfileEditor` | `{ profile: Profile; onSave: (update: ProfileUpdate) => void }` | Client | New |
| `TeamMembersPanel` | `{ members: WorkspaceMember[]; onInvite: (email: string, role: string) => void; onRemove: (userId: string) => void }` | Client | New |
| `IntegrationsPanel` | `{ integrations: Integration[] }` | Client | New |
| `StripeConnectSetup` | `{ connectId: string \| null; onboarded: boolean }` | Client | Partially existing — extend |
| `AIPreferencesPanel` | `{ preferences: AIPreferences; onChange: (p: AIPreferences) => void }` | Client | New |
| `SubscriptionBillingPanel` | `{ subscription: Subscription; onManage: () => void }` | Client | New — wraps BillingView |
| `EmailTemplateConfig` | `{ templates: EmailTemplate[]; onSave: (t: EmailTemplate) => void }` | Client | New |

### State & Data Requirements
- **Supabase fetches:** `profiles`, `workspaces`, `workspace_members`, `subscriptions`, `email_logs`
- **Stripe API:** Subscription details, Connect status (via API routes)
- **Local UI state:** `activeSection: string`, `unsavedChanges: boolean`, `aiWizardStep: number`
- **Real-time subscriptions:** None

### Key Interactions
1. **AI wizard** → type natural language description → AI generates full config (presets, categories, style)
2. **Logo upload** → shows live preview of watermark
3. **Team invite** → sends email via Resend, adds workspace member
4. **Stripe Connect** → triggers OAuth flow redirect to Stripe
5. **"Manage Subscription"** → opens Stripe Customer Portal (existing API route)

---

## Summary

### Total Shared Components

**Existing common components (12):** Button, Input, Card, Modal, Badge, Avatar, Toast, Spinner, Skeleton, FileUpload, ThemeSwitcher, (index barrel export)

**New shared components to create (10):**
| Component | Used by pages |
|-----------|---------------|
| `StatusBadge` | Dashboard, Projects, AI Workspace, Clients, Finances, Client Portal, Contracts, Analytics |
| `StatCard` | Dashboard, Finances, Analytics, Client Portal |
| `DataTable` | Clients, Finances, Bookings, Analytics, Contracts |
| `EmptyState` | All 12 pages |
| `CommandBar` | All pages (mounted in dashboard layout) |
| `PageHeader` | All 12 pages |
| `KanbanBoard` | Clients, Bookings |
| `DateRangePicker` | Analytics, Finances, Booking, Content Hub |
| `SearchFilterBar` | Projects, Clients, Finances, Bookings |
| `ConfirmDialog` | Contracts, Settings, Clients, Projects |

**Total shared: 22** (12 existing + 10 new)

### Total New Page-Specific Components

| Page | New components | Existing reused |
|------|---------------|-----------------|
| 1. Dashboard | 4 | 12 |
| 2. Projects | 2 | 5 |
| 3. AI Workspace | 10 | 10 |
| 4. Gallery Builder | 8 | 3 |
| 5. Booking | 7 | 2 |
| 6. Clients & CRM | 6 | 0 |
| 7. Contracts | 7 | 0 |
| 8. Finances | 7 | 1 |
| 9. Analytics | 7 | 0 |
| 10. Content Hub | 7 | 0 |
| 11. Client Portal | 7 | 7 |
| 12. Settings | 9 | 2 |
| **Total** | **~81 new** | **~42 existing reused** |

### Highest Reuse Potential (pages sharing the most components)

1. **Dashboard ↔ Finances ↔ Analytics** — share `StatCard`, `RevenueChart` pattern, date filtering
2. **Projects ↔ Clients ↔ Booking** — share `SearchFilterBar`, `StatusBadge`, `DataTable`
3. **AI Workspace ↔ Gallery Builder ↔ Client Portal** — share media display components (`PhotoGrid`, `MediaCard`, `Lightbox`, `GalleryView`)
4. **Contracts ↔ Booking ↔ Settings** — share form patterns, `ConfirmDialog`

### Architectural Concerns & Open Questions

1. **Font decision required:** Plus Jakarta Sans only (per PLAN.md) vs current Inter + Geist stack. Must resolve before any page work. Affects all 12 pages.

2. **ProjectStatus migration needed:** 3 statuses → 10 stages. Blocks StatusBadge on pages 1, 2, 3, 6, 8, 11. Should be first DB migration.

3. **DashboardV2 token migration:** Hardcoded colors must be replaced with CSS variable tokens before Dashboard work progresses. Affects all dashboard-v2 components.

4. **Missing DB tables:** ~17 new tables needed across all phases. Should be planned as migrations per phase, not all at once.

5. **Chart library choice:** Finances (RevenueDashboard) and Analytics both need charts. Recommend a single lightweight library (recharts at ~45KB gzipped) added once and shared.

6. **Drag-and-drop library:** KanbanBoard (Clients), ContentCalendar (Content Hub), and QuestionnaireBuilder (Contracts) all need drag-drop. Recommend dnd-kit (lightweight, accessible, React 18 compatible).

7. **AI API routes:** Pages 1, 3, 5, 7, 9, 10, 12 have AI features. Need to decide: server-side AI (API routes calling external LLM) vs browser-side (existing Transformers.js for classification). Caption generation, contract filling, and NL parsing likely need server-side LLM calls.

8. **E-signature legal compliance:** Page 7 (Contracts) proposes e-signature. Legal validity depends on jurisdiction. Consider using an established service (DocuSign API, HelloSign) rather than building from scratch.

9. **Social platform integrations:** Page 10 (Content Hub) requires OAuth connections to Instagram, Facebook, TikTok, Pinterest. Each has different API requirements and review processes. This is why it's v3+.
