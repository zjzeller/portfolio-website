#!/usr/bin/env python3
"""
Fetch NBA career stats for Jaylen Brown and Jayson Tatum.
Outputs a single JSON file at src/data/brown-vs-tatum.json.
"""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from nba_api.stats.endpoints import (
    leaguedashplayerclutch,
    leaguedashplayerstats,
    playercareerstats,
)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

PLAYERS = {
    "jaylen_brown": {
        "name": "Jaylen Brown",
        "player_id": 1627759,
        "bref_slug": "brownja02",
        "draft_year": 2016,
    },
    "jayson_tatum": {
        "name": "Jayson Tatum",
        "player_id": 1628369,
        "bref_slug": "tatumja01",
        "draft_year": 2017,
    },
}

# Seasons from 2016-17 through 2025-26
ALL_SEASONS = [f"{y}-{str(y+1)[-2:]}" for y in range(2016, 2026)]

NBA_API_DELAY = 0.7  # seconds between nba_api requests
BREF_DELAY = 3.5     # seconds between Basketball Reference requests

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "src" / "data"
OUTPUT_FILE = OUTPUT_DIR / "brown-vs-tatum.json"

HEADERS_BREF = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def safe_float(val):
    """Convert a value to float, returning None if not possible."""
    if val is None or val == "" or val == "—" or val == "-":
        return None
    try:
        return round(float(val), 3)
    except (ValueError, TypeError):
        return None


def safe_int(val):
    """Convert a value to int, returning None if not possible."""
    if val is None or val == "" or val == "—" or val == "-":
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------------
# 1. Career per-game stats via playercareerstats
# ---------------------------------------------------------------------------

def fetch_career_stats(player_id: int) -> dict:
    """
    Returns dict keyed by season string, e.g. "2016-17",
    with "regular" and "playoffs" sub-dicts.
    Also returns career_averages.
    """
    print(f"  Fetching career stats for player {player_id} ...")
    endpoint = playercareerstats.PlayerCareerStats(
        player_id=player_id,
        per_mode36="PerGame",
    )
    result_sets = endpoint.get_dict()["resultSets"]

    # Build a map of result set name -> rows
    rs_map = {}
    for rs in result_sets:
        rs_map[rs["name"]] = {
            "headers": [h.upper() for h in rs["headers"]],
            "rows": rs["rowSet"],
        }

    def parse_row(headers, row):
        d = dict(zip(headers, row))
        return {
            "gp": safe_int(d.get("GP")),
            "mpg": safe_float(d.get("MIN")),
            "ppg": safe_float(d.get("PTS")),
            "rpg": safe_float(d.get("REB")),
            "apg": safe_float(d.get("AST")),
            "spg": safe_float(d.get("STL")),
            "bpg": safe_float(d.get("BLK")),
            "tov": safe_float(d.get("TOV")),
            "fg_pct": safe_float(d.get("FG_PCT")),
            "fg3_pct": safe_float(d.get("FG3_PCT")),
            "ft_pct": safe_float(d.get("FT_PCT")),
        }

    seasons_data = {}

    # Regular season
    reg = rs_map.get("SeasonTotalsRegularSeason", {})
    for row in reg.get("rows", []):
        d = dict(zip(reg["headers"], row))
        season_id = d.get("SEASON_ID", "")
        if season_id not in seasons_data:
            seasons_data[season_id] = {"regular": None, "playoffs": None}
        seasons_data[season_id]["regular"] = parse_row(reg["headers"], row)

    # Playoffs
    po = rs_map.get("SeasonTotalsPostSeason", {})
    for row in po.get("rows", []):
        d = dict(zip(po["headers"], row))
        season_id = d.get("SEASON_ID", "")
        if season_id not in seasons_data:
            seasons_data[season_id] = {"regular": None, "playoffs": None}
        seasons_data[season_id]["playoffs"] = parse_row(po["headers"], row)

    # Career averages from CareerTotalsRegularSeason
    career_avg = None
    cr = rs_map.get("CareerTotalsRegularSeason", {})
    if cr.get("rows"):
        career_avg = parse_row(cr["headers"], cr["rows"][0])

    return seasons_data, career_avg


# ---------------------------------------------------------------------------
# 2. Clutch stats via leaguedashplayerclutch
# ---------------------------------------------------------------------------

