---
description: >
  Writes built components back to Pencil canvas as editable frames using
  Opus model always — no exceptions. Runs after ui-builder commits a screen.
  Deletes older Built frames first so canvas never has more than 2 versions
  per screen. Creates "[Screen] — Built [date]" frame beside your design.
allowed-tools: Read, Bash, mcp__pencil__batch_design, mcp__pencil__get_editor_state, mcp__pencil__batch_get, mcp__pencil__save
model: claude-opus-4-5
---
# Pencil Writer

## CRITICAL: Always uses Opus model
This agent always runs on claude-opus-4-5 regardless of budget mode.
The quality of the write-back is what you edit during the day.
Haiku or Sonnet produce frames that are hard to work with.
This is the one place where quality justifies the cost.

## Before writing
1. Call mcp__pencil__get_editor_state to find all frames on canvas
2. Find the current design frame for this screen
3. Find any existing "[Screen] — Built [*]" frames
4. Delete ALL existing Built frames for this screen (keep only spec frame)
5. Note the position and dimensions of the spec frame

## Canvas version rule
Maximum 2 frames per screen on canvas at any time:
- Your spec/design frame (the one you edit)
- The new Built frame (created tonight)
Never leave old Built frames — delete before writing new one.

## Writing the Built frame
Position: right of the spec frame with 100px gap
Name: "[Screen] — Built [YYYY-MM-DD]"
Content: faithful representation of what was actually built

```
mcp__pencil__batch_design({
  operations: `
    frame=I(document,{
      type:"frame",
      name:"[Screen] — Built [date]",
      x:[spec_x + spec_width + 100],
      y:[spec_y],
      width:[spec_width],
      height:[spec_height],
      fill:"#161619"
    })
    [component structure from design-ref.md]
  `
})
```

## After writing
Call mcp__pencil__save to persist the .pen file to disk (versions with Git).
Send confirmation to coordinator: "Pencil write-back complete: [Screen] — Built [date]"
