#!/usr/bin/env python3
"""
cal-pipeline.py

Does Cal get more out of its players than their draft slot predicts?

For every NFL and NBA draft pick since 1980, estimate how much career value a
player *should* produce given where he was drafted, then compare it with what
he actually produced. Average that "surplus" by college and see where Cal
ranks. Writes src/data/cal-pipeline.json for the case study page.

Data:
  NFL: nflverse draft picks (free, open): career Approximate Value (w_av)
       https://github.com/nflverse/nflverse-data/releases/tag/draft_picks
  NBA: Basketball Reference draft pages, 1980-2025, first 60 picks: career
       Win Shares. Collected by hand from the site into a pipe-delimited CSV
       (not committed to this repo; pass its path with --nba).

Run from the repo root:
  pip install -r scripts/requirements.txt
  python scripts/cal-pipeline.py --nba path/to/nba_drafts_1980_2025.csv
"""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.isotonic import IsotonicRegression

NFL_URL = "https://github.com/nflverse/nflverse-data/releases/download/draft_picks/draft_picks.csv"
OUT_PATH = Path(__file__).parent.parent / "src" / "data" / "cal-pipeline.json"

FIRST_CLASS, LAST_CLASS = 1980, 2020  # 2021+ classes are too early in their careers
ERA_WINDOW = 3  # compare each class with classes drafted within +/- 3 years
MIN_NFL, MIN_NBA = 40, 10  # picks needed per sport for the two-sport ranking
MIN_NFL_ONLY = 60  # picks needed for the football-only ranking
MIN_NBA_ONLY = 15  # picks needed for the basketball-only ranking
BOOTSTRAP = 4000
CAL = "California"

# Basketball Reference spells some schools differently from the NFL data
NBA_TO_NFL = {
    "UNC": "North Carolina", "UConn": "Connecticut", "Pitt": "Pittsburgh",
    "NC State": "North Carolina St.", "Boston College": "Boston Col.",
    "St. John's": "St. John's (NY)", "Ole Miss": "Mississippi",
    "Miami University": "Miami (OH)", "Southern California": "USC",
}

# Big programs to always show next to the leaders, for context
PEERS = ["Stanford", "USC", "UCLA", "Oregon", "Washington", "Arizona", "Duke",
         "North Carolina", "Kentucky", "Kansas", "Michigan", "Ohio St.", "Texas",
         "Florida", "Alabama", "Notre Dame"]


def expected_by_era(df: pd.DataFrame, year_col: str, pick_col: str, value_col: str) -> pd.Series:
    """Expected career value for each pick.

    Isotonic regression fits the best curve that can only go DOWN as the pick
    number goes UP (a later pick is never "expected" to be worth more), with no
    other shape assumed. It's fit separately for each draft class using only
    classes within +/- ERA_WINDOW years, so a 2016 pick is compared with other
    recent picks, not with players whose careers are already over.
    """
    expected = pd.Series(index=df.index, dtype=float)
    for year in sorted(df[year_col].unique()):
        nearby = df[(df[year_col] >= year - ERA_WINDOW) & (df[year_col] <= year + ERA_WINDOW)]
        model = IsotonicRegression(increasing=False, out_of_bounds="clip")
        model.fit(nearby[pick_col], nearby[value_col])
        this_class = df[year_col] == year
        expected[this_class] = model.predict(df.loc[this_class, pick_col])
    return expected


def bootstrap_ci(values: np.ndarray, rng: np.random.Generator) -> tuple[float, float]:
    """95% interval for the mean by resampling the school's own picks."""
    means = [rng.choice(values, len(values)).mean() for _ in range(BOOTSTRAP)]
    return float(np.percentile(means, 2.5)), float(np.percentile(means, 97.5))


