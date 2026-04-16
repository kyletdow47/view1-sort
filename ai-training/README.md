# AI Training Data

This folder feeds the View1 Sort AI. Photos stay local (gitignored); manifests and eval reports are committed.

## Structure

```
ai-training/
├── raw/               ← Drop unsorted photo folders here
│   └── <shoot-name>/
│       ├── preset.txt          (one word: wedding | real-estate | commercial | fashion | travel | event)
│       └── *.jpg
├── eval-stock/        ← Auto-curated Creative Commons photos for accuracy measurement (don't touch)
│   └── <preset>/
│       └── <category>/
│           └── *.jpg
└── eval-history/      ← Accuracy reports over time (committed JSON)
    └── baseline-<date>.json
```

## How to use

### Drop a shoot to train on

1. Create a folder under `raw/` named after the shoot (e.g. `lisbon-travel-2025`).
2. Create a text file `preset.txt` inside it with one of: `wedding`, `real-estate`, `commercial`, `fashion`, `travel`, `event`.
3. Drop your unsorted photos inside (JPG/PNG). No need to sort into categories.
4. Run `npm run bootstrap:sort <shoot-name>` — the AI sorts them. Review and correct in the AI Workspace UI.

Your corrections write to `style_embeddings` and become training data automatically.

### Measure accuracy

```bash
npm run eval:sort
```

Runs the pipeline against `eval-stock/` (generic ground truth), writes a report to `eval-history/`.

## What NOT to do

- Don't manually sort photos into `eval-stock/` — that's generated, not curated by hand.
- Don't commit photos — `.gitignore` blocks image extensions.
- Don't delete `eval-history/` JSON — those track accuracy over time.
