#!/usr/bin/env python3
"""
fetch-baby-names.py

Downloads US Social Security Administration baby names data (1910-present)
and produces src/data/baby-names.json for the portfolio website.

Data sources (both free, no credentials required):
  National: https://www.ssa.gov/oact/babynames/names.zip
  By state:  https://www.ssa.gov/oact/babynames/state/namesbystate.zip

Run from the repo root:
  pip install -r scripts/requirements.txt
  python scripts/fetch-baby-names.py
"""

import io
import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import requests

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

NATIONAL_URL = "https://www.ssa.gov/oact/babynames/names.zip"
STATE_URL = "https://www.ssa.gov/oact/babynames/state/namesbystate.zip"
OUT_PATH = Path(__file__).parent.parent / "src" / "data" / "baby-names.json"

TOP_N = 300          # names to include in topNames (caps file size)
MIN_YEAR = 1910      # SSA data starts reliably here
MIN_STATE_COUNT = 300  # min state births for a name to appear in regional highlights
PEAK_MIN_SHARE = 0.0005  # ignore names too obscure for comeback analysis


# ---------------------------------------------------------------------------
# Step 1: Download and parse national data
# ---------------------------------------------------------------------------

def download_national(url: str) -> pd.DataFrame:
    print("Downloading national baby names data...")
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
    resp = requests.get(url, timeout=120, headers=headers)
    resp.raise_for_status()

    frames = []
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        for fname in sorted(zf.namelist()):
            if not fname.startswith("yob") or not fname.endswith(".txt"):
                continue
            year = int(fname[3:7])
            if year < MIN_YEAR:
                continue
            with zf.open(fname) as f:
                df = pd.read_csv(f, header=None, names=["name", "gender", "count"])
                df["year"] = year
                frames.append(df)

    data = pd.concat(frames, ignore_index=True)
    print(f"  {len(data):,} name-year-gender rows, {data['year'].min()}–{data['year'].max()}")
    return data


# ---------------------------------------------------------------------------
# Step 2: Download and parse state data
# ---------------------------------------------------------------------------

def download_state(url: str) -> pd.DataFrame:
    print("Downloading state baby names data...")
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
    resp = requests.get(url, timeout=120, headers=headers)
    resp.raise_for_status()

    frames = []
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        for fname in zf.namelist():
            if not fname.upper().endswith(".TXT"):
                continue
            with zf.open(fname) as f:
                try:
                    df = pd.read_csv(
                        f, header=None,
                        names=["state", "gender", "year", "name", "count"]
                    )
                    df = df[df["year"] >= MIN_YEAR]
                    if not df.empty:
                        frames.append(df)
                except Exception:
                    pass  # skip any malformed files

    data = pd.concat(frames, ignore_index=True)
    print(f"  {len(data):,} state-name-year-gender rows")
    return data


# ---------------------------------------------------------------------------
# Step 3: Normalize counts by total births per year
# ---------------------------------------------------------------------------

def add_share(df: pd.DataFrame) -> pd.DataFrame:
    """Add 'share' column: name count / total births that year (both genders)."""
    yearly_totals = df.groupby("year")["count"].sum().rename("year_total")
    df = df.join(yearly_totals, on="year")
    df["share"] = df["count"] / df["year_total"]
    return df


# ---------------------------------------------------------------------------
# Step 4: topNames — top 300 names with year-by-year data + predictor range
# ---------------------------------------------------------------------------

def compute_top_names(df: pd.DataFrame, n: int) -> list[dict]:
    print(f"Computing top {n} names...")

    totals = df.groupby(["name", "gender"])["count"].sum().reset_index()
    top_pairs = totals.nlargest(n, "count")[["name", "gender"]].reset_index(drop=True)

    results = []
    for _, row in top_pairs.iterrows():
        name, gender = row["name"], row["gender"]
        subset = (
            df[(df["name"] == name) & (df["gender"] == gender)]
            .sort_values("year")
        )
        if subset.empty:
            continue

        # Peak year by normalized share
        peak_year = int(subset.loc[subset["share"].idxmax(), "year"])

        # Predictor: percentiles of birth-year distribution weighted by count
        counts = subset["count"].values
        years = subset["year"].values
        total = counts.sum()
        if total == 0:
            continue
        cum = counts.cumsum() / total

        def pct(threshold: float) -> int:
            idx = (cum >= threshold).argmax()
            return int(years[idx])

        predicted_range = [pct(0.10), pct(0.50), pct(0.90)]

        yearly_data = [
            {
                "year": int(r["year"]),
                "count": int(r["count"]),
                "share": round(float(r["share"]), 6),
            }
            for _, r in subset.iterrows()
        ]

        results.append({
            "name": name,
            "gender": gender,
            "peakYear": peak_year,
            "predictedRange": predicted_range,
            "yearlyData": yearly_data,
        })

    print(f"  Built {len(results)} entries")
    return results