def fetch_clutch_stats(player_id: int, season: str) -> dict | None:
    """
    Fetch clutch stats (last 5 min, within 5 pts) for a given season.
    Returns dict or None.
    """
    try:
        endpoint = leaguedashplayerclutch.LeagueDashPlayerClutch(
            season=season,
            clutch_time="Last 5 Minutes",
            ahead_behind="Ahead or Behind",
            point_diff=5,
            per_mode_detailed="PerGame",
            season_type_all_star="Regular Season",
        )
        data = endpoint.get_dict()["resultSets"][0]
        headers = [h.upper() for h in data["headers"]]
        for row in data["rowSet"]:
            d = dict(zip(headers, row))
            if d.get("PLAYER_ID") == player_id:
                return {
                    "gp": safe_int(d.get("GP")),
                    "pts": safe_float(d.get("PTS")),
                    "fg_pct": safe_float(d.get("FG_PCT")),
                    "fg3_pct": safe_float(d.get("FG3_PCT")),
                    "ft_pct": safe_float(d.get("FT_PCT")),
                    "plus_minus": safe_float(d.get("PLUS_MINUS")),
                    "ast": safe_float(d.get("AST")),
                    "tov": safe_float(d.get("TOV")),
                }
    except Exception as e:
        print(f"    Warning: clutch stats failed for season {season}: {e}")
    return None


# ---------------------------------------------------------------------------
# 3. NBA.com advanced stats via leaguedashplayerstats (Advanced)
# ---------------------------------------------------------------------------

def fetch_nba_advanced(player_id: int, season: str) -> dict | None:
    """
    Fetch NBA.com advanced stats for a given season.
    Returns dict with TS%, eFG%, USG%, ratings, PIE or None.
    """
    try:
        endpoint = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season,
            measure_type_detailed_defense="Advanced",
            per_mode_detailed="PerGame",
            season_type_all_star="Regular Season",
        )
        data = endpoint.get_dict()["resultSets"][0]
        headers = [h.upper() for h in data["headers"]]
        for row in data["rowSet"]:
            d = dict(zip(headers, row))
            if d.get("PLAYER_ID") == player_id:
                return {
                    "ts_pct": safe_float(d.get("TS_PCT")),
                    "efg_pct": safe_float(d.get("EFG_PCT")),
                    "usg_pct": safe_float(d.get("USG_PCT")),
                    "off_rtg": safe_float(d.get("OFF_RATING")),
                    "def_rtg": safe_float(d.get("DEF_RATING")),
                    "net_rtg": safe_float(d.get("NET_RATING")),
                    "pie": safe_float(d.get("PIE")),
                }
    except Exception as e:
        print(f"    Warning: NBA advanced stats failed for season {season}: {e}")
    return None


# ---------------------------------------------------------------------------
# 4. Basketball Reference advanced stats
# ---------------------------------------------------------------------------

