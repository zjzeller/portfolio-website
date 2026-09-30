# Portfolio Website

Personal portfolio for Zachary Zeller — Senior Data Analyst.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (via `@supabase/ssr` and `@supabase/supabase-js`)
- **Fonts**: Playfair Display, DM Sans, DM Mono (Google Fonts)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Maps**: React Leaflet (loaded via `dynamic()` — SSR disabled)
- **Deployment**: Vercel

## Project Structure

```
src/
  app/           # Next.js App Router pages and API routes
    api/
      analytics/track/  # POST endpoint for page view tracking
      resume/           # PDF proxy route (bypasses X-Frame-Options)
    about/
    contact/
    projects/
      brown-vs-tatum/
      sf-food-map/
    resume/
  components/
    analytics/    # PageViewTracker, ResumeTracker
    charts/       # Recharts wrappers (SeasonLineChart, ComparisonBarChart, PlayerRadarChart, ClutchChart, RetentionCharts incl. CohortHeatmap)
    layout/       # Header, Footer
    map/          # SFMapClient (leaflet), SpotDetailPanel, SpotListItem
    ui/           # Button (only reusable UI component so far)
  data/           # Static data + helper functions (sf-food-spots.ts, projects.ts)
  hooks/          # Custom React hooks
  lib/
    supabase/     # Supabase client helpers
    constants.ts  # SITE_CONFIG (name, title, links)
    utils.ts
  types/          # TypeScript types (Project, FoodSpot, etc.)
```

## Workflow Rules

- Use `npm` (not bun, yarn, or pnpm)
- Run `npm run lint` to lint before committing
- Run `npm run build` to verify TypeScript compiles (lint alone does not catch type errors)
- Do not auto-commit or auto-push — always ask first
- Do not add features beyond what is requested
- No test framework exists — use `npm run build` as the verification step

## Design System

### CSS Variables (defined in `src/app/globals.css`)

```
--bg              #0f1419   page background (dark slate)
--bg-surface      #161c24   card/surface background
--bg-elevated     #1d2530   hover state, elevated surface
--border          #2e3947   primary border
--border-subtle   #222b36   light dividers
--text-primary    #e6e9ee   headings, body
--text-secondary  #b4bcc8   supporting text
--text-muted      #7f8a99   captions, labels
--accent          #8fb3e0   primary accent (steel blue)
--accent-dim      #a9c5ea   hover accent
--accent-contrast #0f1419   text on top of the accent (e.g. primary button)
--highlight       #6fa3b8   secondary accent
--highlight-dim   #5b8ba0   hover highlight
```

Chart colors live in `src/lib/chartTheme.ts` (Recharts needs literal hex values). Keep them in sync with the tokens above.

Always use CSS variables for color, never raw hex values (e.g., `text-[var(--accent)]` not `text-[#1e3a5f]`).

### Utility Classes (defined in `src/app/globals.css`)

- `.section-label` — small all-caps monospace label (e.g. "Projects", "Tools Used")
- `.editorial-rule` — 2px gradient horizontal rule (`w-16 mt-6` is standard usage)
- `.metric` — monospace styling for stats/numbers inline in prose
- `.animate-reveal` — fade-up entrance animation
- `.animate-reveal-delay-1` through `.animate-reveal-delay-5` — staggered delays (0.1s–0.5s)
- `.grid-bg` — animated grid background pattern

### Font Usage

```tsx
// Playfair Display — headings
className="font-[family-name:var(--font-playfair)]"

// DM Mono — code, stats, labels, badges
className="font-[family-name:var(--font-dm-mono)]"

// DM Sans — body (default, no class needed)
```

### Tag / Badge Patterns

**Index card tags** (ghost pills, used on `/projects` and homepage cards). No `uppercase`: tags like "dbt" must keep their real casing.
```tsx
className="text-xs px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]"
```

**Tool badges** (filled tinted chips — used on project detail pages):
```tsx
className="font-[family-name:var(--font-dm-mono)] text-xs px-3 py-1 rounded border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]"
```

## Data & Types Conventions

- **Types** live in `src/types/` (e.g. `src/types/projects.ts`, `src/types/food-spots.ts`)
- **Data** lives in `src/data/` and imports types from `src/types/`
- Helper functions that operate on data arrays live in the data file (e.g. `requireProject()` in `src/data/projects.ts`)
- `requireProject(href)` — finds a project by href and throws a descriptive error if not found (use this instead of `.find()!` on project detail pages)

## Analytics

Every page must include `<PageViewTracker pagePath="..." pageTitle="..." />` from `@/components/analytics/PageViewTracker`. This tracks page views via the `/api/analytics/track` route to Supabase.

## Page Titles & Link Previews

- Set a page's title and description with `pageMetadata(title, description)` from `src/lib/metadata.ts`. It keeps the site name and preview image that Next.js would otherwise drop.
- Server pages: `export const metadata = pageMetadata(...)`. Client pages (`'use client'`) can't export metadata, so put it in a `layout.tsx` next to the page.
- Default preview image: `src/app/opengraph-image.png` (1200x630). A route can pass its own image as the third argument (see the customer-retention page).
- Copy: no em dashes in visible text.

## Page Conventions

- Interactive pages (client state, hooks, maps) use `'use client'` at the top
- Static pages (most pages) are server components by default
- Page layout: `<div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-4xl">`
- Sections open with a `<span className="section-label">`, then Playfair heading, then `.editorial-rule`

## Environment Variables

See `.env.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
