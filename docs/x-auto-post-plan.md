# Auto-Post to X.com Plan

## Goal
Post a daily sports analytics fact to X.com every day at 8:30 AM ET, fully automatically via Vercel Cron.

## Approach
Single Vercel Cron Job → API route → Claude generates fact via web search → posts to X.

## Tasks

### Task 1: Install twitter-api-v2
- Run: `npm install twitter-api-v2`
- Verify: package.json has `twitter-api-v2` in dependencies

### Task 2: Create vercel.json with cron schedule
- Create `vercel.json` at project root
- Add cron: `"30 13 * * *"` (8:30 AM ET = 13:30 UTC)
- Verify: file exists and is valid JSON

### Task 3: Create .env.example with required variables
- Add to `.env.example`:
  - `ANTHROPIC_API_KEY`
  - `X_API_KEY`
  - `X_API_SECRET`
  - `X_ACCESS_TOKEN`
  - `X_ACCESS_TOKEN_SECRET`
  - `CRON_SECRET`

### Task 4: Create cron API route
- Create `src/app/api/cron/sports-fact/route.ts`
- Validates `CRON_SECRET` from Authorization header
- Determines sport by day of week: Mon=NFL, Tue=NBA, Wed=NHL, Thu=Golf, Fri=NCAAF, Sat=NCAAB, Sun=wildcard
- Calls Anthropic API (claude-sonnet-4-6) with web_search tool to find today's sports news
- Generates witty fact under 260 chars with 1-2 hashtags and "Uselessness Rating: X/10" ending
- Posts to X via twitter-api-v2
- Returns JSON response with result
- Verify: TypeScript compiles without errors

### Task 5: Verify build passes
- Run: `npm run build`
- Fix any TypeScript/lint errors

## Environment Variables Needed (set in Vercel dashboard)
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `X_API_KEY` — from developer.twitter.com
- `X_API_SECRET` — from developer.twitter.com
- `X_ACCESS_TOKEN` — from developer.twitter.com
- `X_ACCESS_TOKEN_SECRET` — from developer.twitter.com
- `CRON_SECRET` — random string, e.g. `openssl rand -hex 32`

## Note on DST
The cron `30 13 * * *` = 8:30 AM ET in winter (UTC-5). During DST (Mar-Nov), clocks shift to UTC-4 so it becomes 9:30 AM ET. Update to `30 12 * * *` during DST months if exact timing matters.
