# Brown vs Tatum Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an editorial data analysis page comparing Jaylen Brown vs Jayson Tatum, integrated into the portfolio site at `/projects/brown-vs-tatum`.

**Architecture:** Python script fetches NBA data from nba_api + Basketball Reference, saves as static JSON. Next.js page imports JSON at build time and renders an editorial article with interactive Recharts visualizations. New `/projects` section added to site navigation.

**Tech Stack:** Python 3 (nba_api, basketball_reference_web_scraper), Next.js 16, React 19, TypeScript, Recharts, Tailwind CSS

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`
- Create: `scripts/requirements.txt`

**Step 1: Install Recharts**

Run:
```bash
cd "/Users/zacharyzeller/Documents/Claude Projects/portfolio-website" && npm install recharts
```

Expected: recharts added to dependencies in package.json

**Step 2: Create Python requirements file**

Create `scripts/requirements.txt`:
```
nba_api>=1.4
requests>=2.31
beautifulsoup4>=4.12
```

**Step 3: Install Python dependencies**

Run:
```bash
pip3 install -r scripts/requirements.txt
```

Expected: All packages installed successfully

**Step 4: Commit**

```bash
git add package.json package-lock.json scripts/requirements.txt
git commit -m "feat: add recharts and python dependencies for NBA analysis"
```

---

### Task 2: Write the Python Data Fetching Script

**Files:**
- Create: `scripts/fetch-nba-data.py`

This is the largest single task. The script fetches data from two sources and outputs a single JSON file.

**Step 1: Create the script**

Create `scripts/fetch-nba-data.py`:

```python
#!/usr/bin/env python3
"""
Fetch NBA career stats for Jaylen Brown and Jayson Tatum.
Sources: nba_api (career, clutch, advanced) + Basketball Reference (PER, WS, BPM, VORP).
Outputs: src/data/brown-vs-tatum.json
"""

import json
import time
import os
import sys
from datetime import datetime

from nba_api.stats.endpoints import (
    playercareerstats,
    leaguedashplayerclutch,
    leaguedashplayerstats,
)

import requests
from bs4 import BeautifulSoup

# Player IDs
PLAYERS = {
    "jaylen_brown": {"id": "1627759", "name": "Jaylen Brown", "draft_year": 2016},
    "jayson_tatum": {"id": "1628369", "name": "Jayson Tatum", "draft_year": 2017},
}

# Seasons to fetch (2016-17 through current)
SEASONS = [f"{y}-{str(y+1)[-2:]}" for y in range(2016, 2026)]

NBA_API_DELAY = 0.7  # seconds between requests
BREF_DELAY = 3.5     # seconds between requests (conservative for 20/min limit)

OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "src", "data", "brown-vs-tatum.json"
)


def fetch_career_stats(player_id: str) -> dict:
    """Fetch per-game career stats (regular season + playoffs) from nba_api."""
    print(f"  Fetching career stats for player {player_id}...")
    career = playercareerstats.PlayerCareerStats(
        player_id=player_id,
        per_mode36="PerGame"
    )
    time.sleep(NBA_API_DELAY)
    result = career.get_dict()

    regular = {}
    playoffs = {}

    # Parse regular season
    rs_headers = result["resultSets"][0]["headers"]
    rs_rows = result["resultSets"][0]["rowSet"]
    for row in rs_rows:
        data = dict(zip(rs_headers, row))
        season = data["SEASON_ID"]
        regular[season] = {
            "gp": data.get("GP"),
            "mpg": data.get("MIN"),
            "ppg": data.get("PTS"),
            "rpg": data.get("REB"),
            "apg": data.get("AST"),
            "spg": data.get("STL"),
            "bpg": data.get("BLK"),
            "tov": data.get("TOV"),
            "fg_pct": data.get("FG_PCT"),
            "fg3_pct": data.get("FG3_PCT"),
            "ft_pct": data.get("FT_PCT"),
        }

    # Parse playoffs (resultSets[2] = SeasonTotalsPostSeason for PerGame)
    if len(result["resultSets"]) > 2:
        po_headers = result["resultSets"][2]["headers"]
        po_rows = result["resultSets"][2]["rowSet"]
        for row in po_rows:
            data = dict(zip(po_headers, row))
            season = data["SEASON_ID"]
            playoffs[season] = {
                "gp": data.get("GP"),
                "mpg": data.get("MIN"),
                "ppg": data.get("PTS"),
                "rpg": data.get("REB"),
                "apg": data.get("AST"),
                "spg": data.get("STL"),
                "bpg": data.get("BLK"),
                "tov": data.get("TOV"),
                "fg_pct": data.get("FG_PCT"),
                "fg3_pct": data.get("FG3_PCT"),
                "ft_pct": data.get("FT_PCT"),
            }

    return {"regular": regular, "playoffs": playoffs}


