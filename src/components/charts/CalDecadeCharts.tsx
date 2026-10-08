'use client'

// Charts for "Cal Football, 2000 to Now". Every chart reads from src/data/cal-decade.json
// (built by scripts/cal-decade.py).

import {
  ComposedChart,
  ScatterChart,
  BarChart,
  Line,
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

const tick = { fontSize: 11, fill: CHART.muted }
const lastName = (coach: string) => coach.split(' ').slice(-1)[0]
const signed = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`

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
// Chapter 2: talent in, results out. Connected scatterplot, one dot per season.
// ---------------------------------------------------------------------------

const LABEL_YEARS = new Set([2006, 2009, 2013, 2015, 2023, 2025])

function YearLabel(props: { x?: number; y?: number; value?: number }) {
  const { x, y, value } = props
  if (x == null || y == null || value == null || !LABEL_YEARS.has(value)) return null
  return (
    <text x={x + 8} y={y - 8} fontSize={10} fill={CHART.text}>
      {value}
    </text>
  )
}

export function TalentPath({ seasons, fit }: { seasons: Season[]; fit: { slope: number; intercept: number } }) {
  const points = seasons
    .filter((s) => s.talent != null && s.strength != null)
    .map((s) => ({ ...s, x: s.talent as number, y: s.strength as number }))
  const coaches = Object.keys(ERA_COLORS).filter((c) => points.some((p) => p.coach === c))
  const [x0, x1] = [45, 90]
  return (
    <div>
      {/* Legend: identity is also carried by the direct year labels and the tooltip */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3 text-xs text-[var(--text-secondary)]">
        {coaches.map((c) => (
          <span key={c} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: ERA_COLORS[c] }} />
            {c}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t border-dashed" style={{ borderColor: CHART.muted }} />
          What roster talent predicts
        </span>
      </div>
      <div className="h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 28, left: 0 }}>
            <CartesianGrid stroke={CHART.grid} />
            <XAxis
              type="number"
              dataKey="x"
              domain={[x0, x1]}
              ticks={[50, 60, 70, 80, 90]}
              tick={tick}
              tickLine={false}
              axisLine={{ stroke: CHART.axis }}
              label={{ value: 'Roster talent (percentile of last four recruiting classes)', position: 'insideBottom', offset: -16, fontSize: 11, fill: CHART.muted }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <ZAxis range={[60, 60]} />
            <ReferenceLine
              segment={[
                { x: x0, y: fit.intercept + fit.slope * x0 },
                { x: x1, y: fit.intercept + fit.slope * x1 },
              ]}
              stroke={CHART.muted}
              strokeDasharray="4 4"
              ifOverflow="hidden"
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const s = payload[0].payload as Season
                return (
                  <Box
                    title={`${s.year} · ${s.coach}`}
                    lines={[
                      `${s.wins}-${s.losses}`,
                      `Talent: ${s.talent}th pct`,
                      `Strength: ${s.strength}th pct`,
                      `vs. prediction: ${signed((s.strength ?? 0) - (s.expected ?? 0))}`,
                    ]}
                  />
                )
              }}
            />
            {/* The path, in season order */}
            <Scatter data={points} line={{ stroke: CHART.axis, strokeWidth: 1.5 }} shape={() => <g />} isAnimationActive={false} />
            {coaches.map((c) => (
              <Scatter
                key={c}
                name={c}
                data={points.filter((p) => p.coach === c)}
                fill={ERA_COLORS[c]}
                stroke={CHART.surface}
                strokeWidth={2}
                isAnimationActive={false}
              >
                <LabelList dataKey="year" content={<YearLabel />} />
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        One dot per season, joined in order from 2005 to 2025. The dashed line is the typical result for that much
        talent, fit across every FBS team-season. Above the line, Cal got more out of its roster than talent alone
        predicts; below it, less.
      </p>
    </div>
  )
}

// Same seasons as a bar per year: how far above or below the prediction Cal landed.
export function TalentGap({ seasons }: { seasons: Season[] }) {
  // Keep 2020 (no rating) as an empty slot so the years stay evenly spaced
  const rows = seasons
    .filter((s) => s.expected != null && s.complete)
    .map((s) => ({
      ...s,
      gap: s.strength != null ? Math.round(((s.strength as number) - (s.expected as number)) * 10) / 10 : null,
    }))
  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 0 }} barCategoryGap={2}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="year" tick={tick} tickLine={false} axisLine={false} interval={3} />
            <YAxis tick={tick} tickLine={false} axisLine={false} width={36} domain={[-50, 25]} ticks={[-50, -25, 0, 25]} />
            <ReferenceLine y={0} stroke={CHART.muted} />
            <Tooltip
              cursor={{ fill: CHART.cursorFill }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const s = payload[0].payload as Season & { gap: number | null }
                if (s.gap == null) return <Box title={`${s.year} · ${s.coach}`} lines={['No rating (4-game COVID season)']} />
                return <Box title={`${s.year} · ${s.coach}`} lines={[`${signed(s.gap)} vs. prediction`, `${s.wins}-${s.losses}`]} />
              }}
            />
            <Bar dataKey="gap" radius={[4, 4, 4, 4]} isAnimationActive={false}>
              {rows.map((r) => (
                <Cell key={r.year} fill={ERA_COLORS[r.coach] ?? CHART.muted} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        Percentile points above or below what roster talent predicts. Colors match the coaches above.
      </p>
    </div>
  )
}
