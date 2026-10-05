import { pageMetadata } from '@/lib/metadata'
import { Github } from 'lucide-react'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import {
  DraftCurveChart,
  SchoolLeaderboard,
  RankingList,
  TrendChart,
  OutperformersChart,
} from '@/components/charts/CalPipelineCharts'
import { DataTable } from '@/components/charts/RetentionCharts'
import { requireProject } from '@/data/projects'
import data from '@/data/cal-pipeline.json'

export const metadata = pageMetadata(
  "Cal's Pro Pipeline",
  'Cal players drafted from 2003 to 2013 beat their draft slot by more than any other school\'s. A model of every NFL and NBA pick since 1980, the stress tests it survived, and why NIL makes a repeat unlikely.',
  '/projects/cal-pro-pipeline/opengraph-image.png'
)

const project = requireProject('/projects/cal-pro-pipeline')
const m = data.metadata
const cal = data.cal
const era = data.calEra
const stress = data.stress
const [eraFirst, eraLast] = m.era

// Talent concentration: the latest draft against the long-run norm before NIL (2021)
const NIL_YEAR = 2021
const preNil = data.concentration.filter((c) => c.year < NIL_YEAR)
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const preNilSchools = Math.round(avg(preNil.map((c) => c.schools)))
const preNilTop25 = avg(preNil.map((c) => c.top25Share))
const latest = data.concentration[data.concentration.length - 1]

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className="section-label">{label}</span>
      <div className="flex-1 h-px bg-[var(--border-subtle)]" />
    </div>
  )
}

