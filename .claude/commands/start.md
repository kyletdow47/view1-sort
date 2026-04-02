Read STATE.md, SPEC.md, and docs/strategy/ARCHITECTURE-DECISIONS.md.
Run the 10pm startup sequence:
1. Read STATE.md
2. Read docs/strategy/ARCHITECTURE-DECISIONS.md — all 8 architecture decisions are resolved here (fonts, AI, status enum, charts, drag-drop, e-signature, 17 DB tables, hardcoded colors precondition)
3. git diff HEAD~1 -- "*.pen" to find Pencil changes
4. Dispatch task-sync to create tasks from any Pencil structural changes
5. Check Asana queue, refresh from SPEC.md + docs/strategy/APP-ARCHITECTURE.html if empty
6. Record session start timestamp
7. Check weekly cap status
8. Fix broken items from STATE.md first — DashboardV2 hardcoded colors is priority zero before design-extractor runs
9. Send Telegram: "🌙 Starting build. [N] tasks. See you at 8am."
10. Begin task loop

Run until 8am. Send morning check-in sequence when done.
Halt only on CRITICAL security or two consecutive failures on same file.
