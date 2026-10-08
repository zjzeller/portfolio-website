import { pageMetadata } from '@/lib/metadata'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import { SeasonArc, TalentPath, TalentGap, type Season } from '@/components/charts/CalDecadeCharts'
import { DataTable } from '@/components/charts/RetentionCharts'
import data from '@/data/cal-decade.json'

export const metadata = pageMetadata(
  'Cal Football, 2000 to Now',
  'How a program rose, peaked and drifted: a guided look at Cal football through results, recruiting, the draft, attendance and the transfer portal.'
)

const seasons = data.seasons as Season[]
const fit = data.metadata.fit

// Figures quoted in the copy, computed from the data so the text can't drift from the charts
const rated = seasons.filter((s) => s.strength != null && s.expected != null)
const gap = (s: Season) => (s.strength as number) - (s.expected as number)
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const peakYears = rated.filter((s) => s.year >= 2005 && s.year <= 2008)
const peakGap = mean(peakYears.map(gap))
const recent = rated.filter((s) => s.year >= 2014)
const recentClose = recent.filter((s) => Math.abs(gap(s)) <= 10).length
const firstTalent = rated[0]
const lastTalent = rated[rated.length - 1]
const by = (year: number) => seasons.find((s) => s.year === year) as Season
const lastTop20 = Math.max(...seasons.filter((s) => s.strengthRank != null && s.strengthRank <= 20).map((s) => s.year))
const ord = (n: number) => `${Math.round(n)}th`

function Chapter({ n, label, title, children }: { n: number; label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-24 animate-reveal">
      <div className="flex items-center gap-4 mb-8">
        <span className="section-label">
          Chapter {n} &middot; {label}
        </span>
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

const P = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-[var(--text-secondary)] leading-relaxed max-w-2xl ${className}`}>{children}</p>
)

export default function CalFootballPage() {
  const y04 = by(2004)
  const y13 = by(2013)
  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-4xl">
      <PageViewTracker pagePath="/projects/cal-football" pageTitle="Cal Football, 2000 to Now" />

      {/* HERO */}
      <section className="mb-20 animate-reveal">
        <span className="section-label">Sports Analytics &middot; Data Storytelling</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl mt-4 tracking-tight">
          Cal Football, 2000 to Now
          <br />
          <span className="text-[var(--accent)]">Rise, Peak and Drift</span>
        </h1>
        <div className="editorial-rule w-16 mt-6" />
        <p className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl leading-snug mt-10 max-w-3xl">
          For a few seasons in the mid-2000s, Cal was one of the best teams in college football. This is how it got
          there, why it slipped, and what has changed underneath the program since.
        </p>
        <P className="mt-6">
          Six chapters, one question each, built from 27 seasons of game results, recruiting rankings, draft outcomes,
          attendance and transfer records.
        </P>
      </section>

      {/* CHAPTER 1 */}
      <Chapter n={1} label="The Arc" title="Two seasons in the top ten, then a long slide">
        <P className="mb-4">
          Jeff Tedford inherited a 1-10 team in 2002. Two years later Cal went {y04.wins}-{y04.losses} and ranked{' '}
          {y04.strengthRank === 2 ? '2nd' : ord(y04.strengthRank as number)} of {y04.fbsTeams} FBS teams in
          schedule-adjusted margin, ahead of all but one program in the country.
        </P>
        <P className="mb-10">
          The peak lasted about five seasons. Cal has not finished in the top 20 since {lastTop20}, and the low point
          came in the handoff between coaches: Tedford&apos;s last team went 3-9, and Sonny Dykes&apos; first went{' '}
          {y13.wins}-{y13.losses}, {ord(y13.strengthRank as number)} of {y13.fbsTeams}.
        </P>
        <SeasonArc seasons={seasons} eras={data.eras} />
        <DataTable
          columns={['Season', 'Coach', 'Record', 'Strength rank', 'Percentile', 'Final AP']}
          rows={seasons.map((s) => [
            s.year,
            s.coach,
            `${s.wins}-${s.losses}`,
            s.strengthRank ? `${s.strengthRank} of ${s.fbsTeams}` : '',
            s.strength ?? '',
            s.apFinal ? `#${s.apFinal}` : '',
          ])}
        />
      </Chapter>

      {/* CHAPTER 2 */}
      <Chapter n={2} label="Talent In, Results Out" title="Cal got more from its talent, then the talent drained away">
        <P className="mb-4">
          Results mostly follow talent. Across {fit.teamSeasons.toLocaleString()} FBS team-seasons, the strength of a
          roster&apos;s last four recruiting classes and the team&apos;s results line up closely (a correlation of{' '}
          {fit.r.toFixed(2)}). That gives every season a fair benchmark: how good should this team have been, given
          who was on it?
        </P>
        <P className="mb-10">
          From 2005 to 2008, Cal beat that benchmark by {peakGap.toFixed(1)} percentile points a season. Then two
          things went wrong at once. Results fell well below the line in 2012 and 2013, and the line itself moved:
          Cal&apos;s roster talent slid from the {ord(firstTalent.talent as number)} percentile in{' '}
          {firstTalent.year} to the {ord(lastTalent.talent as number)} in {lastTalent.year}.
        </P>
        <TalentPath seasons={seasons} fit={fit} />
        <P className="mt-12 mb-8">
          Since 2014, Cal has mostly played to its talent, landing within 10 points of the prediction in{' '}
          {recentClose} of {recent.length} seasons. The bigger problem is how much talent there is to work with.
        </P>
        <h3 className="text-sm text-[var(--text-primary)] mb-3">Above or below what roster talent predicts, by season</h3>
        <TalentGap seasons={seasons} />
        <DataTable
          columns={['Season', 'Coach', 'Recruiting class rank', 'Roster talent pct', 'Strength pct', 'Predicted', 'Difference']}
          rows={seasons
            .filter((s) => s.classRank != null)
            .map((s) => [
              s.year,
              s.coach,
              `${s.classRank} of ${s.classTeams}`,
              s.talent ?? '',
              s.strength ?? '',
              s.expected ?? '',
              s.strength != null && s.expected != null ? (s.strength - s.expected).toFixed(1) : '',
            ])}
        />
      </Chapter>

      {/* WHAT COMES NEXT (draft preview only) */}
      <section className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <span className="section-label">Still to come</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
        <ul className="space-y-2 text-sm text-[var(--text-muted)] max-w-2xl">
          <li>Chapter 3 &middot; The Payoff: players who beat their draft slot</li>
          <li>Chapter 4 &middot; The Crowd: who showed up, and when</li>
          <li>Chapter 5 &middot; The New Rules: the transfer portal</li>
          <li>Chapter 6 &middot; Where Cal Stands: the ACC and the Power 4</li>
        </ul>
        <p className="text-xs text-[var(--text-muted)] mt-8">Data: {data.metadata.source}.</p>
      </section>
    </div>
  )
}
