import Link from 'next/link'
import { pageMetadata } from '@/lib/metadata'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import {
  SeasonArc,
  TalentRankChart,
  ExpectedVsActual,
  AttendanceChart,
  PortalChart,
  PeerStrip,
  type SeasonRanks,
  type AttendanceRow,
  type Peer,
} from '@/components/charts/CalDecadeCharts'
import { RankingList, OutperformersChart } from '@/components/charts/CalPipelineCharts'
import { DataTable } from '@/components/charts/RetentionCharts'
import data from '@/data/cal-decade.json'
import draft from '@/data/cal-pipeline.json'

export const metadata = pageMetadata(
  'Cal Football, 2000 to Now',
  'How a program rose, peaked and drifted: a guided look at Cal football through results, recruiting, the draft, attendance and the transfer portal.'
)

const seasons = data.seasons as SeasonRanks[]
const attendance = data.attendance as AttendanceRow[]
const peers = data.peers as Peer[]
const fit = data.metadata.fit

// ---- Figures quoted in the copy, computed from the data so the text can't drift from the charts ----
const by = (year: number) => seasons.find((s) => s.year === year) as SeasonRanks
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const ord = (n: number) => {
  const t = n % 100
  return `${n}${t >= 11 && t <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}
const judged = seasons.filter((s) => s.strengthRank != null && s.expectedRank != null && s.complete)
const spotsBetter = (s: SeasonRanks) => (s.expectedRank as number) - (s.strengthRank as number)
const peakSpots = Math.round(mean(judged.filter((s) => s.year >= 2005 && s.year <= 2008).map(spotsBetter)))
const since09 = judged.filter((s) => s.year >= 2009)
const beatSince09 = since09.filter((s) => spotsBetter(s) > 0).length
const lastTop20 = Math.max(...seasons.filter((s) => s.strengthRank != null && s.strengthRank <= 20).map((s) => s.year))
const lastTop20Roster = Math.max(...seasons.filter((s) => s.talentRank != null && s.talentRank <= 20).map((s) => s.year))
const talentRows = seasons.filter((s) => s.talentRank != null)
const att = (year: number) => attendance.find((a) => a.year === year) as AttendanceRow
const peakCrowd = Math.round(mean(attendance.filter((a) => a.year >= 2004 && a.year <= 2008).map((a) => a.average as number)))
const portal = data.portal
const portalFirst = portal[0]
const portalLast = portal[portal.length - 1]
const outTotal = portal.reduce((a, p) => a + p.out, 0)
const outPower4 = portal.reduce((a, p) => a + ((p.outGroups as Record<string, number>)['Power 4'] ?? 0), 0)
const calPeer = peers.find((p) => p.team === 'California') as Peer
const acc = peers.filter((p) => p.conference === 'ACC')
const calInAcc = acc.findIndex((p) => p.team === 'California') + 1
const era = draft.calEra
const k = (n: number) => n.toLocaleString()

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
const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm text-[var(--text-primary)] mt-12 mb-3">{children}</h3>
)

export default function CalFootballPage() {
  const y04 = by(2004)
  const y06 = by(2006)
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
          Six chapters, one question each, built from 27 seasons of game results, recruiting rankings, NFL draft
          outcomes, attendance and transfer records.
        </P>
      </section>

      {/* CHAPTER 1 */}
      <Chapter n={1} label="The Arc" title="Two seasons in the top ten, then a long slide">
        <P className="mb-4">
          Jeff Tedford inherited a 1-10 team in 2002. Two years later Cal went {y04.wins}-{y04.losses} and ranked{' '}
          {ord(y04.strengthRank as number)} of {y04.fbsTeams} FBS teams in schedule-adjusted margin, ahead of every
          program in the country but one.
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
      <Chapter n={2} label="Talent In, Results Out" title="Cal got more out of its talent, then lost both">
        <P className="mb-4">
          Talent is the best single predictor of results in college football. Across {k(fit.teamSeasons)} FBS
          team-seasons, rosters built from stronger recruiting classes reliably finish higher. That splits every
          season into two questions: how much talent did Cal have, and what did it do with it?
        </P>

        <H3>How much talent Cal had</H3>
        <P className="mb-6">
          In {talentRows[0].year} Cal&apos;s roster ranked {ord(talentRows[0].talentRank as number)} in the country.
          It hasn&apos;t had a top-20 roster since {lastTop20Roster}, and this season ({talentRows[talentRows.length - 1].year})
          it ranks {ord(talentRows[talentRows.length - 1].talentRank as number)}.
        </P>
        <TalentRankChart seasons={seasons} eras={data.eras} />

        <H3>What Cal did with it</H3>
        <P className="mb-6">
          The next chart compares where Cal finished with where a roster like Cal&apos;s usually finishes. From 2005
          to 2008, Cal beat its prediction by {peakSpots} spots a season on average. In {y06.year}, a roster expected
          to finish {ord(y06.expectedRank as number)} finished {ord(y06.strengthRank as number)}. Since 2009, Cal has
          finished ahead of its prediction in only {beatSince09} of {since09.length} seasons.
        </P>
        <ExpectedVsActual seasons={seasons} eras={data.eras} />
        <P className="mt-8">
          So the decline has two causes, and they compound: less talent coming in, and less coming out of the
          talent Cal had.
        </P>
        <DataTable
          columns={['Season', 'Coach', 'Recruiting class', 'Roster talent rank', 'Expected finish', 'Actual finish']}
          rows={seasons
            .filter((s) => s.talentRank != null)
            .map((s) => [
              s.year,
              s.coach,
              s.classRank ? `${s.classRank} of ${s.classTeams}` : '',
              `${s.talentRank} of ${s.talentTeams}`,
              s.expectedRank != null && s.complete ? s.expectedRank : '',
              s.strengthRank ?? '',
            ])}
        />
      </Chapter>

      {/* CHAPTER 3 */}
      <Chapter n={3} label="The Payoff" title="The peak produced pros who outplayed their draft slot">
        <P className="mb-4">
          One part of the peak can be measured long after the games: what Cal&apos;s players did in the NFL. For
          every draft pick since 1980, I modeled the career a player taken at that slot typically has, then measured
          how far each school&apos;s players beat it.
        </P>
        <P className="mb-10">
          For the {draft.metadata.era[0]} to {draft.metadata.era[1]} draft classes, the players Tedford recruited and
          coached, Cal ranks first of {draft.metadata.eraSchools} schools. Its {era.picks} picks beat their draft slot
          by about one extra season as a solid NFL starter each, and the edge came from early-round picks, not
          late-round luck.
        </P>
        <RankingList
          view={{
            rows: draft.eraBoard,
            total: draft.metadata.eraSchools,
            decimals: 1,
            unit: `Score: career Approximate Value above or below what a typical pick at the same slot produces, per pick, ${draft.metadata.era[0]} to ${draft.metadata.era[1]} draft classes.`,
          }}
        />
        <H3>Cal&apos;s biggest outperformers (career value vs. a typical pick at the same slot)</H3>
        <OutperformersChart players={draft.eraPlayers} unit="AV" others={draft.eraOthers} />
        <p className="text-xs text-[var(--text-muted)] mt-6 max-w-2xl">
          The result holds up to eight stress tests, including removing every school&apos;s best player and
          adjusting for program size.{' '}
          <Link href="/projects/cal-pro-pipeline" className="text-[var(--accent)] hover:underline">
            Read the full draft analysis
          </Link>
          .
        </p>
      </Chapter>

      {/* CHAPTER 4 */}
      <Chapter n={4} label="The Crowd" title="The crowd came for the peak and never came back">
        <P className="mb-4">
          From 2004 to 2008, Cal averaged {k(peakCrowd)} fans a game. The crowd followed the team down after that,
          but it didn&apos;t follow it back up: the 8-5 teams of 2015 and 2019 drew {k(att(2015).average as number)}{' '}
          and {k(att(2019).average as number)}, and the 7-6 team of 2025 drew {k(att(2025).average as number)}, about{' '}
          {Math.round(((att(2025).average as number) / data.stadiumCapacity) * 100)}% of the renovated
          stadium&apos;s capacity.
        </P>
        <P className="mb-10">
          The exception came on October 5, 2024, when ESPN&apos;s College GameDay came to Berkeley and{' '}
          {k(52428)} people watched Cal lose 39-38 to Miami. The demand is there for a big moment. It hasn&apos;t
          been there week to week.
        </P>
        <AttendanceChart rows={attendance} capacity={data.stadiumCapacity} />
        <DataTable
          columns={['Season', 'Average home attendance', 'Home games', 'Venue']}
          rows={attendance.filter((a) => a.average != null).map((a) => [a.year, k(a.average as number), a.games, a.venue ?? ''])}
        />
      </Chapter>

      {/* CHAPTER 5 */}
      <Chapter n={5} label="The New Rules" title="The transfer portal made the roster a two-way door">
        <P className="mb-4">
          Since 2021, players can transfer without sitting out a season, and since NIL rules changed the same year,
          they can be paid. In {portalFirst.year}, {portalFirst.out} players left Cal through the portal and{' '}
          {portalFirst.in} arrived. In {portalLast.year}, {portalLast.out} left and {portalLast.in} arrived.
        </P>
        <P className="mb-10">
          The players Cal develops now have options. Of the {outTotal} who left since 2021, {outPower4} went to other
          Power 4 programs, including the highest-rated departures below. The most famous is Fernando Mendoza, who
          left for Indiana in December 2024, won the Heisman Trophy and went first overall in the 2026 NFL draft.
        </P>
        <PortalChart rows={portal} />
        <H3>Highest-rated players to leave Cal through the portal</H3>
        <div className="overflow-x-auto max-w-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wider uppercase text-[var(--text-muted)]">
                <th className="font-normal pb-3 pr-4">Player</th>
                <th className="font-normal pb-3 pr-4">Pos.</th>
                <th className="font-normal pb-3 pr-4">Season</th>
                <th className="font-normal pb-3">Went to</th>
              </tr>
            </thead>
            <tbody>
              {data.topDepartures.slice(0, 6).map((d) => (
                <tr key={d.player} className="border-t border-[var(--border-subtle)]">
                  <td className="py-2.5 pr-4 text-[var(--text-primary)]">{d.player}</td>
                  <td className="py-2.5 pr-4 text-[var(--text-secondary)] font-[family-name:var(--font-dm-mono)] text-xs">{d.position}</td>
                  <td className="py-2.5 pr-4 text-[var(--text-secondary)] font-[family-name:var(--font-dm-mono)] text-xs">{d.year}</td>
                  <td className="py-2.5 text-[var(--text-secondary)]">{d.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-[var(--text-muted)] mt-3">All six were four-star recruits out of high school.</p>
        </div>
      </Chapter>

      {/* CHAPTER 6 */}
      <Chapter n={6} label="Where Cal Stands" title="The talent is back to mid-pack. The results aren't.">
        <P className="mb-4">
          The portal cuts both ways, and Cal has used it to rebuild. Counting transfers, its 2026 roster ranks{' '}
          {ord(calInAcc)} of {acc.length} in the ACC and {ord(calPeer.rank)} of {peers.length} Power 4 teams, close
          to the middle of both.
        </P>
        <P className="mb-10">
          The results haven&apos;t followed. In its first two ACC seasons, Cal finished{' '}
          {ord(data.accRecent[0].calRankInAcc as number)} and {ord(data.accRecent[1].calRankInAcc as number)} of{' '}
          {data.accRecent[0].accTeams} conference teams in schedule-adjusted margin.
        </P>
        <PeerStrip peers={peers} />
      </Chapter>

      {/* CLOSE */}
      <section className="mb-16 animate-reveal">
        <div className="flex items-center gap-4 mb-8">
          <span className="section-label">What It Would Take</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
        <ol className="space-y-5 text-[var(--text-secondary)] leading-relaxed max-w-2xl list-decimal pl-5">
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Talent sets the ceiling.</strong> Cal&apos;s
            best seasons came with top-20 rosters. It hasn&apos;t had one since {lastTop20Roster}.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Development decides how close you get.</strong>{' '}
            The peak teams beat their talent by {peakSpots} spots a year, and their players kept outperforming in the
            NFL. Since 2009, Cal has beaten its prediction in {beatSince09} of {since09.length} seasons.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">The portal is now the fastest lever.</strong> A
            roster can be rebuilt in a single offseason, in either direction. Cal&apos;s is already mid-pack in its
            conference, so the next gain has to come from results.
          </li>
        </ol>
        <p className="text-xs text-[var(--text-muted)] mt-12 max-w-2xl">
          Data: {data.metadata.source}, with attendance gaps filled from published box scores, and NFL draft data from
          nflverse. Team strength is the Simple Rating System (scoring margin adjusted for schedule). Roster talent
          averages the 247Sports recruiting rankings of the four classes on the roster; chapter 6 uses the 247Sports
          talent composite, which also counts transfers.
        </p>
      </section>
    </div>
  )
}
