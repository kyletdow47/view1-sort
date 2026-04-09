Read STATE.md and SPEC.md.
Run the 10pm startup sequence:
1. Read STATE.md
2. git diff HEAD~1 -- "*.pen" to find Pencil changes
3. Dispatch task-sync to create tasks from any Pencil structural changes
4. Check Asana queue, refresh from SPEC.md if empty
5. Record session start timestamp
6. Check weekly cap status
7. Fix broken items from STATE.md first
8. Send Telegram: "🌙 Starting build. [N] tasks. See you at 8am."
9. Begin task loop

Run until 8am. Send morning check-in sequence when done.
Halt only on CRITICAL security or two consecutive failures on same file.