# ---------------------------------------------------------------------------
# Step 4b: yearlyTop — top 10 girls' and boys' names for every year
# Drives the animated "name time machine". Ranked by count within each
# year and gender, straight from the full national data (not just topNames).
# ---------------------------------------------------------------------------

def compute_yearly_top(df: pd.DataFrame, n: int = 10) -> list[dict]:
    print(f"Computing top {n} names per year...")
    # rank within each (year, gender) group; method="first" breaks ties by order
    ranked = df.sort_values("count", ascending=False).copy()
    ranked["rank"] = ranked.groupby(["year", "gender"]).cumcount() + 1
    top = ranked[ranked["rank"] <= n]

    results = []
    for year, group in top.groupby("year"):
        entry = {"year": int(year)}
        for gender in ("F", "M"):
            rows = group[group["gender"] == gender].sort_values("rank")
            # [name, count] pairs in rank order
            entry[gender] = [[r["name"], int(r["count"])] for _, r in rows.iterrows()]
        results.append(entry)
    print(f"  Built {len(results)} years")
    return results


# ---------------------------------------------------------------------------
# Step 5: comebackNames — peaked pre-1950, faded, recovered post-2000
# ---------------------------------------------------------------------------

def compute_comeback_names(df: pd.DataFrame) -> list[dict]:
    print("Computing comeback names...")
    results = []

    for (name, gender), group in df.groupby(["name", "gender"]):
        group = group.sort_values("year")

        pre1950 = group[group["year"] < 1950]
        if pre1950.empty:
            continue

        peak_row = pre1950.loc[pre1950["share"].idxmax()]
        peak_year = int(peak_row["year"])
        peak_share = float(peak_row["share"])

        if peak_share < PEAK_MIN_SHARE:
            continue

        # Must have dropped to < 10% of peak for 20+ consecutive years
        post_peak = group[(group["year"] > peak_year) & (group["year"] <= 2000)]
        if len(post_peak) < 20:
            continue

        threshold = peak_share * 0.10
        below = (post_peak["share"] < threshold).values
        # Check for 20 consecutive years below threshold
        run = 0
        max_run = 0
        for b in below:
            run = run + 1 if b else 0
            max_run = max(max_run, run)
        if max_run < 20:
            continue

        trough_year = int(post_peak.loc[post_peak["share"].idxmin(), "year"])

        # Must have recovered post-2000 to > 50% of original peak
        post2000 = group[group["year"] > 2000]
        if post2000.empty:
            continue

        recovery_threshold = peak_share * 0.50
        recovered = post2000[post2000["share"] >= recovery_threshold]
        if recovered.empty:
            continue

        comeback_year = int(recovered["year"].min())
        recovery_share = float(post2000["share"].max())

        results.append({
            "name": name,
            "gender": gender,
            # [year, share] pairs, compact to keep the JSON small; drives the comeback curve charts
            "yearlyData": [[int(y), round(float(v), 6)] for y, v in zip(group["year"], group["share"])],
            "originalPeakYear": peak_year,
            "troughYear": trough_year,
            "comebackYear": comeback_year,
            "originalPeakShare": round(peak_share, 6),
            "recoveryShare": round(recovery_share, 6),
        })

    results.sort(key=lambda x: x["originalPeakShare"], reverse=True)
    print(f"  Found {len(results)} comeback names")
    return results[:20]


# ---------------------------------------------------------------------------
# Step 6: unisexNames — meaningful usage by both genders
# ---------------------------------------------------------------------------