def fetch_clutch_stats(player_id: str, season: str) -> dict | None:
    """Fetch clutch stats (last 5 min, within 5 pts) for a player in a season."""
    try:
        clutch = leaguedashplayerclutch.LeagueDashPlayerClutch(
            season=season,
            clutch_time="Last 5 Minutes",
            ahead_behind="Ahead or Behind",
            point_diff=5,
            per_mode_detailed="PerGame",
            season_type_all_star="Regular Season",
        )
        time.sleep(NBA_API_DELAY)
        result = clutch.get_dict()
        headers = result["resultSets"][0]["headers"]
        rows = result["resultSets"][0]["rowSet"]

        for row in rows:
            data = dict(zip(headers, row))
            if str(data.get("PLAYER_ID")) == str(player_id):
                return {
                    "gp": data.get("GP"),
                    "pts": data.get("PTS"),
                    "fg_pct": data.get("FG_PCT"),
                    "fg3_pct": data.get("FG3_PCT"),
                    "ft_pct": data.get("FT_PCT"),
                    "plus_minus": data.get("PLUS_MINUS"),
                    "ast": data.get("AST"),
                    "tov": data.get("TOV"),
                }
        return None
    except Exception as e:
        print(f"    Warning: Could not fetch clutch stats for {season}: {e}")
        return None


def fetch_nba_advanced(player_id: str, season: str) -> dict | None:
    """Fetch NBA.com advanced stats for a player in a season."""
    try:
        advanced = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season,
            measure_type_detailed_defense="Advanced",
            per_mode_detailed="PerGame",
        )
        time.sleep(NBA_API_DELAY)
        result = advanced.get_dict()
        headers = result["resultSets"][0]["headers"]
        rows = result["resultSets"][0]["rowSet"]

        for row in rows:
            data = dict(zip(headers, row))
            if str(data.get("PLAYER_ID")) == str(player_id):
                return {
                    "ts_pct": data.get("TS_PCT"),
                    "efg_pct": data.get("EFG_PCT"),
                    "usg_pct": data.get("USG_PCT"),
                    "off_rtg": data.get("OFF_RATING"),
                    "def_rtg": data.get("DEF_RATING"),
                    "net_rtg": data.get("NET_RATING"),
                    "pie": data.get("PIE"),
                }
        return None
    except Exception as e:
        print(f"    Warning: Could not fetch advanced stats for {season}: {e}")
        return None


