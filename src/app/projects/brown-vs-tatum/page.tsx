'use client'

import PageViewTracker from '@/components/analytics/PageViewTracker'
import SeasonLineChart from '@/components/charts/SeasonLineChart'
import ComparisonBarChart from '@/components/charts/ComparisonBarChart'
import PlayerRadarChart from '@/components/charts/PlayerRadarChart'
import ClutchChart from '@/components/charts/ClutchChart'
import playerData from '@/data/brown-vs-tatum.json'

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

const brown = playerData.players.jaylen_brown
const tatum = playerData.players.jayson_tatum

/** All season years across both players (union, sorted). */
const allYears: string[] = Array.from(
  new Set([...brown.seasons.map((s) => s.year), ...tatum.seasons.map((s) => s.year)])
).sort()

type RegularKey = keyof NonNullable<(typeof brown.seasons)[0]['regular']>
type ClutchKey = keyof NonNullable<(typeof brown.seasons)[0]['clutch']>

function getSeasonStat(
  stat: RegularKey
): { year: string; brown: number | null; tatum: number | null }[] {
  return allYears.map((year) => {
    const bSeason = brown.seasons.find((s) => s.year === year)
    const tSeason = tatum.seasons.find((s) => s.year === year)
    return {
      year,
      brown: bSeason?.regular?.[stat] ?? null,
      tatum: tSeason?.regular?.[stat] ?? null,
    }
  })
}

function getClutchSeasonStat(
  stat: ClutchKey
): { year: string; brown: number | null; tatum: number | null }[] {
  return allYears.map((year) => {
    const bSeason = brown.seasons.find((s) => s.year === year)
    const tSeason = tatum.seasons.find((s) => s.year === year)
    return {
      year,
      brown: bSeason?.clutch?.[stat] ?? null,
      tatum: tSeason?.clutch?.[stat] ?? null,
    }
  })
}

/** Average the last N non-null seasons of a clutch stat for a player. */
function clutchAvgRecent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  player: { seasons: any[] },
  stat: ClutchKey,
  n: number
): number {
  const vals = player.seasons
    .map((s: { clutch?: Record<string, number> | null }) => s.clutch?.[stat])
    .filter((v: unknown): v is number => v != null)
  const recent = vals.slice(-n)
  return recent.reduce((a: number, b: number) => a + b, 0) / recent.length
}

// ---------------------------------------------------------------------------
// Pre-computed chart data
// ---------------------------------------------------------------------------

const ppgData = getSeasonStat('ppg')
const fgPctData = getSeasonStat('fg_pct')
// Radar data: normalize career averages to 0-10 scale
const radarCategories: { key: keyof typeof brown.career_averages; label: string }[] = [
  { key: 'ppg', label: 'Scoring' },
  { key: 'rpg', label: 'Rebounding' },
  { key: 'apg', label: 'Assists' },
  { key: 'spg', label: 'Steals' },
  { key: 'bpg', label: 'Blocks' },
  { key: 'fg_pct', label: 'FG%' },
]

const radarData = radarCategories.map(({ key, label }) => {
  const bVal = brown.career_averages[key] as number
  const tVal = tatum.career_averages[key] as number
  const max = Math.max(bVal, tVal)
  return {
    category: label,
    brown: Math.round((bVal / max) * 10 * 10) / 10,
    tatum: Math.round((tVal / max) * 10 * 10) / 10,
    fullMark: 10,
  }
})

// Clutch comparison: average of last 3 seasons (2022-23, 2023-24, 2024-25)
const clutchComparisonData: { label: string; brown: number; tatum: number }[] = [
  {
    label: 'Clutch FG%',
    brown: Math.round(clutchAvgRecent(brown, 'fg_pct', 3) * 1000) / 10,
    tatum: Math.round(clutchAvgRecent(tatum, 'fg_pct', 3) * 1000) / 10,
  },
  {
    label: 'Clutch +/-',
    brown: Math.round(clutchAvgRecent(brown, 'plus_minus', 3) * 10) / 10,
    tatum: Math.round(clutchAvgRecent(tatum, 'plus_minus', 3) * 10) / 10,
  },
  {
    label: 'Clutch PPG',
    brown: Math.round(clutchAvgRecent(brown, 'pts', 3) * 10) / 10,
    tatum: Math.round(clutchAvgRecent(tatum, 'pts', 3) * 10) / 10,
  },
]

