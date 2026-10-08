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


def talent_rank(team: str, year: int):
    """Cal's roster-talent rank among FBS teams that season (1 = most talented)."""
    scores = {t: roster_talent(t, year) for t in fbs[year]}
    scores = {t: v for t, v in scores.items() if v is not None}
    if team not in scores:
        return None, len(scores)
    return 1 + sum(v > scores[team] for v in scores.values()), len(scores)


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
    t_rank, t_teams = talent_rank(CAL, y)
    expected = round(intercept + slope * talent, 1) if talent is not None else None
    n_rated = len(strength.get(y, {})) or len(fbs[y])
    # The predicted finish, as a national rank (percentile converted back to rank)
    expected_rank = round(1 + (1 - expected / 100) * (n_rated - 1)) if expected is not None else None
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
        "talentRank": t_rank,
        "talentTeams": t_teams if t_rank else None,
        "expected": expected,
        "expectedRank": expected_rank,
    })

eras = []
for s in seasons:
    if not eras or eras[-1]["coach"] != s["coach"]:
        eras.append({"coach": s["coach"], "from": s["year"], "to": s["year"]})
    else:
        eras[-1]["to"] = s["year"]

# ---- Chapter 4: home attendance ---------------------------------------------------
# The API is missing attendance for some seasons. For those, every home game comes from
# the season's Wikipedia page (schedule table). 2011 home games were at AT&T Park in
# San Francisco while Memorial Stadium was renovated; 2020 had no fans.
WIKI_ATTENDANCE = {
    2000: [44500, 30500, 53000, 36000, 67500],
    2002: [27185, 24692, 31816, 29297, 46697, 28808, 71224],
    2004: [58949, 69898, 52652, 65615, 72981],
    2005: [65938, 57657, 55944, 57174, 52569, 72981],
    2009: [62367, 58083, 71799, 54738, 56496, 53347],
    2010: [58040, 55440, 61664, 51599, 65963, 67793, 44613],
    2011: [33952, 44043, 35182, 35506, 39602],
    2014: [48145, 39821, 44449, 49257, 55575, 56483, 47856],
}
attendance = []
for s in seasons:
    y = s["year"]
    if y == LAST or y == 2020:
        attendance.append({"year": y, "average": None, "games": 0, "source": None, "venue": None})
        continue
    if y in WIKI_ATTENDANCE:
        crowd, source = WIKI_ATTENDANCE[y], "Wikipedia season page"
    else:
        games = load(f"games_year-{y}_team-California")
        crowd = [g["attendance"] for g in games if g["homeTeam"] == CAL and not g.get("neutralSite") and g.get("attendance")]
        source = "College Football Data API"
    attendance.append({"year": y, "average": round(sum(crowd) / len(crowd)), "games": len(crowd), "source": source,
                       "venue": "AT&T Park" if y == 2011 else "Memorial Stadium",
                       "winning": s["wins"] > s["losses"]})

# ---- Chapter 5: the transfer portal -------------------------------------------------
POWER4 = {"SEC", "Big Ten", "Big 12", "ACC"}


def conference_of(team, year):
    for t in load(f"teams_fbs_year-{year}"):
        if t["school"] == team:
            return t["conference"]
    return None


def destination_group(team, year):
    if not team:
        return "No destination listed"
    conf = conference_of(team, year)
    if conf in POWER4:
        return "Power 4"
    if conf == "Pac-12" and year <= 2024:
        return "Power 4"  # the Pac-12 was a power conference through the 2024 season
    if conf:
        return "Group of 5"
    return "FCS or lower"


portal_years, departures = [], []
for y in range(2021, LAST + 1):
    rows = load(f"player_portal_year-{y}")
    out_ = [r for r in rows if r["origin"] == CAL]
    in_ = [r for r in rows if r["destination"] == CAL]
    groups = {}
    for r in out_:
        g = destination_group(r.get("destination"), y)
        groups[g] = groups.get(g, 0) + 1
    portal_years.append({"year": y, "out": len(out_), "in": len(in_), "outGroups": groups,
                         "outStars": round(float(np.mean([r["stars"] for r in out_ if r.get("stars")])), 2) if out_ else None,
                         "inStars": round(float(np.mean([r["stars"] for r in in_ if r.get("stars")])), 2) if in_ else None})
    for r in out_:
        departures.append({"year": y, "player": f"{r['firstName']} {r['lastName']}", "position": r["position"],
                           "destination": r.get("destination"), "group": destination_group(r.get("destination"), y),
                           "stars": r.get("stars"), "rating": r.get("rating")})
departures.sort(key=lambda d: (-(d["rating"] or 0), -(d["stars"] or 0)))

# ---- Chapter 6: Cal against every Power 4 school (2026 roster talent) ---------------
talent_2026 = {t["team"]: float(t["talent"]) for t in load(f"talent_year-{LAST}")}
peers = []
for t in load(f"teams_fbs_year-{LAST}"):
    if t["conference"] in POWER4 and t["school"] in talent_2026:
        peers.append({"team": t["school"], "conference": t["conference"], "talent": round(talent_2026[t["school"]], 1)})
peers.sort(key=lambda p: -p["talent"])
for i, p in enumerate(peers):
    p["rank"] = i + 1
acc_recent = []
for y in (LAST - 2, LAST - 1):  # the two completed ACC seasons
    acc = [r for r in strength.get(y, {}) if conference_of(r, y) == "ACC"]
    ranked = sorted(acc, key=lambda t: strength[y][t][0])
    acc_recent.append({"year": y, "calRankInAcc": ranked.index(CAL) + 1 if CAL in ranked else None, "accTeams": len(ranked)})

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
    "attendance": attendance,
    "stadiumCapacity": 62467,  # Memorial Stadium after the 2012 renovation (CFBD venues)
    "portal": portal_years,
    "topDepartures": departures[:8],
    "peers": peers,
    "accRecent": acc_recent,
}
dest = Path(__file__).resolve().parents[1] / "src" / "data" / "cal-decade.json"
dest.write_text(json.dumps(out, indent=1))
print(f"Wrote {dest}")
print(f"Talent -> strength fit: r = {fit_r:.2f} over {len(xs)} team-seasons")
for s in seasons:
    gap = round(s["strength"] - s["expected"], 1) if s["strength"] is not None and s["expected"] is not None else None
    print(s["year"], s["coach"], f"{s['wins']}-{s['losses']}", "AP", s["apFinal"], "| strength", s["strengthRank"], s["strength"],
          "| class", s["classRank"], "| talent", s["talent"], "exp", s["expected"], "gap", gap)