def fetch_bref_advanced(player_slug: str) -> dict:
    """
    Scrape Basketball Reference advanced stats page for PER, WS, BPM, VORP.
    player_slug: e.g. 'brownja02' for Jaylen Brown, 'tatumja01' for Jayson Tatum
    """
    url = f"https://www.basketball-reference.com/players/{player_slug[0]}/{player_slug}/advanced.html"
    print(f"  Scraping Basketball Reference: {url}")

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    resp = requests.get(url, headers=headers)
    time.sleep(BREF_DELAY)

    if resp.status_code != 200:
        print(f"    Warning: Basketball Reference returned {resp.status_code}")
        return {}

    soup = BeautifulSoup(resp.text, "html.parser")
    table = soup.find("table", {"id": "advanced"})
    if not table:
        print("    Warning: Could not find advanced stats table")
        return {}

    result = {}
    tbody = table.find("tbody")
    if not tbody:
        return result

    for row in tbody.find_all("tr"):
        if row.get("class") and "thead" in row.get("class", []):
            continue
        season_cell = row.find("th", {"data-stat": "season"})
        if not season_cell:
            continue
        season_text = season_cell.get_text(strip=True)

        # Convert "2016-17" format
        per = row.find("td", {"data-stat": "per"})
        ws = row.find("td", {"data-stat": "ws"})
        ws_48 = row.find("td", {"data-stat": "ws_per_48"})
        bpm = row.find("td", {"data-stat": "bpm"})
        vorp = row.find("td", {"data-stat": "vorp"})

        def safe_float(el):
            if el is None:
                return None
            text = el.get_text(strip=True)
            try:
                return float(text)
            except (ValueError, TypeError):
                return None

        result[season_text] = {
            "per": safe_float(per),
            "ws": safe_float(ws),
            "ws_48": safe_float(ws_48),
            "bpm": safe_float(bpm),
            "vorp": safe_float(vorp),
        }

    return result


def build_player_data(key: str, config: dict) -> dict:
    """Build complete data object for one player."""
    print(f"\nFetching data for {config['name']}...")

    # Career stats from nba_api
    career = fetch_career_stats(config["id"])

    # Basketball Reference slugs
    bref_slugs = {
        "jaylen_brown": "brownja02",
        "jayson_tatum": "tatumja01",
    }
    bref_advanced = fetch_bref_advanced(bref_slugs[key])

    # Build per-season data
    seasons = []
    for season in SEASONS:
        # Skip seasons before the player was drafted
        season_start = int(season[:4])
        if season_start < config["draft_year"]:
            continue

        print(f"  Processing {season}...")

        regular = career["regular"].get(season)
        if not regular:
            continue  # Player wasn't active this season

        playoff = career["playoffs"].get(season)
        clutch = fetch_clutch_stats(config["id"], season)
        nba_adv = fetch_nba_advanced(config["id"], season)
        bref_adv = bref_advanced.get(season, {})

        # Merge advanced stats
        advanced = {}
        if nba_adv:
            advanced.update(nba_adv)
        if bref_adv:
            advanced.update(bref_adv)

        seasons.append({
            "year": season,
            "regular": regular,
            "playoffs": playoff,
            "clutch": clutch,
            "advanced": advanced if advanced else None,
        })

    # Compute career averages from regular season
    career_avg = {}
    if seasons:
        stat_keys = ["ppg", "rpg", "apg", "spg", "bpg", "tov", "fg_pct", "fg3_pct", "ft_pct", "mpg"]
        for stat in stat_keys:
            values = [s["regular"][stat] for s in seasons if s["regular"] and s["regular"].get(stat) is not None]
            career_avg[stat] = round(sum(values) / len(values), 1) if values else None

    return {
        "name": config["name"],
        "seasons": seasons,
        "career_averages": career_avg,
    }


def main():
    print("=" * 60)
    print("NBA Data Fetcher: Jaylen Brown vs Jayson Tatum")
    print("=" * 60)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    data = {"players": {}, "fetched_at": datetime.now().isoformat()}

    for key, config in PLAYERS.items():
        data["players"][key] = build_player_data(key, config)

    # Write JSON
    with open(OUTPUT_PATH, "w") as f:
        json.dump(data, f, indent=2)

    print(f"\nData saved to {OUTPUT_PATH}")
    print(f"Jaylen Brown: {len(data['players']['jaylen_brown']['seasons'])} seasons")
    print(f"Jayson Tatum: {len(data['players']['jayson_tatum']['seasons'])} seasons")
    print("Done!")


