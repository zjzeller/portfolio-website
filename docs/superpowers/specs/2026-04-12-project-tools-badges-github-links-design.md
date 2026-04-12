# Project Tools Badges & GitHub Links

**Date:** 2026-04-12  
**Status:** Approved

## Summary

Add a "Tools Used" badge row and a GitHub repo link to each project detail page, placed near the bottom of the page above the existing source note section.

## Data Layer

Create `src/data/projects.ts` with a `Project` type and `PROJECTS` array. This consolidates the project metadata currently defined inline in `src/app/projects/page.tsx` and adds two new fields:

```ts
type Project = {
  href: string
  title: string
  description: string
  tags: string[]
  tools: string[]
  githubUrl: string
}
```

All projects link to the same GitHub repo: `https://github.com/zjzeller/portfolio-website`

### Project entries

| Project | tools |
|---|---|
| The Case for Jaylen Brown | Python, Pandas, Recharts, Next.js |
| Top 5 Date Night Dinner Spots | React Leaflet, Next.js, TypeScript |

The index page (`src/app/projects/page.tsx`) imports `PROJECTS` from this file — no behavior change, data moved out of the component.

## UI

Each project detail page imports its own `PROJECTS` entry and renders a new block at the bottom of the page:

- **brown-vs-tatum**: inserted just above the existing source note `<div>` (inside the Verdict section)
- **sf-food-map**: appended as a new `<div>` at the bottom of the page (no existing source note)

### Layout

- **Row**: `"Tools Used"` label (existing `section-label` class) + badge chips, with GitHub link right-aligned
- **Mobile**: stacks vertically (label+badges on top, GitHub link below)

### Badge style

Filled tinted chips — visually distinct from the ghost pills on the project index:

```
bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20
rounded font-[family-name:var(--font-dm-mono)] text-xs px-3 py-1
```

### GitHub link

```
<Github size={14} /> View on GitHub
```

Color: `text-[var(--text-muted)]` with hover `text-[var(--accent)]`, opens in new tab.

## Files Changed

| File | Change |
|---|---|
| `src/data/projects.ts` | New — project metadata with tools + githubUrl |
| `src/app/projects/page.tsx` | Import `PROJECTS` from data file instead of local array |
| `src/app/projects/brown-vs-tatum/page.tsx` | Add tools + GitHub block above source note |
| `src/app/projects/sf-food-map/page.tsx` | Add tools + GitHub block above source note |

## Out of Scope

- No new component file (markup is inline — small enough not to warrant extraction)
- No tools badges on the project index cards