def compute_unisex_names(df: pd.DataFrame) -> list[dict]:
    print("Computing unisex names...")

    pivot = df.groupby(["name", "gender"])["count"].sum().unstack(fill_value=0)
    for col in ("M", "F"):
        if col not in pivot.columns:
            pivot[col] = 0

    pivot["total"] = pivot["M"] + pivot["F"]
    pivot["male_frac"] = pivot["M"] / pivot["total"]

    unisex = pivot[
        (pivot["male_frac"] >= 0.10) &
        (pivot["male_frac"] <= 0.90) &
        (pivot["total"] >= 5000)
    ].sort_values("total", ascending=False)

    results = []
    for name in unisex.index[:15]:
        name_data = df[df["name"] == name]
        year_piv = (
            name_data.groupby(["year", "gender"])["count"]
            .sum()
            .unstack(fill_value=0)
        )
        for col in ("M", "F"):
            if col not in year_piv.columns:
                year_piv[col] = 0

        year_piv["total"] = year_piv["M"] + year_piv["F"]
        year_piv = year_piv[year_piv["total"] > 0]
        year_piv["maleShare"] = year_piv["M"] / year_piv["total"]

        yearly_data = [
            {
                "year": int(y),
                "maleShare": round(float(row["maleShare"]), 3),
                "femaleShare": round(1.0 - float(row["maleShare"]), 3),
            }
            for y, row in year_piv.iterrows()
        ]

        # First year where dominant gender flips
        crossover_year = None
        prev = None
        for entry in yearly_data:
            dom = "M" if entry["maleShare"] >= 0.5 else "F"
            if prev is not None and dom != prev:
                crossover_year = entry["year"]
                break
            prev = dom

        results.append({
            "name": name,
            "crossoverYear": crossover_year,
            "yearlyData": yearly_data,
        })

    print(f"  Found {len(results)} unisex names")
    return results


# ---------------------------------------------------------------------------
# Step 7: regionalHighlights — names disproportionately popular in one state
# ---------------------------------------------------------------------------

def compute_regional_highlights(state_df: pd.DataFrame) -> list[dict]:
    print("Computing regional highlights...")

    national = (
        state_df.groupby(["name", "gender"])["count"].sum().rename("national_count")
    )
    national_total = state_df["count"].sum()
    national_share = (national / national_total).rename("national_share")

    state_totals = state_df.groupby("state")["count"].sum().rename("state_total")
    state_counts = (
        state_df.groupby(["name", "gender", "state"])["count"].sum().reset_index()
    )
    state_counts = state_counts.join(state_totals, on="state")
    state_counts["state_share"] = state_counts["count"] / state_counts["state_total"]
    state_counts = state_counts.join(national_share, on=["name", "gender"])
    state_counts["ratio"] = state_counts["state_share"] / state_counts["national_share"]

    # Filter noise
    state_counts = state_counts[
        (state_counts["count"] >= MIN_STATE_COUNT) &
        (state_counts["national_share"] >= 0.0001)
    ]

    top = state_counts.nlargest(10, "ratio")

    results = []
    for _, row in top.iterrows():
        results.append({
            "name": row["name"],
            "gender": row["gender"],
            "state": row["state"],
            "stateShare": round(float(row["state_share"]), 6),
            "nationalShare": round(float(row["national_share"]), 6),
            "ratio": round(float(row["ratio"]), 2),
        })

    print(f"  Found {len(results)} regional highlights")
    return results


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    national_df = download_national(NATIONAL_URL)
    state_df = download_state(STATE_URL)

    national_df = add_share(national_df)

    top_names = compute_top_names(national_df, TOP_N)
    comeback_names = compute_comeback_names(national_df)
    yearly_top = compute_yearly_top(national_df)
    unisex_names = compute_unisex_names(national_df)
    regional_highlights = compute_regional_highlights(state_df)

    output = {
        "metadata": {
            "totalNames": int(national_df["name"].nunique()),
            "yearsRange": [int(national_df["year"].min()), int(national_df["year"].max())],
            "fetchedAt": datetime.now(timezone.utc).isoformat(),
            "totalBirths": int(national_df["count"].sum()),
        },
        "topNames": top_names,
        "yearlyTop": yearly_top,
        "comebackNames": comeback_names,
        "unisexNames": unisex_names,
        "regionalHighlights": regional_highlights,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(output, f, separators=(",", ":"))

    size_mb = OUT_PATH.stat().st_size / 1_000_000
    print(f"\n✓ Wrote {OUT_PATH}")
    print(f"  Size: {size_mb:.2f} MB")
    print(f"  topNames: {len(top_names)}")
    print(f"  comebackNames: {len(comeback_names)}")
    print(f"  yearlyTop: {len(yearly_top)} years")
    print(f"  unisexNames: {len(unisex_names)}")
    print(f"  regionalHighlights: {len(regional_highlights)}")

    if size_mb > 2.5:
        print("  ⚠ File is large — consider reducing TOP_N in the script config")


if __name__ == "__main__":
    main()
