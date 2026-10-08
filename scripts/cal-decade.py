"""
Cal Football, 2000 to now: build the season-level dataset for the story page.

Source: the College Football Data API (collegefootballdata.com). The raw JSON is
fetched separately (it needs an API key) and kept outside this repo; pass its folder:

  python scripts/cal-decade.py --raw path/to/cal-decade-data/raw

Writes src/data/cal-decade.json.

Measures (all ranked among FBS teams that season, so years are comparable):
- Team strength: SRS (Simple Rating System), a points-per-game margin adjusted for
  schedule. Shown as a percentile, where 100 = best team in FBS.
- Roster talent: the average recruiting-class percentile of the four classes on the
  roster that season (this year's class and the three before it). A roster is mostly
  four classes deep, so this is the talent a coach actually had to work with.
"""
import argparse
import json
from pathlib import Path

import numpy as np

CAL = "California"
FIRST, LAST = 2000, 2026
FIRST_CLASS = 2003  # recruiting data before 2003 is too sparse to rank teams fairly

parser = argparse.ArgumentParser()
parser.add_argument("--raw", type=Path, required=True)
args = parser.parse_args()
raw = args.raw


def load(name: str):
    return json.loads((raw / f"{name}.json").read_text())


def percentile(rank: int, n: int) -> float:
    """Rank 1 of n -> 100, last -> 0."""
    return round(100 * (1 - (rank - 1) / (n - 1)), 1)


fbs = {y: {t["school"] for t in load(f"teams_fbs_year-{y}")} for y in range(FIRST, LAST + 1)}

# ---- Recruiting class percentile for every FBS team, every year ----------------
recruit_pct: dict[int, dict[str, float]] = {}
for y in range(FIRST_CLASS, LAST + 1):
    classes = [c for c in load(f"recruiting_teams_year-{y}") if c["team"] in fbs[y] and c.get("points")]
    classes.sort(key=lambda c: -c["points"])
    recruit_pct[y] = {c["team"]: percentile(i + 1, len(classes)) for i, c in enumerate(classes)}
recruit_rank = {
    y: {t: i + 1 for i, t in enumerate(sorted(recruit_pct[y], key=lambda t: -recruit_pct[y][t]))}
    for y in recruit_pct
}


def roster_talent(team: str, year: int):
    """Average class percentile of the four classes on the roster. Needs at least three of
    the four (a team occasionally has one class missing from the source data)."""
    vals = [recruit_pct.get(y, {}).get(team) for y in range(year - 3, year + 1)]
    vals = [v for v in vals if v is not None]
    return round(float(np.mean(vals)), 1) if len(vals) >= 3 else None


# ---- Team strength (SRS) percentile for every FBS team, every completed season --
strength: dict[int, dict[str, tuple[int, float, float]]] = {}
for y in range(FIRST, LAST):  # 2026 is in progress, no final rating yet
    try:
        rows = [r for r in load(f"ratings_srs_year-{y}") if r["team"] in fbs[y] and r.get("rating") is not None]
    except FileNotFoundError:
        continue
    rows.sort(key=lambda r: -r["rating"])
    strength[y] = {r["team"]: (i + 1, percentile(i + 1, len(rows)), round(r["rating"], 1)) for i, r in enumerate(rows)}

# ---- Expected strength from talent: a straight line fit across every FBS team-season --
xs, ys = [], []
for y, teams in strength.items():
    for team, (_, pct, _) in teams.items():
        t = roster_talent(team, y)
        if t is not None:
            xs.append(t)
            ys.append(pct)
slope, intercept = np.polyfit(xs, ys, 1)
fit_r = float(np.corrcoef(xs, ys)[0, 1])

# ---- Cal season by season -------------------------------------------------------
coaches = {}
for c in load("coaches_team-California"):
    for s in c["seasons"]:
        if s["school"] == CAL and FIRST <= s["year"] <= LAST:
            # The coach who led the most games that season (2025: Wilcox 11, interim Rolovich 2)
            name = f"{c['firstName']} {c['lastName']}"
            if s["year"] not in coaches or (s.get("games") or 0) > coaches[s["year"]][1]:
                coaches[s["year"]] = (name, s.get("games") or 0)

seasons = []
for y in range(FIRST, LAST + 1):
    games = [g for g in load(f"games_year-{y}_team-California") if g.get("homePoints") is not None]
    wins = sum(1 for g in games if (g["homeTeam"] == CAL) == (g["homePoints"] > g["awayPoints"]))
    ap = None
    polls = load(next(p.stem for p in raw.glob(f"rankings_year-{y}_*.json")))
    if polls and y < LAST:
        for poll in polls[-1]["polls"]:
            if poll["poll"] == "AP Top 25":
                ap = next((r["rank"] for r in poll["ranks"] if r["school"] == CAL), None)
    s = strength.get(y, {}).get(CAL)
    talent = roster_talent(CAL, y)
    seasons.append({
        "year": y,
        "coach": coaches.get(y, ("", 0))[0],
        "wins": wins,
        "losses": len(games) - wins,
        "complete": y < LAST,
        "apFinal": ap,
        "srs": s[2] if s else None,
        "strengthRank": s[0] if s else None,
        "strength": s[1] if s else None,
        "fbsTeams": len(strength.get(y, {})) or None,
        "classRank": recruit_rank.get(y, {}).get(CAL),
        "classTeams": len(recruit_rank.get(y, {})) or None,
        "talent": talent,
        "expected": round(intercept + slope * talent, 1) if talent is not None else None,
    })

eras = []
for s in seasons:
    if not eras or eras[-1]["coach"] != s["coach"]:
        eras.append({"coach": s["coach"], "from": s["year"], "to": s["year"]})
    else:
        eras[-1]["to"] = s["year"]

out = {
    "metadata": {
        "source": "College Football Data API (collegefootballdata.com)",
        "years": [FIRST, LAST],
        "firstClass": FIRST_CLASS,
        "fit": {"slope": round(float(slope), 3), "intercept": round(float(intercept), 2),
                "r": round(fit_r, 2), "teamSeasons": len(xs)},
    },
    "eras": eras,
    "seasons": seasons,
}
dest = Path(__file__).resolve().parents[1] / "src" / "data" / "cal-decade.json"
dest.write_text(json.dumps(out, indent=1))
print(f"Wrote {dest}")
print(f"Talent -> strength fit: r = {fit_r:.2f} over {len(xs)} team-seasons")
for s in seasons:
    gap = round(s["strength"] - s["expected"], 1) if s["strength"] is not None and s["expected"] is not None else None
    print(s["year"], s["coach"], f"{s['wins']}-{s['losses']}", "AP", s["apFinal"], "| strength", s["strengthRank"], s["strength"],
          "| class", s["classRank"], "| talent", s["talent"], "exp", s["expected"], "gap", gap)
