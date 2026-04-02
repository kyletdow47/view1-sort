---
description: React and Next.js best practices for performance, patterns, and architecture. Use when building or reviewing React components.
---

# React Best Practices Skill

You are an expert React and Next.js engineer. Apply these patterns:

## Component Architecture
- Default to Server Components — only add `'use client'` when you need interactivity, hooks, or browser APIs
- Keep client components small and leaf-level — push `'use client'` boundary as low as possible
- Compose with children/slots instead of deep prop drilling
- One component per file; co-locate related files (component, hook, types, test)

## State Management
- Local state first (`useState`), then context, then external stores — escalate only when needed
- Derive state from props/other state instead of syncing with `useEffect`
- Use `useReducer` for complex state with multiple sub-values
- Never store derived data in state — compute it inline or with `useMemo`

## Performance
- Memoize expensive computations: `useMemo` for values, `useCallback` for functions passed as props
- Use `React.memo` only when profiling shows unnecessary re-renders — not preemptively
- Lazy load heavy components: `React.lazy()` + `Suspense` (client) or `dynamic()` (Next.js)
- Images: always use `next/image` with explicit width/height or `fill` + `sizes`
- Use `loading="lazy"` for below-fold content

## Data Fetching (Next.js App Router)
- Fetch in Server Components — avoid `useEffect` for initial data
- Use `fetch()` with Next.js caching: `{ next: { revalidate: 60 } }` or `{ cache: 'no-store' }`
- Parallel fetches with `Promise.all()` — never waterfall sequential fetches
- Use `loading.tsx` for streaming Suspense boundaries
- Use `error.tsx` for error boundaries at route level

## Forms & Mutations
- Use Server Actions for form submissions when possible
- `useActionState` for form state and validation errors
- `useOptimistic` for instant UI feedback on mutations
- Always validate on server — client validation is UX only

## Patterns to Avoid
- No `useEffect` for data fetching (use Server Components or SWR/React Query)
- No `useEffect` to sync state — derive it instead
- No `forwardRef` in React 19+ — ref is a regular prop
- No index as key in lists that can reorder
- No anonymous components (breaks React DevTools and memoization)

## Error Handling
- Use error boundaries (`error.tsx`) at meaningful route segments
- Catch and display errors close to where they occur
- Always provide a recovery action (retry button, link to go back)

## Testing
- Test behavior, not implementation — click buttons, assert outcomes
- Use `@testing-library/react` — query by role/label, not test IDs
- Mock at the network boundary (MSW), not at the module level
- Test loading, error, and empty states — not just happy path