def fetch_bref_advanced(slug: str) -> dict:
    """
    Scrape Basketball Reference advanced stats table.
    Returns dict keyed by season string.
    """
    first_letter = slug[0]
    url = f"https://www.basketball-reference.com/players/{first_letter}/{slug}.html"
    print(f"  Scraping Basketball Reference: {url}")

    try:
        import subprocess
        result = subprocess.run(
            [
                "curl", "-s", "-L",
                "-H", "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "-H", "Accept-Language: en-US,en;q=0.9",
                "--compressed",
                url,
            ],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode != 0 or not result.stdout.strip():
            print(f"    Warning: curl failed for Basketball Reference. Will use null for BRef stats.")
            return {}
        html_text = result.stdout
        # Check for blocking
        if "403" in html_text[:500] or len(html_text) < 1000:
            print(f"    Warning: Basketball Reference may have blocked the request. Will use null for BRef stats.")
            return {}
    except Exception as e:
        print(f"    Warning: Basketball Reference request failed: {e}. Will use null for BRef stats.")
        return {}

    soup = BeautifulSoup(html_text, "html.parser")
    table = soup.find("table", id="advanced")
    if not table:
        print("    Warning: could not find advanced table")
        return {}

    tbody = table.find("tbody")
    if not tbody:
        return {}

    # Get header names from thead
    thead = table.find("thead")
    header_cells = thead.find_all("tr")[-1].find_all("th")
    col_names = [th.get("data-stat", "") for th in header_cells]

    result = {}
    for tr in tbody.find_all("tr"):
        # Skip separator rows
        if tr.get("class") and "thead" in tr.get("class", []):
            continue

        cells = tr.find_all(["th", "td"])
        if len(cells) < 2:
            continue

        row_data = {}
        for i, cell in enumerate(cells):
            if i < len(col_names):
                row_data[col_names[i]] = cell.get_text(strip=True)

        # BRef uses "year_id" for the season column (in the th element)
        season_str = row_data.get("year_id", "") or row_data.get("season", "")
        # Normalize season format: "2016-17" stays as-is
        if not season_str or len(season_str) < 5:
            continue

        # Skip "Career" or other summary rows
        if "career" in season_str.lower():
            continue

        result[season_str] = {
            "per": safe_float(row_data.get("per")),
            "ws": safe_float(row_data.get("ws")),
            "ws_48": safe_float(row_data.get("ws_per_48")),
            "bpm": safe_float(row_data.get("bpm")),
            "vorp": safe_float(row_data.get("vorp")),
        }

    return result


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("NBA Data Fetcher: Brown vs Tatum")
    print("=" * 60)

    output = {
        "players": {},
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }

    for key, cfg in PLAYERS.items():
        player_id = cfg["player_id"]
        name = cfg["name"]
        draft_year = cfg["draft_year"]
        bref_slug = cfg["bref_slug"]

        print(f"\n--- {name} (ID: {player_id}) ---")

        # 1. Career stats
        career_data, career_avg = fetch_career_stats(player_id)
        time.sleep(NBA_API_DELAY)

        # 2. Basketball Reference advanced stats
        bref_data = fetch_bref_advanced(bref_slug)
        time.sleep(BREF_DELAY)

        # 3. Per-season clutch + NBA.com advanced stats
        seasons_list = []
        player_seasons = [s for s in ALL_SEASONS if int(s[:4]) >= draft_year]

        for season in player_seasons:
            print(f"  Season {season} ...")

            reg_po = career_data.get(season, {})
            regular = reg_po.get("regular")
            playoffs = reg_po.get("playoffs")

            # Clutch stats
            print(f"    Fetching clutch stats ...")
            clutch = fetch_clutch_stats(player_id, season)
            time.sleep(NBA_API_DELAY)

            # NBA.com advanced
            print(f"    Fetching NBA.com advanced stats ...")
            nba_adv = fetch_nba_advanced(player_id, season)
            time.sleep(NBA_API_DELAY)

            # Merge NBA.com advanced with Basketball Reference
            bref_season = bref_data.get(season, {})
            advanced = None
            if nba_adv or bref_season:
                advanced = {
                    "ts_pct": nba_adv.get("ts_pct") if nba_adv else None,
                    "efg_pct": nba_adv.get("efg_pct") if nba_adv else None,
                    "usg_pct": nba_adv.get("usg_pct") if nba_adv else None,
                    "off_rtg": nba_adv.get("off_rtg") if nba_adv else None,
                    "def_rtg": nba_adv.get("def_rtg") if nba_adv else None,
                    "net_rtg": nba_adv.get("net_rtg") if nba_adv else None,
                    "pie": nba_adv.get("pie") if nba_adv else None,
                    "per": bref_season.get("per"),
                    "ws": bref_season.get("ws"),
                    "ws_48": bref_season.get("ws_48"),
                    "bpm": bref_season.get("bpm"),
                    "vorp": bref_season.get("vorp"),
                }

            seasons_list.append({
                "year": season,
                "regular": regular,
                "playoffs": playoffs,
                "clutch": clutch,
                "advanced": advanced,
            })

        output["players"][key] = {
            "name": name,
            "seasons": seasons_list,
            "career_averages": career_avg,
        }

    # Ensure output directory exists and write
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nDone! Output written to {OUTPUT_FILE}")
    print(f"File size: {OUTPUT_FILE.stat().st_size:,} bytes")

    # Quick validation
    with open(OUTPUT_FILE) as f:
        data = json.load(f)

    for pkey in ["jaylen_brown", "jayson_tatum"]:
        p = data["players"][pkey]
        n_seasons = len(p["seasons"])
        populated = sum(1 for s in p["seasons"] if s["regular"] is not None)
        print(f"  {p['name']}: {n_seasons} seasons, {populated} with regular season data")


if __name__ == "__main__":
    main()
