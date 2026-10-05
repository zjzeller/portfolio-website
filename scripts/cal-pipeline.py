#!/usr/bin/env python3
"""
cal-pipeline.py

Does Cal get more out of its players than their draft slot predicts?

For every NFL and NBA draft pick since 1980, estimate how much career value a
player *should* produce given where he was drafted, then compare it with what
he actually produced. Average that "surplus" by college and see where Cal
ranks, over 40 years and inside one coaching era. Then try to break the
result (stress_tests). Writes src/data/cal-pipeline.json for the case study page.

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
PERMUTATIONS = 5000  # shuffles used for the "could this be luck?" tests

# The coaching era under test. Jeff Tedford was Cal's head coach for the 2002
# through 2012 seasons, so the players he coached were drafted 2003 to 2013.
# The window comes from his tenure, not from where the numbers look best.
ERA_COACH = "Jeff Tedford"
ERA_FIRST, ERA_LAST = 2003, 2013
MIN_ERA = 25  # picks a school needs inside the era to be ranked
WINDOW_YEARS = ERA_LAST - ERA_FIRST + 1

# NFL position labels grouped so each group has enough players to average
POSITION_GROUPS = {
    "CB": "DB", "S": "DB", "OLB": "LB", "ILB": "LB", "DE": "DL", "DT": "DL", "NT": "DL",
    "T": "OL", "G": "OL", "C": "OL", "FB": "RB",
}
CONCENTRATION_FROM = 1994  # first year of the seven-round NFL draft
CAL = "California"

# Basketball Reference spells some schools differently from the NFL data
NBA_TO_NFL = {
    "UNC": "North Carolina", "UConn": "Connecticut", "Pitt": "Pittsburgh",
    "NC State": "North Carolina State", "St. John's": "St. John's (NY)",
    "Ole Miss": "Mississippi", "Miami University": "Miami (OH)", "Southern California": "USC",
}
# The NFL data abbreviates some names; spell them out on the page
NFL_DISPLAY = {"Boston Col.": "Boston College"}

# Big programs to always show next to the leaders, for context
PEERS = ["Stanford", "USC", "UCLA", "Oregon", "Washington", "Arizona", "Duke",
         "North Carolina", "Kentucky", "Kansas", "Michigan", "Ohio State", "Texas",
         "Florida", "Alabama", "Notre Dame"]


def display_school(name):
    """One spelling for every school: 'Ohio St.' -> 'Ohio State', 'Boston Col.' -> 'Boston College'."""
    if pd.isna(name):
        return name
    name = NFL_DISPLAY.get(name, name)
    return name[:-4] + " State" if name.endswith(" St.") else name


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


def read_nfl_raw() -> pd.DataFrame:
    print("Downloading NFL draft picks...")
    return pd.read_csv(NFL_URL)


def load_nfl(raw: pd.DataFrame) -> pd.DataFrame:
    df = raw[(raw.season >= FIRST_CLASS) & (raw.season <= LAST_CLASS)].copy()
    df = df.rename(columns={"season": "year", "pfr_player_name": "player"})
    df["value"] = df["w_av"].fillna(0)  # never played = 0 career value
    df["school"] = df["college"].map(display_school)
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
        return display_school(NBA_TO_NFL.get(name, name))

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


def rank_of(means: pd.Series, school: str) -> int:
    """1 = highest average."""
    return int(means.rank(ascending=False, method="min")[school])


def school_means(df: pd.DataFrame, min_picks: int, col: str = "surplus") -> pd.Series:
    g = df.dropna(subset=["school"]).groupby("school")[col].agg(["size", "mean"])
    return g[g["size"] >= min_picks]["mean"]


def luck_test(df: pd.DataFrame, schools: pd.Index, school: str, rng: np.random.Generator) -> tuple[float, float]:
    """Permutation test. Shuffle which school each pick belongs to (keeping every
    school's number of picks) and recompute the averages, PERMUTATIONS times.
    Returns (share of shuffles where THIS school scores as high as it really did,
             share of shuffles where ANY school does).
    The second number is the honest one when you went looking for a winner."""
    sub = df[df.school.isin(schools)]
    values = sub["surplus"].to_numpy()
    codes = pd.Categorical(sub.school, categories=schools).codes
    sizes = np.bincount(codes)
    target = list(schools).index(school)
    observed = values[codes == target].mean()
    this_school = any_school = 0
    for _ in range(PERMUTATIONS):
        means = np.bincount(codes, weights=rng.permutation(values)) / sizes
        this_school += means[target] >= observed
        any_school += means.max() >= observed
    return this_school / PERMUTATIONS, any_school / PERMUTATIONS


def robustness(nfl: pd.DataFrame, min_picks: int, thresholds: tuple, rng: np.random.Generator) -> dict:
    """Ways a school ranking could be an artifact, each checked directly.
    Works for any set of draft classes (the 40-year ranking or one era)."""
    base = school_means(nfl, min_picks)
    out: dict = {"schools": int(len(base)), "rank": rank_of(base, CAL)}

    # 1. Does the rank depend on where the minimum-picks line is drawn?
    out["thresholds"] = [{"min": t, "schools": int(len(school_means(nfl, t))), "rank": rank_of(school_means(nfl, t), CAL)}
                         for t in thresholds]

    # 2. Shrinkage: pull each school toward zero in proportion to how noisy its
    #    average is (few picks = more pull). Standard empirical-Bayes estimate.
    sizes = nfl.dropna(subset=["school"]).groupby("school").size()[base.index]
    noise = nfl["surplus"].var() / sizes
    real_spread = max(base.var() - noise.mean(), 0)
    shrunk = base * real_spread / (real_spread + noise)
    out["shrunkRank"] = rank_of(shrunk, CAL)
    out["shrunkMean"] = round(float(shrunk[CAL]), 1)

    # 3. Outliers: cap every score at the 99th percentile so no single star dominates
    capped = nfl.assign(capped=nfl["surplus"].clip(upper=nfl["surplus"].quantile(0.99)))
    out["cappedRank"] = rank_of(school_means(capped, min_picks, "capped"), CAL)
    out["capAt"] = round(float(nfl["surplus"].quantile(0.99)), 1)

    # 4. Positions: subtract each position group's average score, then re-rank
    group = nfl["position"].replace(POSITION_GROUPS)
    adjusted = nfl.assign(adj=nfl["surplus"] - nfl.groupby(group)["surplus"].transform("mean"))
    out["positionRank"] = rank_of(school_means(adjusted, min_picks, "adj"), CAL)
    no_qb = school_means(nfl[nfl.position != "QB"], min_picks)
    out["noQbRank"], out["noQbSchools"] = rank_of(no_qb, CAL), int(len(no_qb))

    # 5. Remove every school's best player
    def drop_best(g: pd.DataFrame) -> float:
        return g["surplus"].sort_values(ascending=False).iloc[1:].mean()
    without_best = nfl[nfl.school.isin(base.index)].groupby("school").apply(drop_best, include_groups=False)
    out["withoutBestRank"] = rank_of(without_best, CAL)
    out["withoutBestMean"] = round(float(without_best[CAL]), 1)

    # 6. Luck: shuffle players between schools and see how often a school scores this high
    this_school, any_school = luck_test(nfl, base.sort_values(ascending=False).index, CAL, rng)
    out["luck"] = {"cal": round(this_school, 3), "anySchool": round(any_school, 2)}
    return out


def stress_tests(nfl: pd.DataFrame, rng: np.random.Generator) -> dict:
    """The 40-year football ranking, plus the tests that only make sense over 40 years."""
    out = robustness(nfl, MIN_NFL_ONLY, (40, 60, 80, 100, 120), rng)

    # 5. Does a school's result in one decade predict the next? (It should, if
    #    "school" were a lasting trait.)
    decades = [(1980, 1989), (1990, 1999), (2000, 2009), (2010, 2020)]
    def window(a, b):
        return nfl[(nfl.year >= a) & (nfl.year <= b)]
    out["decades"] = []
    for (a1, b1), (a2, b2) in zip(decades, decades[1:]):
        pair = pd.concat([school_means(window(a1, b1), 20), school_means(window(a2, b2), 20)], axis=1).dropna()
        out["decades"].append({"from": f"{a1}s", "to": f"{a2}s", "schools": int(len(pair)),
                               "correlation": round(float(pair.corr().iloc[0, 1]), 2)})

    # 6. Cal before and after 2000
    for key, (a, b) in {"early": (1980, 1999), "late": (2000, 2020)}.items():
        m = school_means(window(a, b), 30)
        out[key] = {"years": [a, b], "rank": rank_of(m, CAL), "schools": int(len(m)), "mean": round(float(m[CAL]), 1)}

    out["luckAllTime"] = out["luck"]
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--nba", type=Path, required=True, help="pipe-delimited NBA draft CSV")
    args = parser.parse_args()
    rng = np.random.default_rng(2026)

    raw_nfl = read_nfl_raw()
    nfl, nba = load_nfl(raw_nfl), load_nba(args.nba)
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

    # ---- The coaching era -------------------------------------------------
    era = nfl[(nfl.year >= ERA_FIRST) & (nfl.year <= ERA_LAST)]
    era_table = school_table(era, rng, "surplus")
    era_table = era_table[era_table.n >= MIN_ERA].sort_values("mean", ascending=False)
    era_table["rank"] = range(1, len(era_table) + 1)
    cal_era = era_table.loc[CAL]
    era_stress = robustness(era, MIN_ERA, (20, 25, 30, 35, 40), rng)

    # How rare is a stretch this good? Compare with every window of the same
    # length at every school since 1980.
    rivals = set()
    windows = 0
    for start in range(FIRST_CLASS, LAST_CLASS - WINDOW_YEARS + 2):
        m = school_means(nfl[(nfl.year >= start) & (nfl.year < start + WINDOW_YEARS)], MIN_ERA)
        windows += len(m)
        rivals |= set(m[m >= cal_era["mean"]].index)
    rivals.discard(CAL)

    # Each school's score over time: average per pick across a rolling five-class window
    def rolling(school: str) -> list[dict]:
        picks = nfl[nfl.school == school]
        out = []
        for year in range(FIRST_CLASS + 2, LAST_CLASS - 1):
            w = picks[(picks.year >= year - 2) & (picks.year <= year + 2)]
            out.append({"year": year, "mean": round(float(w.surplus.mean()), 1) if len(w) else None, "picks": int(len(w))})
        return out
    timeline = rolling(CAL)
    timelines = {s: rolling(s) for s in sorted(set(nfl_table.index) | set(era_table.index))}

    # Notable players from the other ranked schools in the era, for side-by-side comparison:
    # each school's five biggest outperformers and two biggest busts
    others = []
    for school, g in era[era.school.isin(era_table.index) & (era.school != CAL)].groupby("school"):
        g = g.sort_values("surplus", ascending=False)
        for r in pd.concat([g.head(5), g.tail(2)]).drop_duplicates("player").itertuples():
            others.append({"player": r.player, "school": school, "year": int(r.year), "pick": int(r.pick),
                           "value": round(float(r.value), 1), "expected": round(float(r.expected), 1),
                           "surplus": round(float(r.surplus), 1)})

    # ---- Talent concentration (context for NIL and the transfer portal) ----
    # Uses every draft through the latest one, not just the modeled classes.
    concentration = []
    for season, g in raw_nfl[raw_nfl.season >= CONCENTRATION_FROM].dropna(subset=["college"]).groupby("season"):
        counts = g.college.value_counts()
        concentration.append({"year": int(season), "schools": int(len(counts)),
                              "top25Share": round(float(counts.head(25).sum() / len(g)), 3)})

    stress = stress_tests(nfl, rng)
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
            "era": [ERA_FIRST, ERA_LAST], "eraCoach": ERA_COACH, "eraSchools": int(len(era_table)), "minEra": MIN_ERA,
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
        "calEra": {
            "rank": int(cal_era["rank"]), "picks": int(cal_era["n"]), "mean": round(float(cal_era["mean"]), 1),
            "lo": round(float(cal_era["lo"]), 1), "hi": round(float(cal_era["hi"]), 1),
            "beatShare": round(float(cal_era["beat"]), 4), "allBeatShare": round(float((era.surplus > 0).mean()), 4),
            "withoutBestMean": era_stress["withoutBestMean"], "withoutBestRank": era_stress["withoutBestRank"],
            "luckCal": era_stress["luck"]["cal"], "luckAnySchool": era_stress["luck"]["anySchool"],
            "windowsCompared": int(windows), "schoolsWithAsGoodAStretch": sorted(rivals),
        },
        "eraBoard": leaderboard(era_table, 10),
        "eraPlayers": players(era, 10),
        "eraOthers": others,
        "eraStress": era_stress,
        "timeline": timeline,
        "timelines": timelines,
        "stress": stress,
        "concentration": concentration,
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
    print(f"  Cal {ERA_FIRST}-{ERA_LAST} rank: {output['calEra']['rank']} of {len(era_table)}")


if __name__ == "__main__":
    main()
