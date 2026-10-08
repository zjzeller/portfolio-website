'use client'

// Charts for "Cal Football, 2000 to Now". Every chart reads from src/data/cal-decade.json
// (built by scripts/cal-decade.py).

import {
  ComposedChart,
  ScatterChart,
  BarChart,
  Line,
  Area,
  Scatter,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import type { LabelProps } from 'recharts'
import { CHART, ERA_COLORS } from '@/lib/chartTheme'

export type Season = {
  year: number
  coach: string
  wins: number
  losses: number
  complete: boolean
  apFinal: number | null
  srs: number | null
  strengthRank: number | null
  strength: number | null
  fbsTeams: number | null
  classRank: number | null
  classTeams: number | null
  talent: number | null
  expected: number | null
}
export type Era = { coach: string; from: number; to: number }
export type SeasonRanks = Season & { talentRank: number | null; talentTeams: number | null; expectedRank: number | null }
export type AttendanceRow = { year: number; average: number | null; games: number; venue: string | null; winning?: boolean }
export type PortalRow = { year: number; out: number; in: number }
export type Peer = { team: string; conference: string; talent: number; rank: number }

// Two-way encodings used below. Validated as a pair on the dark surface:
// node validate_palette.js "#3987e5,#d95926" --mode dark --surface "#0f1419"
const GOOD = '#3987e5' // beat expectations / arrivals / winning season
const BAD = '#d95926' // fell short / departures

const tick = { fontSize: 11, fill: CHART.muted }
const lastName = (coach: string) => coach.split(' ').slice(-1)[0]

function Box({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2 text-xs max-w-[16rem]">
      <p className="text-[var(--text-primary)] mb-1">{title}</p>
      {lines.map((l) => (
        <p key={l} className="font-[family-name:var(--font-dm-mono)] text-[var(--text-secondary)]">
          {l}
        </p>
      ))}
    </div>
  )
}

function seasonLines(s: Season): string[] {
  const lines = [`${s.wins}-${s.losses}${s.complete ? '' : ' so far'}`]
  if (s.strengthRank) lines.push(`${s.strengthRank} of ${s.fbsTeams} in team strength`)
  if (s.apFinal) lines.push(`Final AP rank: #${s.apFinal}`)
  if (!s.strengthRank) lines.push(s.complete ? 'No rating (4-game COVID season)' : 'Season in progress')
  return lines
}

// ---------------------------------------------------------------------------
// Chapter 1: the arc. Team strength percentile by season, coaching eras shaded.
// ---------------------------------------------------------------------------

function ArcDot(props: { cx?: number; cy?: number; payload?: Season; below?: boolean }) {
  const { cx, cy, payload, below } = props
  if (cx == null || cy == null || !payload || payload.strength == null) return null
  const ranked = payload.apFinal != null
  return (
    <g>
      <circle cx={cx} cy={cy} r={ranked ? 5 : 3} fill={ranked ? ERA_COLORS['Jeff Tedford'] : CHART.accent} stroke={CHART.surface} strokeWidth={2} />
      {ranked && (
        <text x={cx} y={below ? cy + 18 : cy - 12} textAnchor="middle" fontSize={10} fill={CHART.text}>
          AP #{payload.apFinal}
        </text>
      )}
    </g>
  )
}

export function SeasonArc({ seasons, eras }: { seasons: Season[]; eras: Era[] }) {
  const prev = new Map(seasons.map((s, i) => [s.year, seasons[i - 1]?.strength ?? null]))
  return (
    <div>
      <div className="h-[22rem]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={seasons} margin={{ top: 28, right: 12, bottom: 24, left: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            {eras.map((e, i) => (
              <ReferenceArea
                key={e.coach}
                x1={e.from - 0.5}
                x2={e.to + 0.5}
                fill={CHART.accent}
                fillOpacity={i % 2 === 0 ? 0 : 0.06}
                ifOverflow="visible"
                label={{ value: lastName(e.coach), position: 'insideTop', fontSize: 11, fill: CHART.muted, dy: -22 }}
              />
            ))}
            <XAxis
              dataKey="year"
              type="number"
              domain={[1999.5, 2026.5]}
              ticks={[2000, 2004, 2008, 2012, 2016, 2020, 2024]}
              tick={tick}
              tickLine={false}
              axisLine={{ stroke: CHART.axis }}
              label={{ value: 'Season', position: 'insideBottom', offset: -14, fontSize: 11, fill: CHART.muted }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <ReferenceLine
              y={50}
              stroke={CHART.axis}
              label={{ value: 'FBS median', position: 'insideBottomRight', fontSize: 10, fill: CHART.muted }}
            />
            <Tooltip
              cursor={{ stroke: CHART.axis }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <Box title={`${payload[0].payload.year} · ${payload[0].payload.coach}`} lines={seasonLines(payload[0].payload)} />
                ) : null
              }
            />
            <Line
              dataKey="strength"
              stroke={CHART.accent}
              strokeWidth={2}
              dot={(p: { cx?: number; cy?: number; payload?: Season }) => (
                <ArcDot key={p.payload?.year} {...p} below={(prev.get(p.payload?.year ?? 0) ?? 0) > (p.payload?.strength ?? 0)} />
              )}
              activeDot={{ r: 6, fill: CHART.accent, stroke: CHART.surface, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        Team strength: where Cal ranked among all FBS teams in schedule-adjusted scoring margin (SRS), as a
        percentile. 100 is the best team in the country, 50 is the median. Gold dots finished the season in the AP
        Top 25. 2020 (four games, no fans) has no rating.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared: coaching-era bands for any chart with seasons on the x-axis
// ---------------------------------------------------------------------------

function eraBands(eras: Era[], from: number, to = 2026) {
  return eras
    .filter((e) => e.to >= from && e.from <= to)
    .map((e, i) => (
      <ReferenceArea
        key={e.coach}
        x1={Math.max(e.from, from) - 0.5}
        x2={Math.min(e.to, to) + 0.5}
        fill={CHART.accent}
        fillOpacity={i % 2 === 0 ? 0.06 : 0}
        ifOverflow="visible"
        label={{ value: lastName(e.coach), position: 'insideTop', fontSize: 11, fill: CHART.muted, dy: -22 }}
      />
    ))
}

const rankAxis = (max: number) => (
  <YAxis
    reversed
    domain={[1, max]}
    ticks={[1, 25, 50, 75, 100, 125].filter((t) => t <= max)}
    tick={tick}
    tickLine={false}
    axisLine={false}
    width={36}
  />
)

// ---------------------------------------------------------------------------
// Chapter 2a: where Cal's roster ranked in talent, season by season
// ---------------------------------------------------------------------------

export function TalentRankChart({ seasons, eras }: { seasons: SeasonRanks[]; eras: Era[] }) {
  const rows = seasons.filter((s) => s.talentRank != null)
  return (
    <div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 28, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            {eraBands(eras, rows[0]?.year ?? 2005)}
            <XAxis dataKey="year" type="number" domain={[rows[0].year - 0.5, rows[rows.length - 1].year + 0.5]} ticks={[2005, 2010, 2015, 2020, 2025]} tick={tick} tickLine={false} axisLine={{ stroke: CHART.axis }} />
            {rankAxis(100)}
            <Tooltip
              cursor={{ stroke: CHART.axis }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const s = payload[0].payload as SeasonRanks
                return <Box title={`${s.year} · ${s.coach}`} lines={[`Roster talent: ${s.talentRank} of ${s.talentTeams}`, s.classRank ? `That year's recruiting class: ${s.classRank} of ${s.classTeams}` : '']} />
              }}
            />
            <Line dataKey="talentRank" stroke={CHART.accent} strokeWidth={2} dot={{ r: 3, fill: CHART.accent, stroke: CHART.surface, strokeWidth: 2 }} isAnimationActive={false}>
              <LabelList
                dataKey="talentRank"
                content={(p: LabelProps & { index?: number }) => {
                  const i = p.index ?? -1
                  if (i !== 0 && i !== rows.length - 1) return null
                  return (
                    <text x={Number(p.x)} y={Number(p.y) - 10} textAnchor={i === 0 ? 'start' : 'end'} fontSize={11} fill={CHART.text}>
                      {ordinalOf(Number(p.value))}
                    </text>
                  )
                }}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        Rank among all FBS teams by roster talent: the average strength of the four recruiting classes on the roster
        that season. 1 is the most talented roster in the country. Higher on the chart is better.
      </p>
    </div>
  )
}

function ordinalOf(n: number) {
  const t = n % 100
  return `${n}${t >= 11 && t <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}

// ---------------------------------------------------------------------------
// Chapter 2b: expected finish vs. actual finish, with the gap shaded
// ---------------------------------------------------------------------------

export function ExpectedVsActual({ seasons, eras }: { seasons: SeasonRanks[]; eras: Era[] }) {
  // Only seasons with both a prediction and a final rating (2020 has no rating)
  const rows = seasons
    .filter((s) => s.expectedRank != null && s.complete)
    .map((s) => {
      const a = s.strengthRank
      // 2020 has no final rating, so leave a gap rather than plot a prediction with nothing to compare
      if (a == null) return { ...s, expectedRank: null, beat: null, missed: null }
      const e = s.expectedRank as number
      return {
        ...s,
        // Shaded bands between the two lines: blue where Cal finished better (a smaller rank) than predicted
        beat: a < e ? [a, e] : [e, e],
        missed: a > e ? [e, a] : [e, e],
      }
    })
  return (
    <div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2" style={{ borderColor: CHART.text }} /> Actual finish
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: CHART.muted }} /> Expected finish, from roster talent
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: GOOD, opacity: 0.6 }} /> Beat expectations
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: BAD, opacity: 0.6 }} /> Fell short
        </span>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 28, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            {eraBands(eras, rows[0]?.year ?? 2005, rows[rows.length - 1].year)}
            <XAxis dataKey="year" type="number" domain={[rows[0].year - 0.5, rows[rows.length - 1].year + 0.5]} ticks={[2005, 2010, 2015, 2020, 2025]} tick={tick} tickLine={false} axisLine={{ stroke: CHART.axis }} />
            {rankAxis(100)}
            <Tooltip
              cursor={{ stroke: CHART.axis }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const s = payload[0].payload as SeasonRanks
                if (s.strengthRank == null) return <Box title={`${s.year} · ${s.coach}`} lines={['No rating (4-game COVID season)']} />
                const diff = (s.expectedRank as number) - s.strengthRank
                return (
                  <Box
                    title={`${s.year} · ${s.coach} · ${s.wins}-${s.losses}`}
                    lines={[
                      `Expected: ${ordinalOf(s.expectedRank as number)}`,
                      `Actual: ${ordinalOf(s.strengthRank)}`,
                      diff >= 0 ? `${diff} spots better than expected` : `${-diff} spots worse than expected`,
                    ]}
                  />
                )
              }}
            />
            <Area dataKey="beat" type="linear" stroke="none" fill={GOOD} fillOpacity={0.45} isAnimationActive={false} activeDot={false} />
            <Area dataKey="missed" type="linear" stroke="none" fill={BAD} fillOpacity={0.45} isAnimationActive={false} activeDot={false} />
            <Line dataKey="expectedRank" type="linear" stroke={CHART.muted} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line dataKey="strengthRank" type="linear" stroke={CHART.text} strokeWidth={2} dot={{ r: 3, fill: CHART.text, stroke: CHART.surface, strokeWidth: 2 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        National rank among FBS teams (1 is best, so higher on the chart is better). The dashed line is where a
        roster with Cal&apos;s talent typically finishes; the solid line is where Cal actually finished, by
        schedule-adjusted margin. Blue gaps: Cal did more with its players than expected. Orange: less.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Chapter 4: average home attendance by season
// ---------------------------------------------------------------------------

export function AttendanceChart({ rows, capacity }: { rows: AttendanceRow[]; capacity: number }) {
  const data = rows.filter((r) => r.year < 2026)
  const k = (n: number) => `${Math.round(n / 1000)}K`
  return (
    <div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: GOOD }} /> Winning season
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: CHART.axis }} /> Losing or .500 season
        </span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 12, bottom: 8, left: 0 }} barCategoryGap={2}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="year" tick={tick} tickLine={false} axisLine={{ stroke: CHART.axis }} interval={4} />
            <YAxis tick={tick} tickLine={false} axisLine={false} width={40} domain={[0, 80000]} ticks={[0, 20000, 40000, 60000, 80000]} tickFormatter={k} />
            <ReferenceLine
              segment={[{ x: 2012, y: capacity }, { x: 2025, y: capacity }]}
              stroke={CHART.muted}
              label={{ value: `Capacity since 2012: ${k(capacity)}`, position: 'insideTopRight', fontSize: 10, fill: CHART.muted }}
            />
            <Tooltip
              cursor={{ fill: CHART.cursorFill }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as AttendanceRow
                if (r.average == null) return <Box title={`${r.year}`} lines={['No fans (COVID)']} />
                return <Box title={`${r.year}${r.venue === 'AT&T Park' ? ' · AT&T Park' : ''}`} lines={[`${r.average.toLocaleString()} per home game`, `${r.games} home games`]} />
              }}
            />
            <Bar dataKey="average" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((r) => (
                <Cell key={r.year} fill={r.winning ? GOOD : CHART.axis} />
              ))}
              <LabelList
                dataKey="year"
                content={(p: LabelProps) =>
                  p.value === 2011 ? (
                    <text x={Number(p.x) + Number(p.width) / 2} y={Number(p.y) - 6} textAnchor="middle" fontSize={9} fill={CHART.muted}>
                      AT&amp;T Park
                    </text>
                  ) : null
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        Average home attendance per game. 2011 home games were played at AT&amp;T Park in San Francisco during the
        stadium renovation; 2020 had no fans. Missing seasons in the main data source were filled from each
        season&apos;s published box scores.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Chapter 5: transfer portal, arrivals above the line and departures below
// ---------------------------------------------------------------------------

export function PortalChart({ rows }: { rows: PortalRow[] }) {
  const data = rows.map((r) => ({ ...r, outNeg: -r.out }))
  return (
    <div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: GOOD }} /> Transferred in
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: BAD }} /> Transferred out
        </span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} stackOffset="sign" margin={{ top: 16, right: 12, bottom: 8, left: 0 }} barCategoryGap="30%">
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="year" tick={tick} tickLine={false} axisLine={false} />
            <YAxis tick={tick} tickLine={false} axisLine={false} width={36} domain={[-40, 40]} ticks={[-40, -20, 0, 20, 40]} tickFormatter={(v: number) => `${Math.abs(v)}`} />
            <ReferenceLine y={0} stroke={CHART.muted} />
            <Tooltip
              cursor={{ fill: CHART.cursorFill }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as PortalRow
                return <Box title={`${r.year} portal`} lines={[`${r.in} transferred in`, `${r.out} transferred out`]} />
              }}
            />
            <Bar dataKey="in" stackId="p" fill={GOOD} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="in" position="top" fontSize={10} fill={CHART.text} />
            </Bar>
            <Bar dataKey="outNeg" stackId="p" fill={BAD} radius={[0, 0, 4, 4]} isAnimationActive={false}>
              <LabelList
                dataKey="out"
                content={(p: LabelProps) => (
                  // Departures are drawn as negative bars; put the count just below the bar's end
                  <text
                    x={Number(p.x) + Number(p.width) / 2}
                    y={Math.max(Number(p.y), Number(p.y) + Number(p.height)) + 13}
                    textAnchor="middle"
                    fontSize={10}
                    fill={CHART.text}
                  >
                    {p.value}
                  </text>
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        Players entering or leaving Cal through the transfer portal, by the season they transferred for.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Chapter 6: every Power 4 roster by talent, one row per conference
// ---------------------------------------------------------------------------

const CONFS = ['SEC', 'Big Ten', 'Big 12', 'ACC']

export function PeerStrip({ peers, highlight = 'California' }: { peers: Peer[]; highlight?: string }) {
  const data = peers.map((p) => ({ ...p, row: CONFS.indexOf(p.conference) }))
  const median = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b)
    return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
  }
  const medians = CONFS.map((c, i) => ({ row: i, talent: median(data.filter((d) => d.conference === c).map((d) => d.talent)) }))
  const others = data.filter((d) => d.team !== highlight)
  const cal = data.filter((d) => d.team === highlight)
  return (
    <div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: ERA_COLORS['Jeff Tedford'] }} /> Cal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: CHART.muted }} /> Other Power 4 teams
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-0.5" style={{ background: CHART.text }} /> Conference median
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid stroke={CHART.grid} horizontal={false} />
            <XAxis type="number" dataKey="talent" domain={[550, 1050]} ticks={[600, 700, 800, 900, 1000]} tick={tick} tickLine={false} axisLine={{ stroke: CHART.axis }}
              label={{ value: '2026 roster talent (247Sports composite)', position: 'insideBottom', offset: -14, fontSize: 11, fill: CHART.muted }} />
            <YAxis type="number" dataKey="row" domain={[-0.6, 3.6]} ticks={[0, 1, 2, 3]} tickFormatter={(i: number) => CONFS[i]} reversed tick={tick} tickLine={false} axisLine={false} width={56} />
            <ZAxis range={[50, 50]} />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const p = payload[0].payload as Peer & { row: number }
                if (p.team == null) return null
                return <Box title={`${p.team} · ${p.conference}`} lines={[`Talent ${p.talent.toFixed(0)}`, `${ordinalOf(p.rank)} of ${peers.length} Power 4 teams`]} />
              }}
            />
            <Scatter data={others} fill={CHART.muted} fillOpacity={0.7} stroke={CHART.surface} strokeWidth={1} isAnimationActive={false} />
            <Scatter data={medians} shape={(p: { cx?: number; cy?: number }) => <rect x={(p.cx ?? 0) - 1} y={(p.cy ?? 0) - 11} width={2} height={22} fill={CHART.text} />} isAnimationActive={false} />
            {/* Cal: a larger gold dot with a direct label */}
            <Scatter
              data={cal}
              isAnimationActive={false}
              shape={(p: { cx?: number; cy?: number }) => (
                <g>
                  <circle cx={p.cx} cy={p.cy} r={7} fill={ERA_COLORS['Jeff Tedford']} stroke={CHART.surface} strokeWidth={2} />
                  <text x={p.cx} y={(p.cy ?? 0) - 13} textAnchor="middle" fontSize={11} fill={CHART.text}>
                    Cal
                  </text>
                </g>
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        Each dot is one Power 4 team&apos;s 2026 roster, rated by the 247Sports talent composite, which counts every
        player on the roster, transfers included. Further right is more talented.
      </p>
    </div>
  )
}