if __name__ == "__main__":
    main()
```

**Step 2: Run the script to fetch data**

Run:
```bash
cd "/Users/zacharyzeller/Documents/Claude Projects/portfolio-website" && python3 scripts/fetch-nba-data.py
```

Expected: Script runs for ~2-3 minutes, outputs `src/data/brown-vs-tatum.json` with season-by-season data for both players. Verify the JSON has data for multiple seasons for each player.

**Step 3: Verify the data**

Run:
```bash
python3 -c "import json; d=json.load(open('src/data/brown-vs-tatum.json')); print(f'Brown: {len(d[\"players\"][\"jaylen_brown\"][\"seasons\"])} seasons'); print(f'Tatum: {len(d[\"players\"][\"jayson_tatum\"][\"seasons\"])} seasons'); print(f'Sample: {json.dumps(d[\"players\"][\"jaylen_brown\"][\"seasons\"][0], indent=2)[:500]}')"
```

Expected: Brown has ~9-10 seasons, Tatum has ~8-9 seasons, sample data shows populated stat fields.

**Step 4: Commit**

```bash
git add scripts/fetch-nba-data.py src/data/brown-vs-tatum.json
git commit -m "feat: add Python script to fetch Brown vs Tatum NBA data"
```

---

### Task 3: Update Navigation (Header + Homepage)

**Files:**
- Modify: `src/components/layout/Header.tsx` (line 8 - navLinks array)
- Modify: `src/app/page.tsx` (line 20-39 - cards array)
- Modify: `src/app/sitemap.ts`

**Step 1: Add Projects to Header nav**

In `src/components/layout/Header.tsx`, add Projects link between About and Resume in the `navLinks` array (line 7-12):

```typescript
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/resume', label: 'Resume' },
  { href: '/contact', label: 'Contact' },
]
```

**Step 2: Add Projects card to homepage**

In `src/app/page.tsx`, add a 4th card to the `cards` array (after the existing 3):

```typescript
const cards = [
  {
    href: '/about',
    label: '01',
    title: 'About',
    desc: 'Background, skills, and approach to data analytics',
  },
  {
    href: '/projects',
    label: '02',
    title: 'Projects',
    desc: 'Data analysis and visualization case studies',
  },
  {
    href: '/resume',
    label: '03',
    title: 'Resume',
    desc: 'Full professional experience and qualifications',
  },
  {
    href: '/contact',
    label: '04',
    title: 'Contact',
    desc: 'Get in touch for opportunities and collaborations',
  },
]
```

Also add a 5th delay class to `delayClasses` since we now have 4 cards and the grid changes to `md:grid-cols-4`:

```typescript
const delayClasses = [
  'animate-reveal-delay-1',
  'animate-reveal-delay-2',
  'animate-reveal-delay-3',
  'animate-reveal-delay-4',
]
```

Update the grid from `md:grid-cols-3` to `md:grid-cols-4` on line 109.

**Step 3: Add new routes to sitemap**

In `src/app/sitemap.ts`, add entries for `/projects` and `/projects/brown-vs-tatum`.

**Step 4: Verify the dev server**

Run:
```bash
cd "/Users/zacharyzeller/Documents/Claude Projects/portfolio-website" && npm run dev
```

Check that the homepage shows 4 cards and the header has Projects in the nav.

**Step 5: Commit**

```bash
git add src/components/layout/Header.tsx src/app/page.tsx src/app/sitemap.ts
git commit -m "feat: add Projects to site navigation and homepage"
```

---

### Task 4: Create the Projects Listing Page

**Files:**
- Create: `src/app/projects/page.tsx`

**Step 1: Create the projects page**

Create `src/app/projects/page.tsx` following the same pattern as `about/page.tsx` - uses PageViewTracker, section-label styling, editorial-rule, animate-reveal classes. Lists the Brown vs Tatum project as a card linking to `/projects/brown-vs-tatum`. Design it to accommodate future projects.

The page should have:
- A header section ("Projects" label, title with Playfair font, editorial rule)
- A grid of project cards (starting with Brown vs Tatum)
- Each card shows: title, description, tags (e.g., "NBA", "Python", "Data Analysis"), and links to the full analysis

Match the existing card pattern from the homepage (bg-surface, hover:bg-elevated, group hover effects).

**Step 2: Verify in browser**

Navigate to `/projects` and confirm the page renders with the correct styling.

**Step 3: Commit**

```bash
git add src/app/projects/page.tsx
git commit -m "feat: add projects listing page"
```

---

### Task 5: Create Chart Components

**Files:**
- Create: `src/components/charts/SeasonLineChart.tsx`
- Create: `src/components/charts/ComparisonBarChart.tsx`
- Create: `src/components/charts/RadarChart.tsx`
- Create: `src/components/charts/ClutchChart.tsx`

All chart components must be client components (`'use client'`) since Recharts uses browser APIs. All should use `ResponsiveContainer` for responsive sizing.

**Color scheme for charts:**
- Jaylen Brown: `#1e3a5f` (the portfolio accent color - navy)
- Jayson Tatum: `#007A33` (Celtics green)
- Grid/axis: `var(--border-subtle)` / `#e4e6ea`
- Tooltip background: `var(--bg-surface)` / `#ffffff`
- Text: `var(--text-muted)` / `#7a808c`