const clutchFgTrendData = getClutchSeasonStat('fg_pct')

// Advanced career comparison: use best recent season (2024-25 for Tatum since 2025-26 is null, 2025-26 for Brown)
const advancedComparisonData: { label: string; brown: number; tatum: number }[] = [
  {
    label: 'PER',
    brown: brown.seasons[brown.seasons.length - 1]?.advanced?.per ?? 0,
    tatum: tatum.seasons.find((s) => s.year === '2024-25')?.advanced?.per ?? 0,
  },
  {
    label: 'Win Shares',
    brown: brown.seasons[brown.seasons.length - 1]?.advanced?.ws ?? 0,
    tatum: tatum.seasons.find((s) => s.year === '2024-25')?.advanced?.ws ?? 0,
  },
  {
    label: 'BPM',
    brown: brown.seasons[brown.seasons.length - 1]?.advanced?.bpm ?? 0,
    tatum: tatum.seasons.find((s) => s.year === '2024-25')?.advanced?.bpm ?? 0,
  },
  {
    label: 'VORP',
    brown: brown.seasons[brown.seasons.length - 1]?.advanced?.vorp ?? 0,
    tatum: tatum.seasons.find((s) => s.year === '2024-25')?.advanced?.vorp ?? 0,
  },
]

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const fmtPct = (v: number) => (v < 1 ? `${(v * 100).toFixed(1)}%` : `${v.toFixed(1)}%`)
const fmtDec = (v: number) => v.toFixed(1)


// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function BrownVsTatumPage() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-4xl">
      <PageViewTracker pagePath="/projects/brown-vs-tatum" pageTitle="Brown vs Tatum Analysis" />

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 1 - HERO                                                  */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-20 animate-reveal">
        <span className="section-label">Data Analysis</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl mt-4 tracking-tight">
          The Case for<br />
          <span className="text-[var(--accent)]">Jaylen Brown</span>
        </h1>
        <div className="editorial-rule w-16 mt-6" />
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed mt-8 max-w-2xl">
          Jayson Tatum is the franchise player. The first option. The perennial All-NBA selection.
          But when the game is on the line and the margin between a championship and a collapse
          shrinks to a single possession, who do you actually want with the ball?
          The numbers tell a more complicated story than the hierarchy suggests.
        </p>

        {/* Head-to-head snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 border-t border-[var(--border-subtle)] pt-8">
          {[
            { label: 'PPG', b: brown.career_averages.ppg, t: tatum.career_averages.ppg },
            { label: 'RPG', b: brown.career_averages.rpg, t: tatum.career_averages.rpg },
            { label: 'APG', b: brown.career_averages.apg, t: tatum.career_averages.apg },
            { label: 'FG%', b: brown.career_averages.fg_pct, t: tatum.career_averages.fg_pct },
          ].map(({ label, b, t }) => (
            <div key={label} className="text-center">
              <p className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-3">{label}</p>
              <div className="flex items-center justify-center gap-4">
                <span
                  className={`font-[family-name:var(--font-dm-mono)] text-xl ${
                    (label === 'FG%' ? b > t : b > t) ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {label === 'FG%' ? (b * 100).toFixed(1) : b.toFixed(1)}
                </span>
                <span className="text-[var(--border)] text-xs">vs</span>
                <span
                  className={`font-[family-name:var(--font-dm-mono)] text-xl ${
                    (label === 'FG%' ? t > b : t > b) ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {label === 'FG%' ? (t * 100).toFixed(1) : t.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-center gap-4 mt-1 text-[10px] tracking-wide uppercase text-[var(--text-secondary)]">
                <span>Brown</span>
                <span></span>
                <span>Tatum</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2 - THE SCORING STORY                                     */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-20 animate-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Scoring</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          The Scoring Story
        </h2>

        <div className="space-y-6 mb-10">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            The surface-level career averages favor Tatum:{' '}
            <span className="metric text-[var(--accent)]">23.6</span> points per game to Brown&apos;s{' '}
            <span className="metric text-[var(--accent)]">19.7</span>. Case closed, right? Not so fast. That career
            number is dragged down by Brown&apos;s first two seasons as a raw, developing wing off the bench.
            The trajectory tells a completely different story.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Brown entered the league averaging just{' '}
            <span className="metric text-[var(--accent)]">6.6</span> points as a rookie in 2016-17. This season,
            he is pouring in <span className="metric text-[var(--accent)]">29.3</span> per game, a jump of nearly
            23 points that represents one of the steepest scoring ascents in modern NBA history.
            Tatum&apos;s arc has been more conventional: a steady rise that peaked at{' '}
            <span className="metric text-[var(--accent)]">30.1</span> in 2022-23, before settling back to{' '}
            <span className="metric text-[var(--accent)]">26.8</span> last season. In 2025-26,
            with Tatum sidelined, Brown has seized the top option role and thrived.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            What makes Brown&apos;s scoring especially notable is how efficiently he does it. His career field
            goal percentage of <span className="metric text-[var(--accent)]">.479</span> comfortably beats
            Tatum&apos;s <span className="metric text-[var(--accent)]">.459</span>. Brown has shot a higher
            percentage from the field in nearly every season they&apos;ve played together. He doesn&apos;t need
            as many shots to get his points, and he converts the ones he takes at a higher rate.
          </p>
        </div>

        <div className="my-10">
          <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-4">
            Points Per Game by Season
          </h3>
          <SeasonLineChart data={ppgData} statLabel="PPG" formatValue={fmtDec} />
        </div>

        <div className="my-10">
          <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-4">
            Field Goal Percentage by Season
          </h3>
          <SeasonLineChart data={fgPctData} statLabel="FG%" formatValue={fmtPct} />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 3 - THE COMPLETE PLAYER                                   */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-20 animate-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">All-Around</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          The Complete Player
        </h2>

        <div className="space-y-6 mb-10">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Let&apos;s be honest about where Tatum has the clear advantage. He is the more versatile
            all-around player. His career averages of{' '}
            <span className="metric text-[var(--accent)]">7.3</span> rebounds and{' '}
            <span className="metric text-[var(--accent)]">3.8</span> assists per game meaningfully outpace
            Brown&apos;s <span className="metric text-[var(--accent)]">5.4</span> and{' '}
            <span className="metric text-[var(--accent)]">2.8</span>. Tatum is also the superior shot-blocker
            at <span className="metric text-[var(--accent)]">0.7</span> blocks per game versus{' '}
            <span className="metric text-[var(--accent)]">0.4</span>. The radar chart below makes
            this gap unmistakable.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            But the radar also reveals a key nuance: Brown&apos;s shooting efficiency edge. That FG% advantage
            gives Brown the one category where his slice of the chart pushes beyond Tatum&apos;s.
            Steals are essentially a wash ({' '}
            <span className="metric text-[var(--accent)]">1.0</span> vs{' '}
            <span className="metric text-[var(--accent)]">1.1</span>). Tatum&apos;s well-roundedness is real.
            The question is whether well-roundedness is the same thing as being the most important
            player on the court in decisive moments.
          </p>
        </div>

        <div className="my-10">
          <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-4">
            Career Stat Profile (Normalized to 10)
          </h3>
          <PlayerRadarChart data={radarData} />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 4 - WHEN IT MATTERS MOST                                  */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-20 animate-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Clutch</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          When It Matters Most
        </h2>

        <div className="space-y-6 mb-10">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            This is where the narrative flips. The NBA defines &quot;clutch time&quot; as the final five
            minutes of a game with a margin of five points or fewer. It is the crucible that separates
            stars from closers. And over the past three seasons, Jaylen Brown has been the better
            closer by a significant margin.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Tatum entered the league as an electric clutch performer, shooting a scorching{' '}
            <span className="metric text-[var(--accent)]">.588</span> from the field in clutch
            situations during his rookie year. But that number has cratered. By 2022-23, he was
            hitting just <span className="metric text-[var(--accent)]">.351</span> in the clutch.
            He recovered slightly to <span className="metric text-[var(--accent)]">.361</span> in
            2023-24 and <span className="metric text-[var(--accent)]">.427</span> in 2024-25, but
            the downward trend line from his early career is unmistakable. Meanwhile, Brown posted
            clutch shooting marks of <span className="metric text-[var(--accent)]">.500</span> in
            2023-24 and <span className="metric text-[var(--accent)]">.511</span> in 2024-25,
            consistently outperforming his co-star when the pressure is highest.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Over the last three seasons, Brown&apos;s average clutch field goal percentage sits
            near <span className="metric text-[var(--accent)]">48%</span> compared to Tatum&apos;s{' '}
            <span className="metric text-[var(--accent)]">38%</span>. Brown&apos;s clutch plus/minus
            has been consistently positive, averaging around{' '}
            <span className="metric text-[var(--accent)]">+1.7</span> in that stretch, while Tatum&apos;s
            has hovered closer to <span className="metric text-[var(--accent)]">+1.6</span> despite
            dipping negative in 2021-22. The trend lines tell the story: Tatum&apos;s clutch
            performance is declining while Brown&apos;s is rising. In the moments that define
            legacies, Brown is pulling ahead.
          </p>
        </div>

        <div className="my-10">
          <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-4">
            Clutch Performance Comparison (Last 3 Seasons Avg)
          </h3>
          <ClutchChart data={clutchComparisonData} formatValue={fmtDec} />
        </div>

        <div className="my-10">
          <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-4">
            Clutch FG% Over Time
          </h3>
          <SeasonLineChart data={clutchFgTrendData} statLabel="Clutch FG%" formatValue={fmtPct} />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 5 - THE ADVANCED METRICS                                  */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-20 animate-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Advanced</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          The Advanced Metrics
        </h2>

        <div className="space-y-6 mb-10">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Here is where the Brown case hits its ceiling, and intellectual honesty demands
            we acknowledge it. Advanced metrics overwhelmingly favor Tatum. His 2024-25 PER of{' '}
            <span className="metric text-[var(--accent)]">21.7</span> compared to Brown&apos;s
            current <span className="metric text-[var(--accent)]">22.3</span> is close, but
            historically Tatum has led comfortably, peaking at{' '}
            <span className="metric text-[var(--accent)]">23.7</span> in 2022-23. In Win Shares,
            Box Plus/Minus, and Value Over Replacement Player, Tatum holds a commanding lead.
            His <span className="metric text-[var(--accent)]">9.5</span> Win Shares and{' '}
            <span className="metric text-[var(--accent)]">5.2</span> BPM in 2024-25 dwarf
            Brown&apos;s typical output in those categories.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            These metrics capture cumulative value over full 48-minute games, 82-game seasons.
            They measure everything, including the stretches of a Tuesday night in January when
            the score is tied at halftime. Tatum generates more total value across a season.
            But total value and decisive value are not the same thing, and the question of which
            matters more depends on what you are optimizing for.
          </p>
        </div>

        <div className="my-10">
          <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-4">
            Advanced Metrics Comparison (Most Recent Full Season)
          </h3>
          <ComparisonBarChart data={advancedComparisonData} formatValue={fmtDec} />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 6 - THE VERDICT                                           */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-10 animate-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Verdict</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          The Verdict
        </h2>

        <div className="space-y-6">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            If you are building a roster for an 82-game regular season, Tatum is the pick. His
            rebounding, playmaking, and cumulative advanced metrics make him the more complete
            player in the broadest sense. No stat-literate analyst would argue otherwise, and
            this piece does not try to.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            But basketball is not played in spreadsheets. It is played in arenas where the noise
            swallows your thoughts, where the shot clock is dying, and where the difference
            between a championship and a conference finals exit is one made jumper. In those
            moments, the data tells us something the conventional wisdom misses: Jaylen Brown
            is shooting nearly <span className="metric text-[var(--accent)]">10 percentage points</span>{' '}
            better than Tatum in the clutch over the last three seasons. His trajectory is still
            climbing at <span className="metric text-[var(--accent)]">29.3</span> points per game
            while Tatum&apos;s has plateaued. He shoots more efficiently from the field across
            his entire career. And when the Celtics won the 2024 championship, the Finals MVP
            trophy went to Brown, not Tatum.
          </p>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Tatum is the better regular-season player. Brown is the better closer. In the NBA,
            closers win rings.
          </p>
        </div>

        {/* Source note */}
        <div className="border-t border-[var(--border-subtle)] mt-16 pt-6">
          <p className="text-xs text-[var(--text-secondary)] opacity-60">
            Data sourced from NBA.com and Basketball Reference. Clutch stats defined as final 5 minutes,
            margin within 5 points. Analysis current through the 2025-26 season. True shooting
            percentages and advanced metrics courtesy of Basketball Reference.
          </p>
        </div>
      </section>
    </div>
  )
}
