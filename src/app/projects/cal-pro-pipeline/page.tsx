import { pageMetadata } from '@/lib/metadata'
import { Github } from 'lucide-react'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import { DraftCurveChart, SchoolLeaderboard, OutperformersChart } from '@/components/charts/CalPipelineCharts'
import { DataTable } from '@/components/charts/RetentionCharts'
import { requireProject } from '@/data/projects'
import data from '@/data/cal-pipeline.json'

export const metadata = pageMetadata(
  "Cal's Pro Pipeline",
  'Do Cal players outperform their draft slot? A model of expected career value by pick for every NFL and NBA pick since 1980, with Cal ranked against every major program.',
  '/projects/cal-pro-pipeline/opengraph-image.png'
)

const project = requireProject('/projects/cal-pro-pipeline')
const m = data.metadata
const cal = data.cal

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className="section-label">{label}</span>
      <div className="flex-1 h-px bg-[var(--border-subtle)]" />
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
          Aaron Rodgers went 24th. Keenan Allen went in the third round. Jason Kidd went 2nd and still beat
          expectations. Is that a pattern or a few famous exceptions? I modeled how much career value every
          NFL and NBA draft pick since {m.classes[0]} <em>should</em> produce based on where he was taken, then
          measured which colleges&apos; players beat that expectation most often.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 border-t border-[var(--border-subtle)] pt-8">
          {[
            { label: `Of ${m.twoSportSchools} two-sport schools`, value: `#${cal.twoSportRank}` },
            { label: `Cal picks, ${m.classes[0]} to ${m.classes[1]}`, value: `${cal.nflPicks + cal.nbaPicks}` },
            { label: `NFL picks who beat their slot (${pct(cal.allBeatShare)} overall)`, value: pct(cal.nflBeatShare) },
            { label: 'Rodgers vs. a typical #24', value: `+${Math.round(rodgers.surplus)}` },
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
          a quarterback and a guard taken 24th face the same bar. The weak spot is the scoring stat itself:
          Approximate Value tends to credit some positions more than others, so a school that produces a lot of
          quarterbacks gets a small boost. I don&apos;t correct for that here.
        </p>
      </section>

      {/* FINDING 1 */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Finding 1" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Cal ranks #{cal.twoSportRank} of {m.twoSportSchools}, ahead of UCLA, USC and Alabama
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          Putting both sports on one scale, Cal players beat their draft slot by more than players from all but
          three schools that send at least {m.minNfl} players to the NFL and {m.minNba} to the NBA. That&apos;s ahead
          of UCLA, Kentucky, Stanford, USC, North Carolina and Alabama. Football alone tells the same story: #
          {cal.nflRank} of {m.nflSchools} schools with {m.minNflOnly}+ picks, and {pct(cal.nflBeatShare)} of Cal&apos;s
          NFL picks beat their slot versus {pct(cal.allBeatShare)} of all picks. Basketball alone puts Cal #
          {cal.nbaRank} of {m.nbaSchools} schools with {m.minNbaOnly}+ picks, on a much smaller sample.
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
      </section>

      {/* FINDING 2 */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Finding 2" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          It isn&apos;t just Aaron Rodgers
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          Rodgers produced <Metric>{rodgers.value}</Metric> career AV against <Metric>{rodgers.expected}</Metric> for
          a typical #24 pick, the single biggest gap. But a result driven by one player isn&apos;t a pattern, so I
          reran the football ranking without each school&apos;s best player: Cal still ranks 5th of 61. The list runs
          deep, and much of it comes from the middle rounds, where teams pay the least for talent.
        </p>
        <h3 className="text-sm text-[var(--text-primary)] mb-4">Cal&apos;s biggest NFL outperformers (career AV)</h3>
        <OutperformersChart players={data.calNfl} unit="AV" />
        <h3 className="text-sm text-[var(--text-primary)] mt-12 mb-4">Cal&apos;s NBA outperformers (career Win Shares)</h3>
        <OutperformersChart players={data.calNba.filter((p) => p.surplus > 0)} unit="Win Shares" />
        <p className="text-[var(--text-secondary)] leading-relaxed mt-8 max-w-2xl">
          In basketball, Jason Kidd added <Metric>{kidd.surplus}</Metric> Win Shares beyond a typical #2 pick
          {brown && (
            <>
              , and Jaylen Brown is already <Metric>+{brown.surplus}</Metric> past a typical #3 pick from his draft era
            </>
          )}
          . With only {cal.nbaPicks} Cal picks in the first two rounds since 1980, basketball supports the story, but
          the sample is too small to rank Cal with confidence on basketball alone.
        </p>
        <DataTable
          columns={['Player', 'Sport', 'Year', 'Pick', 'Actual', 'Expected', 'Difference']}
          rows={[
            ...data.calNfl.map((p) => [p.player, 'NFL (AV)', p.year, p.pick, p.value, p.expected, p.surplus]),
            ...data.calNba.map((p) => [p.player, 'NBA (WS)', p.year, p.pick, p.value, p.expected, p.surplus]),
          ]}
        />
      </section>

      {/* FINDING 3 */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Finding 3" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Strong evidence, not proof
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          Cal&apos;s 95% interval in the combined ranking runs from <Metric>{cal.twoSportLo.toFixed(2)}</Metric> to{' '}
          <Metric>{cal.twoSportHi.toFixed(2)}</Metric>. It just touches zero, which means I can&apos;t fully rule out
          that Cal is average and got lucky. With {m.twoSportSchools} schools in the race, a few will land near the
          top by chance. What makes it more than luck: in football, Cal ranks 4th on the average, 5th on the share of
          players who beat their slot, and 5th with its best player removed. Those are different ways of measuring the same
          question, and they agree.
        </p>
      </section>

      {/* SO WHAT */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="So What" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          What a front office could do with this
        </h2>
        <ol className="space-y-4 text-[var(--text-secondary)] leading-relaxed max-w-2xl list-decimal pl-5">
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Treat school as a tiebreaker, not a signal.</strong>{' '}
            The effect is real enough to break a tie between two similar prospects in the middle rounds, not big
            enough to move a player up a draft board.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Look for the mechanism before paying for it.</strong>{' '}
            Coaching, conference competition and pro-style systems are all candidates. A school effect only helps
            if it survives a change in coaching staff, which is the next thing I&apos;d test.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Reuse the method.</strong>{' '}
            &ldquo;Actual versus expected given the price paid&rdquo; works anywhere value is bought at a known price:
            sales hires, marketing channels, vendor contracts.
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