**Step 1: Create SeasonLineChart**

`src/components/charts/SeasonLineChart.tsx`

A dual-line chart showing a stat over seasons for both players. Props:
- `data`: array of `{ year: string, brown: number | null, tatum: number | null }`
- `statLabel`: string for the Y-axis label (e.g., "Points Per Game")
- `formatValue?`: optional function to format tooltip values (e.g., for percentages)

Uses: `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer` from recharts.

Custom tooltip matching the portfolio design (bg-surface, border-subtle, DM Mono for numbers). Lines use `type="monotone"` with `strokeWidth={2}`.

**Step 2: Create ComparisonBarChart**

`src/components/charts/ComparisonBarChart.tsx`

A grouped bar chart for side-by-side stat comparisons. Props:
- `data`: array of `{ label: string, brown: number, tatum: number }`
- `formatValue?`: optional formatter

Uses: `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`.

Bars use `radius={[4, 4, 0, 0]}` for rounded tops.

**Step 3: Create RadarChart**

`src/components/charts/RadarChart.tsx`

An overlapping radar chart for all-around comparison. Props:
- `data`: array of `{ category: string, brown: number, tatum: number, fullMark: number }`

Uses: `RadarChart`, `Radar`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Legend`, `ResponsiveContainer`.

Each player's radar uses `fillOpacity={0.3}` so they overlap visually.

**Step 4: Create ClutchChart**

`src/components/charts/ClutchChart.tsx`

A bar chart specifically for clutch stats comparison. Same structure as ComparisonBarChart but with styling that emphasizes the "pressure" context - possibly a darker background or highlighted difference indicators.

**Step 5: Verify charts render**

Create a temporary test page or use the dev server to confirm each chart renders with sample data.

**Step 6: Commit**

```bash
git add src/components/charts/
git commit -m "feat: add Recharts chart components for NBA analysis"
```

---

### Task 6: Build the Analysis Page

**Files:**
- Create: `src/app/projects/brown-vs-tatum/page.tsx`

This is the main editorial page. It imports the static JSON and renders the article with charts.

**Step 1: Create the page**

`src/app/projects/brown-vs-tatum/page.tsx`

Structure (following the design doc):

1. **Hero section**: Title ("The Case for Jaylen Brown"), subtitle with thesis, head-to-head career stat snapshot in a grid (PPG, RPG, APG, FG% side by side with DM Mono styling)

2. **The Scoring Story section**: 2-3 paragraphs of written analysis + `SeasonLineChart` for PPG over career + `SeasonLineChart` for TS% over career

3. **The Complete Player section**: 2-3 paragraphs + `RadarChart` comparing career averages across scoring, rebounding, assists, steals, blocks, efficiency

4. **When It Matters Most section**: 2-3 paragraphs about clutch performance + `ClutchChart` for clutch FG%, points, +/- + `SeasonLineChart` for playoff PPG over career

5. **The Advanced Metrics section**: 1-2 paragraphs + `ComparisonBarChart` for PER, Win Shares, BPM, VORP career comparison

6. **The Verdict section**: 2-3 paragraphs summarizing findings, acknowledging nuance

Data transformation: Import the JSON and transform it into the shapes each chart component expects. Create helper functions at the top of the file:
- `getSeasonStat(data, statPath)` → extracts a stat across seasons for both players into chart format
- `getCareerRadarData(data)` → builds radar chart data from career averages
- `getClutchComparison(data)` → aggregates clutch stats for bar chart

The written analysis paragraphs should reference actual numbers from the data. Use template literals to pull stats directly from the JSON so the text stays accurate when data updates.

Use the same page patterns as other pages: `container mx-auto px-6 md:px-8`, `section-label`, `editorial-rule`, `animate-reveal` classes, Playfair for headings, DM Sans for body.

Add `PageViewTracker` for analytics.

**Step 2: Verify the full page**

Navigate to `/projects/brown-vs-tatum` and verify:
- All sections render
- Charts display with real data
- Text references correct numbers
- Responsive on mobile (charts resize)
- Styling matches the rest of the portfolio

**Step 3: Commit**

```bash
git add src/app/projects/brown-vs-tatum/
git commit -m "feat: add Brown vs Tatum editorial analysis page"
```

---

### Task 7: Write the Editorial Analysis

**Files:**
- Modify: `src/app/projects/brown-vs-tatum/page.tsx`

**Step 1: Review the data**

Before writing the analysis, examine the actual JSON data to understand what the numbers say. The analysis must be honest - if Tatum is better in some categories, say so. The goal is a credible data journalism piece, not a one-sided argument.

Read `src/data/brown-vs-tatum.json` and note:
- Who has higher career PPG, RPG, APG?
- Who has better efficiency (TS%, eFG%)?
- Do clutch stats actually support the "Tatum chokes" hypothesis?
- What do the advanced metrics say?

**Step 2: Write the analysis paragraphs**

Update the page with data-driven written analysis for each section. The tone should be editorial but objective - like FiveThirtyEight. Present the hypothesis, test it against the data, and reach an honest conclusion.

Use the data directly in prose: "Brown averaged {data.players.jaylen_brown.career_averages.ppg} points per game over his career, while Tatum posted {data.players.jayson_tatum.career_averages.ppg}."

**Step 3: Verify the complete article**

Read through the full page in the browser. Check that the narrative flows, numbers are accurate, and the conclusion follows from the evidence.

**Step 4: Commit**

```bash
git add src/app/projects/brown-vs-tatum/page.tsx
git commit -m "feat: add editorial analysis for Brown vs Tatum comparison"
```

---

### Task 8: Polish and Final Review

**Files:**
- Potentially modify: any files that need visual tweaks

**Step 1: Run the build**

```bash
cd "/Users/zacharyzeller/Documents/Claude Projects/portfolio-website" && npm run build
```

Expected: Build succeeds with no errors.

**Step 2: Run linting**

```bash
npm run lint
```

Expected: No lint errors.

**Step 3: Visual review**

Check in browser:
- Homepage: 4 cards render correctly, Projects card links to /projects
- Header: Projects nav link appears, active state works
- /projects: Lists the Brown vs Tatum analysis with correct styling
- /projects/brown-vs-tatum: Full article renders, all charts interactive, responsive on mobile
- Footer: Still looks correct on all pages

**Step 4: Final commit**

```bash
git add -A
git commit -m "polish: final styling and build verification for NBA analysis"
```