def load_nfl() -> pd.DataFrame:
    print("Downloading NFL draft picks...")
    df = pd.read_csv(NFL_URL)
    df = df[(df.season >= FIRST_CLASS) & (df.season <= LAST_CLASS)].copy()
    df = df.rename(columns={"season": "year", "pfr_player_name": "player"})
    df["value"] = df["w_av"].fillna(0)  # never played = 0 career value
    df["school"] = df["college"]
    df["sport"] = "NFL"
    return df[["year", "pick", "player", "position", "school", "value", "probowls", "allpro", "sport"]]


def load_nba(path: Path) -> pd.DataFrame:
    print(f"Reading NBA draft picks from {path}...")
    df = pd.read_csv(path, sep="|")
    df = df[(df.year >= FIRST_CLASS) & (df.year <= LAST_CLASS) & (df.pick <= 60)].copy()
    df["value"] = pd.to_numeric(df["ws"], errors="coerce").fillna(0)

    def normalize(name):
        if pd.isna(name):
            return name
        if name in NBA_TO_NFL:
            return NBA_TO_NFL[name]
        return name[:-6] + " St." if name.endswith(" State") else name

    df["school"] = df["college"].map(normalize)
    df["sport"] = "NBA"
    return df[["year", "pick", "player", "school", "value", "sport"]]


