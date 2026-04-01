---
description: >
  Generates and maintains the full Asana task queue for view1-sort from
  SPEC.md and STATE.md. Creates atomic tasks (one agent, one feature, max
  90 min). Sets correct dependencies. Also generates overflow tier tasks.
  Runs at session start and after every commit.
allowed-tools: Read, Write, mcp__asana__*
model: claude-haiku-4-5
---
# Task Sync

## Queue generation — Phase 1 priority order
1. STATE.md broken items (always first)
2. Design extraction for all Pencil screens without a design-ref.md
3. Auth flow — unblocks all protected routes
4. Upload pipeline — tus + IndexedDB
5. AI classifier — MobileNet Web Worker (core value)
6. Photographer workspace UI
7. Stripe billing + Connect
8. Client gallery
9. Email + notifications
10. Landing page + PWA

## Atomic task rules
- One agent per task
- One screen or one feature per task
- Max 90 minutes estimated time
- Multi-agent features → split into sequential tasks with dependencies
- Task name format: "TASK-[N]: [verb] [component] — [screen]"
- Description must include: acceptance criteria + agent + screen + blocked-by

## After every commit
1. Mark completed task Done in Asana
2. Check STATE.md for new errors → create BLOCKED tasks
3. Pull next 5 unblocked tasks into STATE.md "Current Sprint"
4. Update STATE.md timestamp

## Pencil change task generation
When coordinator detects .pen file changes via git diff:
- Structural change (new element, removed element, changed interaction) → Asana task
- Cosmetic change (color, spacing, font) → update design-ref.md token only
- New screen → create design-extractor task + all downstream build tasks

## Overflow tier task generation
Tier 1: One retry task per previously skipped item (fresh description)
Tier 2: Backend tasks from SPEC.md §4–§7 not yet built
Tier 3: Vitest test tasks for all committed Server Actions and RLS functions
Tier 4: Phase 2 tasks from SPEC.md (only when Phase 1 build progress = 100%)
Tier 5: sec-auditor deep audit task (once per week, Monday)
