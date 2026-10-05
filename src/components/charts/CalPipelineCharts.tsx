'use client'

import { useState } from 'react'
import {
  ComposedChart,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { CHART } from '@/lib/chartTheme'

// ---------------------------------------------------------------------------
// Shared types (match src/data/cal-pipeline.json)
// ---------------------------------------------------------------------------

export type CurvePoint = { pick: number; expected: number }
export type CalPlayer = { player: string; year: number; pick: number; value: number; expected: number; surplus: number }
export type SchoolRow = { school: string; rank: number; n: number; mean: number; lo: number; hi: number; beat: number; featured: boolean }
export type OtherPlayer = CalPlayer & { school: string }
export type TimelinePoint = { year: number; mean: number | null; picks: number }

const CAL = 'California'

// ---------------------------------------------------------------------------
// 1. Draft curve: what a pick "should" produce, with Cal players on top.
// Line = typical career value at each pick (all classes pooled, for
// illustration). Dots = Cal players; anything above the line beat its slot.
// ---------------------------------------------------------------------------

function DotLabel(props: { cx?: number; cy?: number; payload?: CalPlayer & { label?: boolean } }) {
  const { cx = 0, cy = 0, payload } = props
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={CHART.accent} stroke={CHART.surface} strokeWidth={2} />
      {payload?.label && (
        <text x={cx + 9} y={cy + 4} fontSize={11} fill={CHART.text}>
          {payload.player.split(' ').slice(-1)[0]}
        </text>
      )}
    </g>
  )
}

function CurveTooltip({ active, payload }: { active?: boolean; payload?: { payload: Partial<CalPlayer> & CurvePoint }[] }) {
  if (!active || !payload?.length) return null
  const p = payload.find((x) => x.payload.player)?.payload ?? payload[0].payload
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2 text-xs">
      {p.player ? (
        <>
          <p className="text-[var(--text-primary)] mb-1">{p.player}, pick {p.pick} ({p.year})</p>
          <p className="font-[family-name:var(--font-dm-mono)] text-[var(--text-secondary)]">
            Actual {p.value} · expected {p.expected}
          </p>
        </>
      ) : (
        <p className="font-[family-name:var(--font-dm-mono)] text-[var(--text-secondary)]">Pick {p.pick}: typical value {p.expected}</p>
      )}
    </div>
  )
}

export function DraftCurveChart({
  curve,
  players,
  unit,
  labelTop = 4,
}: {
  curve: CurvePoint[]
  players: CalPlayer[]
  unit: string
  labelTop?: number
}) {
  // Label only the biggest outperformers so the chart doesn't turn into text
  const dots = players.map((p, i) => ({ ...p, label: i < labelTop }))
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="pick"
            type="number"
            domain={[0, 'dataMax']}
            tick={{ fontSize: 11, fill: CHART.muted }}
            tickLine={false}
            axisLine={{ stroke: CHART.axis }}
            label={{ value: 'Draft pick', position: 'insideBottom', offset: -4, fontSize: 11, fill: CHART.muted }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART.muted }}
            tickLine={false}
            axisLine={false}
            width={36}
            label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 11, fill: CHART.muted, dy: 40 }}
          />
          <Tooltip content={<CurveTooltip />} cursor={{ stroke: CHART.axis }} />
          <Line data={curve} dataKey="expected" type="monotone" stroke={CHART.muted} strokeWidth={2} dot={false} isAnimationActive={false} />
          <Scatter data={dots} dataKey="value" shape={<DotLabel />} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2. School rankings: average surplus per pick with a 95% interval.
// Dot = average, bar = the range the true average plausibly falls in.
// A bar that crosses zero means "can't rule out average".
// Built with positioned divs, so it stays sharp and responsive.
//
// RankingList draws one ranking. By default only the "featured" rows show
// (top 10, Cal, big-name programs); "Show all" expands to the full list.
// SchoolLeaderboard adds the Football / Basketball toggle buttons on top.
// ---------------------------------------------------------------------------

export type LeaderboardView = { unit: string; rows: SchoolRow[]; total: number; decimals: number }