def school_table(df: pd.DataFrame, rng: np.random.Generator, score_col: str) -> pd.DataFrame:
    rows = []
    for school, g in df.dropna(subset=["school"]).groupby("school"):
        lo, hi = bootstrap_ci(g[score_col].to_numpy(), rng)
        rows.append({"school": school, "n": len(g), "mean": g[score_col].mean(), "lo": lo, "hi": hi,
                     "beat": (g["surplus"] > 0).mean()})
    return pd.DataFrame(rows).set_index("school")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--nba", type=Path, required=True, help="pipe-delimited NBA draft CSV")
    args = parser.parse_args()
    rng = np.random.default_rng(2026)

    nfl, nba = load_nfl(), load_nba(args.nba)
    for df in (nfl, nba):
        df["expected"] = expected_by_era(df, "year", "pick", "value")
        df["surplus"] = df["value"] - df["expected"]
        # Put both sports on one scale: surplus measured in standard deviations
        df["z"] = df["surplus"] / df["surplus"].std()

    # Two-sport ranking: schools with enough picks in BOTH leagues
    both = pd.concat([nfl, nba], ignore_index=True)
    table = school_table(both, rng, "z")
    counts = both.dropna(subset=["school"]).pivot_table(index="school", columns="sport", values="z", aggfunc="size").fillna(0)
    table = table.join(counts)
    eligible = table[(table.NFL >= MIN_NFL) & (table.NBA >= MIN_NBA)].sort_values("mean", ascending=False)
    eligible["rank"] = range(1, len(eligible) + 1)

    # Football-only ranking (bigger samples)
    nfl_table = school_table(nfl, rng, "surplus")
    nfl_table = nfl_table[nfl_table.n >= MIN_NFL_ONLY].sort_values("mean", ascending=False)
    nfl_table["rank"] = range(1, len(nfl_table) + 1)

    # Basketball-only ranking (small samples, so intervals are wide)
    nba_table = school_table(nba, rng, "surplus")
    nba_table = nba_table[nba_table.n >= MIN_NBA_ONLY].sort_values("mean", ascending=False)
    nba_table["rank"] = range(1, len(nba_table) + 1)

    def leaderboard(t: pd.DataFrame, top: int) -> list[dict]:
        """Every ranked school. "featured" marks the rows shown before the reader
        expands the list: the top schools, Cal, and well-known programs for context."""
        featured = set(t.index[:top]) | {s for s in PEERS + [CAL] if s in t.index}
        out = []
        for s in t.index:
            r = t.loc[s]
            out.append({"school": s, "rank": int(r["rank"]), "n": int(r["n"]), "mean": round(float(r["mean"]), 3),
                        "lo": round(float(r["lo"]), 3), "hi": round(float(r["hi"]), 3), "beat": round(float(r["beat"]), 3),
                        "featured": s in featured})
        return out

    # Cal players, biggest surplus first
    def players(df: pd.DataFrame, limit: int) -> list[dict]:
        cal = df[df.school == CAL].sort_values("surplus", ascending=False).head(limit)
        return [{"player": r.player, "year": int(r.year), "pick": int(r.pick), "value": round(float(r.value), 1),
                 "expected": round(float(r.expected), 1), "surplus": round(float(r.surplus), 1)} for r in cal.itertuples()]

    # Illustrative expectation curve per sport (all classes pooled), for the explainer chart
    def curve(df: pd.DataFrame, picks: list[int]) -> list[dict]:
        model = IsotonicRegression(increasing=False, out_of_bounds="clip").fit(df["pick"], df["value"])
        return [{"pick": p, "expected": round(float(model.predict([p])[0]), 1)} for p in picks]

    cal_two = eligible.loc[CAL]
    cal_nfl = nfl_table.loc[CAL]
    cal_nba = nba[nba.school == CAL]
    cal_nba_row = nba_table.loc[CAL]
    output = {
        "metadata": {
            "classes": [FIRST_CLASS, LAST_CLASS], "eraWindow": ERA_WINDOW,
            "nflPicks": int(len(nfl)), "nbaPicks": int(len(nba)),
            "twoSportSchools": int(len(eligible)), "nflSchools": int(len(nfl_table)),
            "nbaSchools": int(len(nba_table)),
            "minNfl": MIN_NFL, "minNba": MIN_NBA, "minNflOnly": MIN_NFL_ONLY, "minNbaOnly": MIN_NBA_ONLY,
            # Typical size of a hit or miss in each sport (standard deviation of surplus).
            # Dividing by these is what puts both sports on one scale.
            "nflSpread": round(float(nfl["surplus"].std()), 1), "nbaSpread": round(float(nba["surplus"].std()), 1),
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        },
        "cal": {
            "twoSportRank": int(cal_two["rank"]), "twoSportMean": round(float(cal_two["mean"]), 3),
            "twoSportLo": round(float(cal_two["lo"]), 3), "twoSportHi": round(float(cal_two["hi"]), 3),
            "nflRank": int(cal_nfl["rank"]), "nflPicks": int(cal_nfl["n"]), "nflMean": round(float(cal_nfl["mean"]), 2),
            "nflLo": round(float(cal_nfl["lo"]), 2), "nflHi": round(float(cal_nfl["hi"]), 2),
            "nbaPicks": int(len(cal_nba)), "nbaMean": round(float(cal_nba.surplus.mean()), 2),
            "nbaRank": int(cal_nba_row["rank"]), "nbaLo": round(float(cal_nba_row["lo"]), 2), "nbaHi": round(float(cal_nba_row["hi"]), 2),
            "nflBeatShare": round(float((nfl[nfl.school == CAL].surplus > 0).mean()), 3),
            "allBeatShare": round(float((nfl.surplus > 0).mean()), 3),
        },
        "twoSport": leaderboard(eligible, 10),
        "nflOnly": leaderboard(nfl_table, 10),
        "nbaOnly": leaderboard(nba_table, 10),
        "calNfl": players(nfl, 10),
        "calNba": players(nba, 6),
        "curves": {
            "nfl": curve(nfl, [1, 5, 10, 16, 24, 32, 48, 64, 96, 128, 160, 192, 224, 256]),
            "nba": curve(nba, [1, 3, 5, 10, 15, 21, 30, 40, 50, 60]),
        },
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(output, indent=2))
    print(f"Wrote {OUT_PATH}")
    print(f"  Cal two-sport rank: {output['cal']['twoSportRank']} of {len(eligible)}")
    print(f"  Cal NFL rank: {output['cal']['nflRank']} of {len(nfl_table)}")
    print(f"  Cal NBA rank: {output['cal']['nbaRank']} of {len(nba_table)}")


if __name__ == "__main__":
    main()
