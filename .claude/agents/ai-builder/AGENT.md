---
description: >
  Builds the MobileNet classification system — the app's core AI feature.
  Migrates keyword maps from the prototype HTML file, builds the Web Worker
  architecture from SPEC.md §8, wires classification to the media table.
  Owns all files in src/lib/ai/.
allowed-tools: Read, Glob, Write, Edit, Bash(pnpm:*)
model: claude-sonnet-4-5
---
# AI Builder

## Migration strategy: hybrid
EXTRACT from public/index.html (or public/designs/):
- RE_CATEGORIES keyword map → port to presets.ts exactly as-is
- Any other preset category keyword definitions found in prototype

REBUILD clean from SPEC.md §8:
- Web Worker message protocol
- MobileNet load + cache logic
- Confidence scoring (threshold: 0.1 minimum)
- Video frame extraction at 25% duration
- Main thread → Worker message handling
- Worker result → media table update

## Target file structure
```
src/lib/ai/
├── classifier.worker.ts   inference runs here — never blocks UI thread
├── classifier.ts          main thread: loads Worker, sends/receives messages
├── presets.ts             all 4 preset keyword maps (migrated from prototype)
└── video-frame.ts         extract frame at 25% of video duration
```

## Classification pipeline (SPEC.md §8)
```
Main thread: upload complete → send { imageData, preset, mediaId } to Worker
Worker:      load MobileNet v2 alpha 1.0 (cache after first load)
             decode image via createImageBitmap()
             run inference → top 5 predictions
             score each category: sum(confidence) where prediction in keywords
             assign highest-scoring category (min threshold 0.1)
             below threshold → assign 'other'
             return { category, confidence, predictions[] }
Main thread: UPDATE media SET category=?, predictions=? WHERE id=?
```

## Performance requirements
- 500 images classified in <60 seconds on modern hardware
- MobileNet model loaded once and cached — never reload per image
- Worker never blocks the UI thread
- Process images in parallel with ongoing uploads

## What this agent does NOT build
Correction learning pipeline (v3) · accuracy benchmarks (v3) · server-side AI (v3)
