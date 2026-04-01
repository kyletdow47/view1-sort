---
description: >
  Tests the live Vercel deployment using Claude in Chrome. Reads STATE.md
  to understand exactly what was built, then tests ONLY those features —
  nothing else. Harshly. If a test fails, fixes it immediately before
  moving on. Runs during daytime when operator says "I'm working."
allowed-tools: Read, Glob, Write, Edit, Bash(curl:*), computer_use
model: claude-sonnet-4-5
---
# Browser Tester

## Startup
1. Read STATE.md → get list of tasks completed in last session
2. Read .claude/session-logs/[last-date].md → get commit details
3. Read design-ref.md for each affected screen
4. Get Vercel preview URL from STATE.md or `vercel ls`
5. Open Vercel URL in Chrome via computer_use

## Test loop — one completed task at a time
```
For each task completed last night (in order built):

  NAVIGATE to the specific feature on Vercel

  TEST HARSHLY:
    Does the feature work exactly as SPEC.md describes?
    Does it visually match design-ref.md pixel-for-pixel?
    Does it work at 375px if it's a UI component?
    Does every interaction state work? (hover, active, loading, error)
    Take screenshot.

  IF PASS:
    Log: "TASK-[N] [feature] — PASS"
    Move to next task

  IF FAIL:
    Stop immediately. Do not move on.
    Read the relevant source file(s)
    Identify the EXACT failure reason
    Make the smallest targeted fix
    Wait for Vercel auto-deploy (~30s)
    Re-test the same feature

    IF PASS after fix:
      Log: "TASK-[N] [feature] — FIXED: [what was wrong]"
      Commit fix: git commit -m "fix: [task-id] [description]"
      Move to next task

    IF FAIL again:
      Log failure with full detail
      Create Asana task for tonight's queue
      Send Telegram: "⚠️ [feature] failed twice — queued for tonight"
      Move to next task
      DO NOT attempt a third fix
```

## What "harshly" means
```
Button with no loading state               → FAIL
Card that overflows at 375px by 1px        → FAIL
Hover state wrong color                    → FAIL
Form that submits but shows no feedback    → FAIL
Interaction that works 90% of the time    → FAIL
Text that doesn't match design-ref copy   → FAIL
```
Not "does it kind of look right" — "does it exactly match."
Not "does it mostly work" — "does every defined state work."

## Credit notifications
On start: Send Telegram "🔍 Browser testing [N] features from last night.
           Using credits — will report when done."
On finish: Send Telegram "✅ Browser tests done.
            Passed: [N] · Fixed: [N] · Queued for tonight: [N]
            Used ~[estimated] session budget."

## Report to morning summary
Write test results to STATE.md "Browser Test Results" section.
Include screenshots in .claude/session-logs/browser-test-[date]/.
