# AI Sorting System — Build Report

**Branch:** `feat/ai-sort/complete-ai-sort-implementation`
**Date:** 2026-04-09
**Tests:** 533 passing across 49 test files
**TypeScript:** 0 errors in new/modified files (2 pre-existing errors in initial-commit files unrelated to AI pipeline)

---

## What Was Built

A complete client-side AI photo classification and sorting pipeline for View1 Sort, using TensorFlow.js MobileNet v2. Photos are categorized automatically into photographer-specific presets (real estate, wedding, travel, general) without any server round-trips.

---

## Files Created / Modified

### New Files

| File | Purpose |
|------|---------|
| `src/lib/ai/presets.ts` | Category preset definitions — 4 niches × keyword maps for MobileNet ImageNet labels |
| `src/lib/ai/video-frame.ts` | Video frame extraction (HTMLVideoElement + Canvas), RAW/HEIC detection, browser-decodability checks |
| `src/lib/ai/classifier-v2.ts` | MobileNet model loader + classifyImage/classifyFile (separate from old CLIP classifier) |
| `src/lib/ai/classifier.worker.ts` | Web Worker — runs MobileNet inference off the main thread |
| `src/lib/ai/use-classifier.ts` | Worker lifecycle helpers: createClassifierWorker, classifyViaWorker, terminateClassifierWorker |
| `src/lib/ai/classification-pipeline.ts` | ClassificationPipeline — sequential queue with isolated failure handling |
| `src/lib/ai/use-classification.ts` | React hook wrapping pipeline, persists results to Supabase via editMedia |
| `src/lib/ai/__tests__/presets.test.ts` | 42 tests for preset definitions and matchPredictionToCategory |
| `src/lib/ai/__tests__/video-frame.test.ts` | 29 tests for isVideoFile, isRawFile, isBrowserDecodable, extractVideoFrame |
| `src/lib/ai/__tests__/classifier.test.ts` | 8 tests for classifyImage, classifyFile (new MobileNet classifier) |
| `src/lib/ai/__tests__/classifier.worker.test.ts` | Worker message handling tests |
| `src/lib/ai/__tests__/classification-pipeline.test.ts` | Queue, error isolation, stop/start tests |
| `src/lib/ai/__tests__/use-classification.test.ts` | React hook lifecycle, batch classify, DB persistence |
| `src/lib/ai/__tests__/integration.test.ts` | Pure function tests: runAILabel, empty state guard, progress text, approveAll logic |
| `src/lib/ai/__tests__/performance.test.ts` | RAW/HEIC skip, >50MB skip, TF.js failure handling, orientation detection, throughput |
| `src/lib/ai/__tests__/smoke.test.ts` | End-to-end 5-file pipeline smoke test across all scenarios |

### Modified Files

| File | Changes |
|------|---------|
| `src/stores/mediaStore.ts` | Added classification state: classificationStatus, classificationResults, classificationErrors + 6 new actions |
| `src/components/features/AIWorkspace/AIWorkspaceView.tsx` | Progress label shows photo count; handleApproveAll implemented; empty state guard added |

---

## Architecture

```
Upload → classifyFile() called per file
           ↓
    ClassificationPipeline (sequential queue)
           ↓
    classifyFile() from classifier-v2.ts
           ├─ RAW/HEIC/large → return { category: 'other', skipped: true, skipReason }
           ├─ video/mp4 → extractVideoFrame() → classifyImage()
           └─ image → HTMLImageElement → classifyImage()
                           ↓
                    MobileNet.classify() → top 5 predictions
                           ↓
                    matchPredictionToCategory() → { category, confidence }
           ↓
    onResult callback → mediaStore.setClassified() + editMedia() → Supabase
```

---

## File Format Handling

| Format | Detection | Action |
|--------|-----------|--------|
| JPEG, PNG, WEBP, TIFF | `isBrowserDecodable()` → true | Full MobileNet classification |
| RAW (.raw, .cr2, .nef, .arw, .dng) | `isRawFile()` → true | Skip — assign `other`, skipReason: `raw_format` |
| HEIC, HEIF | `isRawFile()` → true | Skip — assign `other`, skipReason: `raw_format` |
| Video (.mp4, .mov, .webm) | `isVideoFile()` → true | Extract frame at 25% duration, then classify |
| Files > 50MB | `isBrowserDecodable()` → false | Skip — assign `other`, skipReason: `file_too_large` |

---

## Category Presets

Each preset has `video` and `other` as the final two catch-all categories.

- **real_estate** (10 categories): exterior, interior, kitchen, bathroom, drone_aerial, pool_outdoor, landscape, twilight, video, other
- **wedding** (10 categories): ceremony, reception, portraits, getting_ready, details, dance, family, venue, video, other
- **travel** (10 categories): landmarks, street, food, accommodation, nature, people, transport, nightlife, video, other
- **general** (9 categories): people, places, objects, nature, architecture, action, detail, video, other

---

## Workspace Improvements

- **Progress label**: Now shows `Sorting… 43% (150/350 photos)` with photo count
- **handleApproveAll**: Sets `review_flag: 'keep'` for all unflagged media (was a TODO stub)
- **Empty state guard**: Shows "Run AI Sort" CTA when photos are present but none are categorized

---

## Backward Compatibility

The old CLIP-based `classifier.ts` and `worker.ts` are untouched. The new MobileNet classifier lives in `classifier-v2.ts`. Existing `presets.ts` exports (`SortPreset`, `SortCategory`, `BUILT_IN_PRESETS`, `getAllPresets`, `saveCustomPreset`, `getCustomPresets`) are preserved as backward-compatible shims.

---

## Test Summary

| Test File | Tests | Status |
|-----------|-------|--------|
| presets.test.ts | 42 | ✅ |
| video-frame.test.ts | 29 | ✅ |
| classifier.test.ts (v2) | 8 | ✅ |
| classifier.worker.test.ts | ~12 | ✅ |
| classification-pipeline.test.ts | ~15 | ✅ |
| use-classification.test.ts | 10 | ✅ |
| integration.test.ts | 18 | ✅ |
| performance.test.ts | ~20 | ✅ |
| smoke.test.ts | 11 | ✅ |
| **All project tests** | **533** | **✅** |

---

## How to Test End-to-End

1. Start dev server: `npm run dev`
2. Create a project, navigate to the AI Workspace
3. Upload a mix of: JPEG photos, a `.cr2` RAW file, and a `.mp4` video
4. Click "Run AI Sort"
5. Verify:
   - JPEG photos appear in category columns (kitchen, exterior, etc.)
   - The `.cr2` file appears in "Other" with no classification attempt
   - The `.mp4` is classified based on its extracted frame
   - Progress shows `Sorting… X% (N/M photos)` with photo count
   - Supabase `media` table rows show `ai_category` and `ai_confidence` values
6. Drag a photo to a different column → verify DB update
7. Click "Approve All" → verify `review_flag: 'keep'` set on all unflagged media