export function RankingList({ view }: { view: LeaderboardView }) {
  const [showAll, setShowAll] = useState(false)
  const rows = showAll ? view.rows : view.rows.filter((r) => r.featured)
  // Scale from every school in the view, so the axis doesn't jump when the list expands
  const lo = Math.min(0, ...view.rows.map((r) => r.lo))
  const hi = Math.max(0, ...view.rows.map((r) => r.hi))
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100
  const fmt = (v: number) => v.toFixed(view.decimals)

  return (
    <div>
      <div className="text-xs">
        {rows.map((r, i) => {
          const isCal = r.school === CAL
          // In the short list, label the point where ranks start to skip
          const skips = !showAll && i > 0 && r.rank > rows[i - 1].rank + 1 && rows[i - 1].rank === i
          return (
            <div key={r.school}>
              {skips && (
                <div className="mt-3 mb-1 pt-3 border-t border-[var(--border-subtle)] text-[var(--text-muted)]">
                  Well-known programs for comparison (schools ranked in between are hidden)
                </div>
              )}
              <div
                className={`grid grid-cols-[28px_minmax(0,120px)_1fr_44px] sm:grid-cols-[28px_150px_1fr_52px] items-center gap-2 py-1.5 ${
                  isCal ? 'bg-[var(--accent)]/10' : ''
                }`}
              >
                <span className="font-[family-name:var(--font-dm-mono)] text-right text-[var(--text-muted)]">{r.rank}</span>
                <span className={`truncate ${isCal ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                  {r.school === CAL ? 'Cal' : r.school}
                </span>
                <div className="relative h-4" title={`${r.school}: ${fmt(r.mean)} (95% interval ${fmt(r.lo)} to ${fmt(r.hi)}), ${r.n} picks`}>
                  {/* zero line */}
                  <span className="absolute inset-y-0 w-px bg-[var(--border)]" style={{ left: `${pos(0)}%` }} />
                  {/* 95% interval */}
                  <span
                    className={`absolute top-1/2 h-[2px] -translate-y-1/2 ${isCal ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]/60'}`}
                    style={{ left: `${pos(r.lo)}%`, width: `${pos(r.hi) - pos(r.lo)}%` }}
                  />
                  {/* average */}
                  <span
                    className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--bg)] ${
                      isCal ? 'bg-[var(--accent)]' : 'bg-[var(--text-secondary)]'
                    }`}
                    style={{ left: `${pos(r.mean)}%` }}
                  />
                </div>
                <span className={`font-[family-name:var(--font-dm-mono)] text-right ${isCal ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                  {r.mean > 0 ? '+' : ''}
                  {fmt(r.mean)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowAll(!showAll)}
        aria-expanded={showAll}
        className="mt-4 text-xs tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
      >
        {showAll ? 'Show fewer schools' : `Show all ${view.total} schools`}
      </button>

      <p className="text-xs text-[var(--text-muted)] mt-4">
        {view.unit} Dot: the school&apos;s average per pick. Line: how far that average could move with luck (95%
        interval). Left of the vertical line means below draft slot. Ranked among {view.total} schools.
      </p>
    </div>
  )
}

export function SchoolLeaderboard({
  both,
  football,
  basketball,
}: {
  both: LeaderboardView
  football: LeaderboardView
  basketball: LeaderboardView
}) {
  const [sports, setSports] = useState({ football: true, basketball: true })

  // Clicking a sport turns it on or off, but never leaves both off
  const toggle = (sport: 'football' | 'basketball') => {
    const next = { ...sports, [sport]: !sports[sport] }
    if (next.football || next.basketball) setSports(next)
  }

  const view = sports.football && sports.basketball ? both : sports.football ? football : basketball
  const buttons: { key: 'football' | 'basketball'; label: string }[] = [
    { key: 'football', label: 'Football' },
    { key: 'basketball', label: 'Basketball' },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-[var(--text-muted)] mr-1">Include:</span>
        {buttons.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => toggle(b.key)}
            aria-pressed={sports[b.key]}
            className={`flex items-center gap-2 text-xs tracking-wider uppercase px-3 py-1.5 border transition-colors ${
              sports[b.key]
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {/* Small box so on/off doesn't depend on color alone */}
            <span
              aria-hidden="true"
              className={`inline-block h-2.5 w-2.5 border ${
                sports[b.key] ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--text-muted)]'
              }`}
            />
            {b.label}
          </button>
        ))}
      </div>
      <RankingList view={view} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2b. Trend lines. Both are a single series over draft years with one marked
// period, so they share a component:
//   - Cal's score over time, with the coaching era shaded
//   - Number of schools with a draft pick, with the NIL era shaded
// ---------------------------------------------------------------------------

type TrendRow = Record<string, number | null | undefined>

function TrendTooltip({ active, payload, label, describe }: { active?: boolean; payload?: { payload: TrendRow }[]; label?: number; describe: (row: TrendRow) => string[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2 text-xs">
      <p className="text-[var(--text-primary)] mb-1">{label}</p>
      {describe(payload[0].payload).map((line) => (
        <p key={line} className="font-[family-name:var(--font-dm-mono)] text-[var(--text-secondary)]">{line}</p>
      ))}
    </div>
  )
}

const signed = (v: number) => `${v > 0 ? '+' : ''}${v}`

export function TrendChart({
  data,
  dataKey,
  unit,
  band,
  bandLabel,
  zeroLine = false,
  tooltip,
  compare,
}: {
  data: TrendRow[]
  dataKey: string
  unit: string
  band: [number, number] // first and last year of the shaded period
  bandLabel: string
  zeroLine?: boolean
  tooltip: 'score' | 'schools'
  // A second school's line, drawn in the comparison color from the "other" fields of each row
  compare?: string
}) {
  // Tooltip wording lives here because functions can't be passed from a server page
  const describe = (row: TrendRow): string[] => {
    if (tooltip === 'schools') {
      return [`${row.schools} schools had a pick; the top 25 schools supplied ${Math.round((row.top25Share ?? 0) * 100)}%`]
    }
    const lines = [
      row.mean == null
        ? `${compare ? 'Cal: ' : ''}no picks in the 5 classes around this year`
        : `${compare ? 'Cal: ' : ''}${signed(row.mean)} per pick, ${row.picks} picks in the 5 classes around this year`,
    ]
    if (compare) {
      lines.push(row.other == null ? `${compare}: no picks` : `${compare}: ${signed(row.other)} per pick, ${row.otherPicks} picks`)
    }
    return lines
  }
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 24, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="year"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 11, fill: CHART.muted }}
            tickLine={false}
            axisLine={{ stroke: CHART.axis }}
            label={{ value: 'Draft year', position: 'insideBottom', offset: -4, fontSize: 11, fill: CHART.muted }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART.muted }}
            tickLine={false}
            axisLine={false}
            width={40}
            // Round the axis out to whole tens so the tick labels are clean numbers
            domain={[(min: number) => Math.floor((min - 1) / 10) * 10, (max: number) => Math.ceil((max + 1) / 10) * 10]}
            label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 11, fill: CHART.muted, dy: 50 }}
          />
          <ReferenceArea
            x1={band[0]}
            x2={band[1]}
            fill={CHART.accent}
            fillOpacity={0.1}
            label={{ value: bandLabel, position: 'insideTop', fontSize: 11, fill: CHART.accent, dy: -18 }}
          />
          {zeroLine && <ReferenceLine y={0} stroke={CHART.muted} strokeDasharray="4 4" />}
          <Tooltip content={<TrendTooltip describe={describe} />} cursor={{ stroke: CHART.axis }} />
          <Line dataKey={dataKey} name="California" type="monotone" stroke={CHART.accent} strokeWidth={2} dot={{ r: 2, fill: CHART.accent }} isAnimationActive={false} connectNulls />
          {compare && (
            <Line dataKey="other" name={compare} type="monotone" stroke={CHART.second} strokeWidth={2} dot={{ r: 2, fill: CHART.second }} isAnimationActive={false} connectNulls />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Cal's line by default, with a dropdown to lay any ranked school on top of it
export function SchoolTrendChart({
  timelines,
  schools,
  unit,
  band,
  bandLabel,
}: {
  timelines: Record<string, TimelinePoint[]>
  schools: SchoolRow[] // ranked schools, used for the dropdown labels
  unit: string
  band: [number, number]
  bandLabel: string
}) {
  const [other, setOther] = useState('')
  const cal = timelines[CAL]
  const theirs = other ? timelines[other] : undefined
  const data: TrendRow[] = cal.map((p, i) => ({
    year: p.year,
    mean: p.mean,
    picks: p.picks,
    other: theirs?.[i]?.mean,
    otherPicks: theirs?.[i]?.picks,
  }))
  const options = [...schools].sort((a, b) => a.rank - b.rank).filter((r) => r.school !== CAL && timelines[r.school])
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
        <label htmlFor="trend-school" className="text-[var(--text-muted)]">
          Compare Cal with
        </label>
        <select
          id="trend-school"
          value={other}
          onChange={(e) => setOther(e.target.value)}
          className="bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] px-2 py-1 rounded"
        >
          <option value="">Pick a school</option>
          {options.map((r) => (
            <option key={r.school} value={r.school}>
              {r.school} (#{r.rank} of {schools.length} over 40 years)
            </option>
          ))}
        </select>
        {other && (
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[var(--text-secondary)]">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: CHART.accent }} /> Cal
            </span>
            <span className="flex items-center gap-1 text-[var(--text-secondary)]">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: CHART.second }} /> {other}
            </span>
          </span>
        )}
      </div>
      <TrendChart data={data} dataKey="mean" unit={unit} band={band} bandLabel={bandLabel} zeroLine tooltip="score" compare={other || undefined} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. Cal's outperformers: expected value (hollow) vs actual value (filled)
// for each player, sorted by how far he beat his slot.
// ---------------------------------------------------------------------------

export function OutperformersChart({ players, unit, others = [] }: { players: CalPlayer[]; unit: string; others?: OtherPlayer[] }) {
  // Players from other schools the reader has added for comparison, keyed by "player-year"
  const [picked, setPicked] = useState<string[]>([])
  const key = (p: CalPlayer) => `${p.player}-${p.year}`
  const added = picked.map((k) => others.find((o) => key(o) === k)).filter((o): o is OtherPlayer => !!o)
  const rows: (CalPlayer & { school?: string })[] = [...players, ...added]
  const max = Math.max(...rows.map((p) => Math.max(p.value, p.expected)))
  const pos = (v: number) => (Math.max(v, 0) / max) * 100
  // Dropdown grouped by school, best player first within each school
  const bySchool = new Map<string, OtherPlayer[]>()
  for (const o of others) bySchool.set(o.school, [...(bySchool.get(o.school) ?? []), o])
  return (
    <div>
      <div className="space-y-3">
        {rows.map((p) => (
          <div key={key(p)} className="grid grid-cols-[110px_1fr_52px] sm:grid-cols-[170px_1fr_60px] items-center gap-3 text-xs">
            <div className="min-w-0">
              <p className="truncate text-[var(--text-primary)] text-sm">
                {p.player}
                {p.school && (
                  <button
                    type="button"
                    onClick={() => setPicked((ks) => ks.filter((k) => k !== key(p)))}
                    aria-label={`Remove ${p.player}`}
                    className="ml-2 text-[var(--text-muted)] hover:text-[var(--accent)]"
                  >
                    &times;
                  </button>
                )}
              </p>
              {p.school && <p className="truncate text-[var(--text-secondary)]">{p.school}</p>}
              <p className="font-[family-name:var(--font-dm-mono)] text-[var(--text-muted)]">
                {p.year} &middot; pick {p.pick}
              </p>
            </div>
            <div className="relative h-4" title={`${p.player}: actual ${p.value}, expected ${p.expected}`}>
              <span className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-[var(--border-subtle)]" />
              <span
                className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-[var(--accent)]/50"
                style={{
                  left: `${pos(Math.min(p.expected, p.value))}%`,
                  width: `${Math.abs(pos(p.value) - pos(p.expected))}%`,
                  // Comparison players use the chart palette's second series color (same as the trend chart)
                  ...(p.school ? { background: CHART.second, opacity: 0.5 } : {}),
                }}
              />
              <span
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--text-muted)] bg-[var(--bg)]"
                style={{ left: `${pos(p.expected)}%` }}
              />
              <span
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg)]"
                style={{ left: `${pos(p.value)}%`, ...(p.school ? { background: CHART.second } : {}) }}
              />
            </div>
            <span className="font-[family-name:var(--font-dm-mono)] text-right text-[var(--accent)]" style={p.school ? { color: CHART.second } : undefined}>
              {p.surplus > 0 ? '+' : ''}
              {p.surplus}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-4">
        Hollow dot: {unit} expected at that pick. Filled dot: actual. Number: the difference.
      </p>
      {others.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
          <label htmlFor="compare-player" className="text-[var(--text-muted)]">
            Add a player from another school
          </label>
          <select
            id="compare-player"
            value=""
            onChange={(e) => {
              if (e.target.value && !picked.includes(e.target.value)) setPicked((ks) => [...ks, e.target.value])
            }}
            className="bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] px-2 py-1 rounded max-w-full"
          >
            <option value="">Pick a player</option>
            {[...bySchool.entries()].map(([school, list]) => (
              <optgroup key={school} label={school}>
                {list.map((o) => (
                  <option key={key(o)} value={key(o)}>
                    {o.player} ({o.year}, pick {o.pick}, {signed(o.surplus)})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {picked.length > 0 && (
            <button type="button" onClick={() => setPicked([])} className="text-[var(--text-muted)] hover:text-[var(--accent)]">
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}
