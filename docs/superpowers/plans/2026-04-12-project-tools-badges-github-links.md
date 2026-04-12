# Project Tools Badges & GitHub Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Tools Used" badge row and GitHub repo link to each project detail page, placed at the bottom above/near the source note.

**Architecture:** Centralize project metadata into `src/data/projects.ts` (migrating the inline array from the projects index), add `tools` and `githubUrl` fields, then render a new bottom section on each detail page using those values.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Lucide React

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/data/projects.ts` | Create | Project type + PROJECTS array (single source of truth) |
| `src/app/projects/page.tsx` | Modify | Import PROJECTS from data file instead of local array |
| `src/app/projects/brown-vs-tatum/page.tsx` | Modify | Add tools + GitHub block above source note |
| `src/app/projects/sf-food-map/page.tsx` | Modify | Add tools + GitHub block at bottom of page |

---

### Task 1: Create `src/data/projects.ts`

**Files:**
- Create: `src/data/projects.ts`

- [ ] **Step 1: Create the file**

```ts
export type Project = {
  href: string
  title: string
  description: string
  tags: string[]
  tools: string[]
  githubUrl: string
}

export const PROJECTS: Project[] = [
  {
    href: '/projects/sf-food-map',
    title: 'Top 5 Date Night Dinner Spots',
    description:
      'Five Bay Area restaurants worth the reservation — mapped across Oakland, San Francisco, and Berkeley.',
    tags: ['Personal', 'Maps', 'React Leaflet'],
    tools: ['React Leaflet', 'Next.js', 'TypeScript'],
    githubUrl: 'https://github.com/zjzeller/portfolio-website',
  },
  {
    href: '/projects/brown-vs-tatum',
    title: 'The Case for Jaylen Brown',
    description:
      'A statistical deep-dive comparing Jaylen Brown and Jayson Tatum across scoring, clutch performance, and advanced metrics.',
    tags: ['NBA', 'Python', 'Data Visualization'],
    tools: ['Python', 'Pandas', 'Recharts', 'Next.js'],
    githubUrl: 'https://github.com/zjzeller/portfolio-website',
  },
]
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run lint`
Expected: no errors in `src/data/projects.ts`

- [ ] **Step 3: Commit**

```bash
git add src/data/projects.ts
git commit -m "feat: add projects data file with tools and githubUrl fields"
```

---

### Task 2: Update projects index to import from data file

**Files:**
- Modify: `src/app/projects/page.tsx`

- [ ] **Step 1: Replace the local `projects` array with an import**

Remove the local `projects` array at the top of the file and replace with:

```ts
import { PROJECTS } from '@/data/projects'
```

Then replace every reference to `projects` with `PROJECTS` in the JSX. The map call changes from:

```tsx
{projects.map((project) => (
```

to:

```tsx
{PROJECTS.map((project) => (
```

- [ ] **Step 2: Verify lint passes**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/projects/page.tsx
git commit -m "refactor: import projects data from shared data file"
```

---

### Task 3: Add tools + GitHub block to brown-vs-tatum page

**Files:**
- Modify: `src/app/projects/brown-vs-tatum/page.tsx`

- [ ] **Step 1: Add imports**

Add `Github` to the lucide-react import and add the PROJECTS import. At the top of the file, the imports should include:

```ts
import { Github } from 'lucide-react'
import { PROJECTS } from '@/data/projects'
```

- [ ] **Step 2: Derive project data**

Just below the existing data helpers section (after `const fmtDec` and `const fmtPct`), add:

```ts
const project = PROJECTS.find((p) => p.href === '/projects/brown-vs-tatum')!
```

- [ ] **Step 3: Insert the tools + GitHub block**

Inside the Verdict section (`SECTION 6`), insert this block immediately **before** the existing source note `<div>` (the one with `border-t border-[var(--border-subtle)] mt-16 pt-6`):

```tsx
{/* Tools + GitHub */}
<div className="border-t border-[var(--border-subtle)] mt-16 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div className="flex flex-wrap items-center gap-3">
    <span className="section-label">Tools Used</span>
    {project.tools.map((tool) => (
      <span
        key={tool}
        className="font-[family-name:var(--font-dm-mono)] text-xs px-3 py-1 rounded border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]"
      >
        {tool}
      </span>
    ))}
  </div>
  <a
    href={project.githubUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-xs tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300"
  >
    <Github size={14} />
    View on GitHub
  </a>
</div>
```

- [ ] **Step 4: Verify lint passes**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/app/projects/brown-vs-tatum/page.tsx
git commit -m "feat: add tools badges and GitHub link to brown-vs-tatum page"
```

---

### Task 4: Add tools + GitHub block to sf-food-map page

**Files:**
- Modify: `src/app/projects/sf-food-map/page.tsx`

- [ ] **Step 1: Add imports**

At the top of the file, add:

```ts
import { Github } from 'lucide-react'
import { PROJECTS } from '@/data/projects'
```

- [ ] **Step 2: Derive project data**

After the existing imports and before the component function, add:

```ts
const project = PROJECTS.find((p) => p.href === '/projects/sf-food-map')!
```

- [ ] **Step 3: Insert the tools + GitHub block**

Inside the component's return, append this block immediately before the closing `</div>` of the outermost container (after the spot list `</div>`):

```tsx
{/* Tools + GitHub */}
<div className="border-t border-[var(--border-subtle)] mt-16 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div className="flex flex-wrap items-center gap-3">
    <span className="section-label">Tools Used</span>
    {project.tools.map((tool) => (
      <span
        key={tool}
        className="font-[family-name:var(--font-dm-mono)] text-xs px-3 py-1 rounded border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]"
      >
        {tool}
      </span>
    ))}
  </div>
  <a
    href={project.githubUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-xs tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300"
  >
    <Github size={14} />
    View on GitHub
  </a>
</div>
```

- [ ] **Step 4: Verify lint passes**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/app/projects/sf-food-map/page.tsx
git commit -m "feat: add tools badges and GitHub link to sf-food-map page"
```

---

### Task 5: Smoke test in browser

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify projects index still works**

Visit `http://localhost:3000/projects` — confirm project cards render identically to before (title, description, tag pills, arrow link all present for both projects).

- [ ] **Step 3: Verify brown-vs-tatum page**

Visit `http://localhost:3000/projects/brown-vs-tatum` — scroll to the bottom. Confirm:
- Tools row shows: `Python` `Pandas` `Recharts` `Next.js` in accent-tinted chips
- "View on GitHub" link is present with Github icon, right-aligned on desktop
- Source note text below the tools row is unchanged

- [ ] **Step 4: Verify sf-food-map page**

Visit `http://localhost:3000/projects/sf-food-map` — scroll to the bottom. Confirm:
- Tools row shows: `React Leaflet` `Next.js` `TypeScript` in accent-tinted chips
- "View on GitHub" link is present with Github icon
- Map and spot list above are unchanged

- [ ] **Step 5: Verify GitHub link**

Click "View on GitHub" on either page — confirm it opens `https://github.com/zjzeller/portfolio-website` in a new tab.