// Small visible table for the stress tests (DataTable is collapsed by default; this one should be read)
function ChecksTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs tracking-wider uppercase text-[var(--text-muted)]">
            <th className="font-normal pb-3 pr-4">Test</th>
            <th className="font-normal pb-3 pr-4">What it rules out</th>
            <th className="font-normal pb-3">Cal&apos;s result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([test, guards, result]) => (
            <tr key={test} className="border-t border-[var(--border-subtle)] align-top">
              <td className="py-3 pr-4 text-[var(--text-primary)]">{test}</td>
              <td className="py-3 pr-4 text-[var(--text-secondary)]">{guards}</td>
              <td className="py-3 font-[family-name:var(--font-dm-mono)] text-xs text-[var(--accent)] min-w-[9rem]">{result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Metric({ children }: { children: React.ReactNode }) {
  return <span className="metric text-[var(--accent)]">{children}</span>
}

export default function CalProPipelinePage() {
  const rodgers = data.calNfl[0]
  const kidd = data.calNba[0]
  const brown = data.calNba.find((p) => p.player === 'Jaylen Brown')
  const pct = (x: number) => `${Math.round(x * 100)}%`
  const th = stress.thresholds
  // 1 -> 1st, 2 -> 2nd, 11 -> 11th, 21 -> 21st
  const ordinal = (n: number) => {
    const tens = n % 100
    const suffix = tens >= 11 && tens <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'
    return `${n}${suffix}`
  }

  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-4xl">
      <PageViewTracker pagePath="/projects/cal-pro-pipeline" pageTitle={project.title} />

      {/* HERO */}
      <section className="mb-20 animate-reveal">
        <span className="section-label">Sports Analytics &middot; Modeling</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl mt-4 tracking-tight">
          Cal&apos;s Pro Pipeline<br />
          <span className="text-[var(--accent)]">Beating the Draft Board</span>
        </h1>
        <div className="editorial-rule w-16 mt-6" />
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed mt-8 max-w-2xl">
          Aaron Rodgers went 24th. Keenan Allen went in the third round. Marshawn Lynch, DeSean Jackson and
          Cameron Jordan all outplayed where they were picked. Was Cal unusually good at producing pros, or are
          those a few famous names? I modeled how much career value every NFL and NBA draft pick since{' '}
          {m.classes[0]} <em>should</em> produce based on where he was taken, then tried to break my own answer.
        </p>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed mt-4 max-w-2xl">
          The short version: it was real, it belonged to one coaching era, and the way college sports works now
          makes it hard to repeat.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 border-t border-[var(--border-subtle)] pt-8">
          {[
            { label: `Of ${m.eraSchools} schools, ${eraFirst} to ${eraLast} draft classes`, value: `#${era.rank}` },
            { label: 'Career value per pick above draft slot', value: `+${era.mean}` },
            { label: `Of those picks beat their slot (${pct(era.allBeatShare)} overall)`, value: pct(era.beatShare) },
            { label: `Schools with a ${latest.year} draft pick (about ${preNilSchools} before NIL)`, value: `${latest.schools}` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-[family-name:var(--font-dm-mono)] text-2xl text-[var(--accent)]">{value}</p>
              <p className="text-xs tracking-wider uppercase text-[var(--text-muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE METHOD */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="The Approach" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Judge players against their draft slot, not each other
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4 max-w-2xl">
          A #1 pick is supposed to be great, so raw career totals mostly measure where a school&apos;s players
          got drafted. The fairer question is whether they did better than a typical player taken at the same
          spot. That&apos;s the same logic as judging a sales rep against quota instead of total revenue.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          For football, career value is Pro Football Reference&apos;s <Metric>Approximate Value</Metric>, one number
          for a player&apos;s total contribution (a solid starting season is roughly 8 to 10). For basketball
          it&apos;s <Metric>Win Shares</Metric>, the estimated wins a player added. The grey line shows the typical
          value at each pick; every dot above it is a Cal player who beat his slot.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm text-[var(--text-primary)] mb-2">Football: career Approximate Value by pick</h3>
            <DraftCurveChart curve={data.curves.nfl} players={data.calNfl} unit="Career AV" />
          </div>
          <div>
            <h3 className="text-sm text-[var(--text-primary)] mb-2">Basketball: career Win Shares by pick</h3>
            <DraftCurveChart curve={data.curves.nba} players={data.calNba} unit="Win Shares" labelTop={4} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: plain-language method for non-technical readers */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="How It Works" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          One score for two sports and every position
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          No player is ever compared directly with someone from another sport or another position. Each player
          is compared only with players from his own sport who were drafted at about the same spot in about the
          same years. The school ranking is built from those individual comparisons in four steps.
        </p>
        <ol className="space-y-5 text-[var(--text-secondary)] leading-relaxed max-w-2xl list-decimal pl-5">
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Set a bar for every draft slot.</strong>{' '}
            Using every player drafted in the same sport within {m.eraWindow} years, I find the typical career a
            team gets from each pick number. That is the bar. A #2 pick has a high bar. A third-rounder has a low
            one. The grey lines in the charts above are those bars.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Score each player against his own bar.</strong>{' '}
            The score is what he actually produced minus the bar. The bar for a #{rodgers.pick} pick in
            Rodgers&apos; era was <Metric>{rodgers.expected}</Metric> Approximate Value. He produced{' '}
            <Metric>{rodgers.value}</Metric>, so his score is <Metric>+{rodgers.surplus}</Metric>. A bust gets a
            negative score.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Put both sports on one scale.</strong>{' '}
            Football scores are in Approximate Value and basketball scores are in Win Shares. Those are different
            units, like dollars and yen, so they can&apos;t be added together. To convert them, I divide each score
            by the size of a typical hit or miss in that sport (statisticians call this the standard deviation):
            about <Metric>{m.nflSpread}</Metric> in football and <Metric>{m.nbaSpread}</Metric> in basketball.
            Rodgers&apos; +{rodgers.surplus} becomes <Metric>+{(rodgers.surplus / m.nflSpread).toFixed(1)}</Metric>,
            roughly seven times a typical miss. Jason Kidd&apos;s +{kidd.surplus} Win Shares becomes{' '}
            <Metric>+{(kidd.surplus / m.nbaSpread).toFixed(1)}</Metric>. Both numbers now mean the same thing: how
            far a player landed from expectations, measured in what is normal for his sport.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Average by school.</strong>{' '}
            A school&apos;s score is the average across all of its picks, busts included. A school needs enough picks
            to be ranked, because a handful of players can make any school look great or terrible.
          </li>
        </ol>
        <h3 className="text-sm text-[var(--text-primary)] mt-10 mb-2">What about positions?</h3>
        <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          The draft handles most of it. Teams already weigh position when they decide where to take a player, so
          a quarterback and a guard taken 24th face the same bar. I also checked it directly: adjusting every
          player&apos;s score for his position leaves Cal&apos;s rank unchanged, and so does removing every quarterback
          from every school.
        </p>
      </section>

      {/* FINDING 1: the 40-year view */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Finding 1" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Over 40 years, Cal ranks #{cal.twoSportRank} of {m.twoSportSchools}
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4 max-w-2xl">
          Putting both sports on one scale, Cal players beat their draft slot by more than players from all but
          three schools that send at least {m.minNfl} players to the NFL and {m.minNba} to the NBA. That&apos;s ahead
          of UCLA, Kentucky, Stanford, USC, North Carolina and Alabama. Football alone says the same: #
          {cal.nflRank} of {m.nflSchools} schools with {m.minNflOnly}+ picks. Basketball alone puts Cal #
          {cal.nbaRank} of {m.nbaSchools}, on a much smaller sample.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          Use the buttons to include football, basketball or both.
        </p>
        <SchoolLeaderboard
          both={{
            rows: data.twoSport,
            total: m.twoSportSchools,
            decimals: 2,
            unit: "Score: how far a school's picks land from their draft-slot bar, both sports on one scale (step 3 above). Zero means exactly as expected.",
          }}
          football={{
            rows: data.nflOnly,
            total: m.nflSchools,
            decimals: 1,
            unit: 'Score: career Approximate Value above or below the draft-slot bar, per pick.',
          }}
          basketball={{
            rows: data.nbaOnly,
            total: m.nbaSchools,
            decimals: 1,
            unit: 'Score: career Win Shares above or below the draft-slot bar, per pick. Far fewer picks than football, so the lines are long.',
          }}
        />
        <p className="text-[var(--text-secondary)] leading-relaxed mt-8 max-w-2xl">
          A good result, but a soft one. Cal&apos;s line crosses zero, and with {m.nflSchools} schools in the
          race, shuffling players randomly between schools puts some school this far ahead{' '}
          <Metric>{pct(stress.luckAllTime.anySchool)}</Metric> of the time. On its own, a 40-year ranking
          can&apos;t separate a real edge from a lucky one.
        </p>
      </section>

      {/* FINDING 2: it is an era, not a school */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Finding 2" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          It&apos;s an era, not a school
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4 max-w-2xl">
          A 40-year ranking assumes a school is the same thing for 40 years. It isn&apos;t. If beating the draft
          board were a lasting trait of a school, schools that did it in one decade would do it in the next. They
          don&apos;t: how a school&apos;s picks did in the {stress.decades[0].from} tells you nothing about the{' '}
          {stress.decades[0].to} (correlation <Metric>{stress.decades[0].correlation.toFixed(2)}</Metric>, where 1
          is a perfect match and 0 is none), and the {stress.decades[1].from} tell you nothing about the{' '}
          {stress.decades[1].to} (<Metric>{Math.abs(stress.decades[1].correlation).toFixed(2)}</Metric>). Players,
          coaches and systems all turn over.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          Cal shows it clearly. From {stress.early.years[0]} to {stress.early.years[1]} it ranked{' '}
          <Metric>{ordinal(stress.early.rank)}</Metric> of {stress.early.schools} schools. From{' '}
          {stress.late.years[0]} on it ranked <Metric>{ordinal(stress.late.rank)}</Metric>. Most of the 40-year
          result comes from one sustained stretch, and that stretch lines up with one head coach: {m.eraCoach}, who ran the
          program from the {eraFirst - 1} season through {eraLast - 1}. The players he coached were drafted from{' '}
          {eraFirst} to {eraLast}.
        </p>
        <h3 className="text-sm text-[var(--text-primary)] mb-2">
          Cal&apos;s NFL picks: career value above or below draft slot, per pick
        </h3>
        <TrendChart
          data={data.timeline}
          dataKey="mean"
          unit="AV per pick vs. slot"
          band={[eraFirst, eraLast]}
          bandLabel={`${m.eraCoach.split(' ').slice(-1)[0]} era`}
          zeroLine
          tooltip="score"
        />
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Each point averages the five draft classes around that year. The dashed line is a school whose picks do
          exactly as expected. The mid-1980s spike rests on about ten picks, led by Hardy Nickerson, a fifth-round
          pick in 1987. It didn&apos;t last, and Cal ranks mid-pack for those two decades overall.
        </p>
      </section>

      {/* FINDING 3: the era ranking */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Finding 3" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          {eraFirst} to {eraLast}: the best in the country
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          Rank every school on just those {eraLast - eraFirst + 1} draft classes and Cal is{' '}
          <Metric>#{era.rank} of {m.eraSchools}</Metric> schools with at least {m.minEra} picks. Its {era.picks}{' '}
          picks beat their draft slot by <Metric>+{era.mean}</Metric> career Approximate Value each, about one
          extra season as a solid starter per player. This time the line does not cross zero.
        </p>
        <RankingList
          view={{
            rows: data.eraBoard,
            total: m.eraSchools,
            decimals: 1,
            unit: `Score: career Approximate Value above or below the draft-slot bar, per pick, ${eraFirst} to ${eraLast} draft classes only.`,
          }}
        />
        <p className="text-[var(--text-secondary)] leading-relaxed mt-10 mb-8 max-w-2xl">
          It isn&apos;t just Aaron Rodgers. He produced <Metric>{rodgers.value}</Metric> career AV against{' '}
          <Metric>{rodgers.expected}</Metric> for a typical #{rodgers.pick} pick, the biggest gap of anyone. But
          remove every school&apos;s best player and Cal still ranks <Metric>{ordinal(era.withoutBestRank)}</Metric>,
          at +{era.withoutBestMean} per pick. Much of the list comes from the middle rounds, where teams pay the
          least for talent.
        </p>
        <h3 className="text-sm text-[var(--text-primary)] mb-4">
          Cal&apos;s biggest outperformers, {eraFirst} to {eraLast} (career AV)
        </h3>
        <OutperformersChart players={data.eraPlayers} unit="AV" />
        <DataTable
          columns={['Player', 'Year', 'Pick', 'Actual', 'Expected', 'Difference']}
          rows={data.eraPlayers.map((p) => [p.player, p.year, p.pick, p.value, p.expected, p.surplus])}
        />
      </section>

      {/* STRESS TESTS */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Stress Tests" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          I tried to break it
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          A ranking like this can be an accident of small samples, one superstar, or a lucky draw. Each of those
          can be tested, so I tested them.
        </p>
        <ChecksTable
          rows={[
            [
              'Raise the minimum number of picks',
              'Small schools with a few stars',
              `${th.map((t) => ordinal(t.rank)).join(', ')} at ${th.map((t) => t.min).join(', ')}+ picks`,
            ],
            [
              'Pull every school toward average, more so with fewer picks',
              'Rankings driven by noise',
              `Still ${ordinal(stress.shrunkRank)}`,
            ],
            ['Cap the biggest scores at the 99th percentile', 'One superstar carrying a school', ordinal(stress.cappedRank)],
            ['Adjust each score for position', 'A stat that favors some positions', `Still ${ordinal(stress.positionRank)}`],
            [
              'Remove every quarterback',
              'Rodgers, and quarterbacks in general',
              `${ordinal(stress.noQbRank)} of ${stress.noQbSchools}`,
            ],
            [
              `Remove each school's best player (${eraFirst} to ${eraLast})`,
              'One player carrying the era',
              `Still ${ordinal(era.withoutBestRank)}`,
            ],
            [
              `Shuffle players between schools at random (${eraFirst} to ${eraLast})`,
              'Pure luck',
              `Some school gets this far ${pct(era.luckAnySchool)} of the time`,
            ],
          ]}
        />
        <p className="text-xs text-[var(--text-muted)] mt-4">
          The first five rows test the 40-year football ranking, where Cal starts {ordinal(cal.nflRank)} of{' '}
          {m.nflSchools}. The last two test the {eraFirst} to {eraLast} ranking.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed mt-8 max-w-2xl">
          The luck test is the one that matters most. Over 40 years, chance alone puts some school as far ahead
          as Cal {pct(stress.luckAllTime.anySchool)} of the time. For the {eraFirst} to {eraLast} classes that
          drops to {pct(era.luckAnySchool)}. And across every {eraLast - eraFirst + 1}-year stretch at every school
          since {m.classes[0]}, {era.windowsCompared.toLocaleString()} in all, only{' '}
          {era.schoolsWithAsGoodAStretch.length} other schools ever had one as good.
        </p>
      </section>

      {/* NIL AND THE TRANSFER PORTAL */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="What Changed" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Why it would be harder today
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4 max-w-2xl">
          That run depended on players staying in one program long enough to be developed there. Two rule
          changes in {NIL_YEAR} weakened that. Players can now be paid for their name, image and likeness (NIL),
          and they can transfer without sitting out a season. A program that develops a player can now lose him
          to a bigger budget before he is ever drafted.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          The draft already shows talent pooling in fewer places. From {preNil[0].year} to {NIL_YEAR - 1}, about{' '}
          <Metric>{preNilSchools}</Metric> schools had a player drafted each year. In {latest.year} it was{' '}
          <Metric>{latest.schools}</Metric>. The 25 schools with the most picks used to supply{' '}
          <Metric>{pct(preNilTop25)}</Metric> of the draft. In {latest.year} they supplied{' '}
          <Metric>{pct(latest.top25Share)}</Metric>.
        </p>
        <h3 className="text-sm text-[var(--text-primary)] mb-2">Schools with at least one NFL draft pick, by year</h3>
        <TrendChart
          data={data.concentration}
          dataKey="schools"
          unit="Schools"
          band={[NIL_YEAR, latest.year]}
          bandLabel="NIL era"
          tooltip="schools"
        />
        <p className="text-[var(--text-secondary)] leading-relaxed mt-8 mb-4 max-w-2xl">
          Cal has its own example. Fernando Mendoza spent three seasons at Cal, transferred to Indiana, won the
          Heisman Trophy and went first overall in the {latest.year} draft. In this dataset, and in every draft
          record, he is an Indiana player. Draft data credits the last school a player attended, so the kind of
          development this study measures is now partly invisible, and partly someone else&apos;s.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          What I can&apos;t do yet is measure the NIL era the way I measured {eraFirst} to {eraLast}. Players drafted since{' '}
          {NIL_YEAR} are only a few seasons into their careers, and the drop in the chart could also reflect the
          extra year of eligibility granted during the pandemic. The fair test comes around 2030: track players
          by the school that first signed them, not the last one they played for, and see whether development
          still shows up anywhere.
        </p>
      </section>

      {/* BASKETBALL */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Basketball" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Same direction, too few players to rank
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          Jason Kidd added <Metric>{kidd.surplus}</Metric> Win Shares beyond a typical #{kidd.pick} pick
          {brown && (
            <>
              , and Jaylen Brown is already <Metric>+{brown.surplus}</Metric> past a typical #{brown.pick} pick from
              his draft era
            </>
          )}
          . But Cal has only {cal.nbaPicks} picks in the first two rounds since {m.classes[0]}, far too few to
          split into coaching eras. Basketball supports the 40-year story and can&apos;t say more than that.
        </p>
        <h3 className="text-sm text-[var(--text-primary)] mb-4">Cal&apos;s NBA outperformers (career Win Shares)</h3>
        <OutperformersChart players={data.calNba.filter((p) => p.surplus > 0)} unit="Win Shares" />
      </section>

      {/* LIMITS */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Limits" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          What this can&apos;t claim
        </h2>
        <ul className="space-y-4 text-[var(--text-secondary)] leading-relaxed max-w-2xl list-disc pl-5">
          <li>
            <strong className="text-[var(--text-primary)] font-medium">I looked before I chose the era.</strong>{' '}
            The {eraFirst} to {eraLast} window follows one coach&apos;s tenure, not the best-looking years. But I
            only thought to test it after seeing the before-and-after split, so treat it as a strong lead, not a
            pre-registered experiment.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">It doesn&apos;t prove the coach caused it.</strong>{' '}
            Recruiting, the offensive system, assistants and the conference at the time are all tangled together.
            The data says something worked in that building for a decade. It can&apos;t say which part.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">A {pct(era.luckAnySchool)} chance of luck is not zero.</strong>{' '}
            It is far better than {pct(stress.luckAllTime.anySchool)}, and the result holds up under every test
            above, but one school out of {m.eraSchools} will always lead.
          </li>
        </ul>
      </section>

      {/* SO WHAT */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="So What" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          What a front office could do with this
        </h2>
        <ol className="space-y-4 text-[var(--text-secondary)] leading-relaxed max-w-2xl list-decimal pl-5">
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Scout the staff, not the logo.</strong>{' '}
            A school&apos;s name carries no lasting signal from one decade to the next. A coaching staff on a
            multi-year run might. The edge is worth a tiebreaker between similar prospects in the middle rounds,
            and it expires when the staff leaves.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Track where players were developed.</strong>{' '}
            With transfers, the last school on a prospect&apos;s record is often not the one that built him. Any
            school-level signal now needs the full path, not the final stop.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Reuse the method.</strong>{' '}
            &ldquo;Actual versus expected given the price paid&rdquo;, followed by an honest attempt to break the
            result, works anywhere value is bought at a known price: sales hires, marketing channels, vendor
            contracts.
          </li>
        </ol>
      </section>

      {/* CAVEATS + TOOLS */}
      <section className="mb-10 animate-reveal">
        <SectionHeader label="Caveats" />
        <ul className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl list-disc pl-5">
          <li>
            Expected value comes from isotonic regression: the best-fitting curve that only goes down as the pick
            number goes up, with no other shape assumed. Each draft class is compared only with classes within{' '}
            {m.eraWindow} years, so players still mid-career (like Jaylen Brown) aren&apos;t judged against finished careers.
          </li>
          <li>
            Draft classes {m.classes[0]} to {m.classes[1]}: {m.nflPicks.toLocaleString()} NFL picks and{' '}
            {m.nbaPicks.toLocaleString()} NBA picks (first 60 each year, the size of the modern draft). Players who
            never played count as zero.
          </li>
          <li>
            Approximate Value and Win Shares are single-number summaries and undervalue some roles (offensive
            linemen, defensive specialists). Players are credited to the last college they attended.
          </li>
          <li>
            The luck tests shuffle which school each pick belongs to 5,000 times, keeping every school&apos;s number
            of picks, and count how often a school scores as high as Cal really did.
          </li>
          <li>
            The talent concentration chart counts schools by the college listed on each draft pick,{' '}
            {preNil[0].year} (the first seven-round draft) to {latest.year}.
          </li>
          <li>
            NFL data from the open nflverse project; NBA data from Basketball Reference draft pages.
          </li>
        </ul>

        <div className="border-t border-[var(--border-subtle)] mt-10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="section-label">Tools Used</span>
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="font-[family-name:var(--font-dm-mono)] text-xs px-3 py-1 rounded border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]"
              >
                {tool}
              </span>
            ))}
          </div>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300"
          >
            <Github size={14} aria-hidden="true" />
            View the code
          </a>
        </div>
      </section>
    </div>
  )
}
