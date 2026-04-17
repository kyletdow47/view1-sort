# Bundle Baseline — 2026-04-17

Captured via `@next/bundle-analyzer` on branch `feat/dev-agent/D1.8-bundle-analyzer`.

## Snapshots

- `client.html` — browser bundle (all code shipped to the user)
- `nodejs.html` — Node.js server/runtime bundle (Route Handlers, Server Components)
- `edge.html` — Edge runtime bundle (proxy/middleware)

Open any file in a browser to explore chunk sizes interactively.

## How this was captured

```bash
npm run analyze
```

That script resolves to `ANALYZE=true next build --webpack`. Two flags matter:

- `ANALYZE=true` — enables the `@next/bundle-analyzer` wrapper in `next.config.mjs`
  and writes reports to `.next/analyze/`.
- `--webpack` — Next.js 16 defaults to Turbopack for `build`, but bundle-analyzer
  is Turbopack-incompatible. The webpack fallback is required to emit reports.

The analyze script also toggles `typescript.ignoreBuildErrors` and
`eslint.ignoreDuringBuilds` so the baseline can be captured even if pre-existing
type/lint errors remain. Regular `npm run build` still enforces both.

## Environment at capture time

- Node: output of `node --version` at capture (v20+)
- Next.js: `16.2.1`
- React: `19.2.4`
- `@next/bundle-analyzer`: `16.2.4`
