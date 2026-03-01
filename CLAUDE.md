# Portfolio Website

Personal portfolio for Zachary Zeller — Senior Data Analyst.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (via `@supabase/ssr` and `@supabase/supabase-js`)
- **Fonts**: Playfair Display, DM Sans, DM Mono (Google Fonts)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Project Structure

```
src/
  app/           # Next.js App Router pages and API routes
    api/
      analytics/ # Analytics API route
    about/
    contact/
    projects/
    resume/
  components/
    analytics/
    charts/
    layout/      # Header, Footer
    ui/          # Reusable UI components
  data/          # Static data files
  hooks/         # Custom React hooks
  lib/
    supabase/    # Supabase client helpers
    constants.ts # SITE_CONFIG (name, links, etc.)
    utils.ts
  types/
```

## Workflow Rules

- Use `npm` (not bun, yarn, or pnpm)
- Run `npm run dev` to start local dev server
- Run `npm run lint` to lint before committing
- Do not auto-commit or auto-push — always ask first
- Do not add features beyond what is requested

## Environment Variables

See `.env.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
