# Brown vs Tatum: NBA Player Analysis

## Overview

A data-driven editorial analysis comparing Jaylen Brown and Jayson Tatum, integrated into the portfolio website as a showcase of analytical skills. The hypothesis: Jaylen Brown is a better basketball player than Jayson Tatum, and Tatum has a tendency to choke in late-game situations.

## Architecture

```
portfolio-website/
├── scripts/
│   └── fetch-nba-data.py            # Python script (run locally)
├── src/
│   ├── app/
│   │   ├── projects/
│   │   │   ├── page.tsx              # Projects listing page
│   │   │   └── brown-vs-tatum/
│   │   │       └── page.tsx          # The analysis page
│   ├── components/
│   │   └── charts/
│   │       ├── ComparisonBarChart.tsx # Side-by-side bar comparisons
│   │       ├── SeasonLineChart.tsx    # Season-over-season trends
│   │       ├── RadarChart.tsx         # All-around game comparison
│   │       └── ClutchChart.tsx        # Clutch performance visualization
│   └── data/
│       └── brown-vs-tatum.json       # Static JSON from Python script
```

**Data flow**: Python script (local) -> JSON file -> Next.js imports at build time -> Recharts renders interactive charts

## Data Sources

### nba_api (primary)
- Player IDs: Jaylen Brown `1627759`, Jayson Tatum `1628369`
- Career stats per season (regular season + playoffs): PPG, RPG, APG, SPG, BPG, TOV, FG%, 3PT%, FT%, minutes
- Clutch stats per season: last 5 minutes of games within 5 points - FG%, points, +/-, turnovers
- NBA.com advanced stats: TS%, eFG%, USG%, OFF_RATING, DEF_RATING, NET_RATING, PIE

### Basketball Reference (supplementary)
- PER, Win Shares (OWS, DWS, WS/48), BPM, VORP per season
- These metrics are not available from NBA.com

### Constraints
- nba_api: 600ms delay between requests, blocked on cloud IPs (run locally only)
- Basketball Reference: 20 requests/minute rate limit
- Total script runtime: ~2-3 minutes

## Data Shape

Single file: `src/data/brown-vs-tatum.json`

```json
{
  "players": {
    "jaylen_brown": {
      "name": "Jaylen Brown",
      "seasons": [
        {
          "year": "2016-17",
          "regular": { "ppg": 6.6, "rpg": 2.8, "apg": 0.8, "spg": 0.5, "bpg": 0.2, "tov": 0.8, "fg_pct": 0.454, "fg3_pct": 0.341, "ft_pct": 0.687, "mpg": 17.2 },
          "playoffs": { "ppg": null, "rpg": null, ... },
          "clutch": { "fg_pct": 0.42, "pts": 3.2, "plus_minus": 1.1, "tov": 0.5 },
          "advanced": { "ts_pct": 0.508, "efg_pct": 0.491, "usg_pct": 15.2, "off_rtg": 105.2, "def_rtg": 110.1, "net_rtg": -4.9, "pie": 7.2, "per": 9.8, "ws": 1.6, "ws_48": 0.055, "bpm": -2.1, "vorp": 0.2 }
        }
      ],
      "career": { ... }
    },
    "jayson_tatum": { ... }
  },
  "fetched_at": "2026-02-16T..."
}
```

## Page Content Structure

The page is an editorial data journalism piece (FiveThirtyEight style) with interactive charts woven into the narrative.

### 1. Hero / Intro
- Punchy title and thesis statement
- Head-to-head stat snapshot (side-by-side key career numbers)

### 2. The Scoring Story
- Written analysis of scoring efficiency across careers
- **Chart: Season-by-season line chart** - PPG, TS%, eFG% overlaid for both players

### 3. The Complete Player
- Analysis of all-around contributions beyond scoring
- **Chart: Radar chart** - 6-8 categories (scoring, rebounding, assists, steals, blocks, efficiency, etc.)

### 4. When It Matters Most (The Clutch)
- Core of the hypothesis - does Tatum choke in late-game situations?
- **Chart: Clutch stats bar chart** - FG%, points, +/- in last 5 minutes of close games
- **Chart: Playoff performance line chart** - postseason trends

### 5. The Advanced Metrics
- PER, Win Shares, VORP, BPM, Net Rating
- **Chart: Grouped bar chart** - side-by-side advanced metrics

### 6. The Verdict
- Evidence-based conclusion, acknowledging where each player excels
- Final argument for Brown

## Tech Choices

- **Charting**: Recharts (React-native, clean aesthetic, supports line/bar/radar)
- **Styling**: Same portfolio design language - Playfair Display headings, DM Sans body, DM Mono for stats, existing color palette plus Celtics green (#007A33) as contextual accent
- **Data fetching**: Python script run locally, outputs static JSON committed to repo

## Navigation Changes

- Add "Projects" nav link to Header.tsx (between About and Resume)
- Add 4th navigation card on homepage pointing to /projects
- /projects page lists analysis projects (starting with this one)
- Analysis lives at /projects/brown-vs-tatum

## Time Range

Full careers for both players: 2016-17 season through 2025-26 (present).
