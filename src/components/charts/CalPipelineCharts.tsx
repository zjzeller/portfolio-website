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

function TrendTooltip({ active, payload, label, describe }: { active?: boolean; payload?: { payload: Record<string, number> }[]; label?: number; describe: (row: Record<string, number>) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2 text-xs">
      <p className="text-[var(--text-primary)] mb-1">{label}</p>
      <p className="font-[family-name:var(--font-dm-mono)] text-[var(--text-secondary)]">{describe(payload[0].payload)}</p>
    </div>
  )
}

export function TrendChart({
  data,
  dataKey,
  unit,
  band,
  bandLabel,
  zeroLine = false,
  tooltip,
}: {
  data: Record<string, number>[]
  dataKey: string
  unit: string
  band: [number, number] // first and last year of the shaded period
  bandLabel: string
  zeroLine?: boolean
  tooltip: 'score' | 'schools'
}) {
  // Tooltip wording lives here because functions can't be passed from a server page
  const describe = (row: Record<string, number>) =>
    tooltip === 'score'
      ? `${row.mean > 0 ? '+' : ''}${row.mean} per pick, ${row.picks} picks in the 5 classes around this year`
      : `${row.schools} schools had a pick; the top 25 schools supplied ${Math.round(row.top25Share * 100)}%`
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
          <Line dataKey={dataKey} type="monotone" stroke={CHART.accent} strokeWidth={2} dot={{ r: 2, fill: CHART.accent }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. Cal's outperformers: expected value (hollow) vs actual value (filled)
// for each player, sorted by how far he beat his slot.
// ---------------------------------------------------------------------------

export function OutperformersChart({ players, unit }: { players: CalPlayer[]; unit: string }) {
  const max = Math.max(...players.map((p) => Math.max(p.value, p.expected)))
  const pos = (v: number) => (Math.max(v, 0) / max) * 100
  return (
    <div>
      <div className="space-y-3">
        {players.map((p) => (
          <div key={`${p.player}-${p.year}`} className="grid grid-cols-[110px_1fr_52px] sm:grid-cols-[170px_1fr_60px] items-center gap-3 text-xs">
            <div className="min-w-0">
              <p className="truncate text-[var(--text-primary)] text-sm">{p.player}</p>
              <p className="font-[family-name:var(--font-dm-mono)] text-[var(--text-muted)]">
                {p.year} &middot; pick {p.pick}
              </p>
            </div>
            <div className="relative h-4" title={`${p.player}: actual ${p.value}, expected ${p.expected}`}>
              <span className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-[var(--border-subtle)]" />
              <span
                className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-[var(--accent)]/50"
                style={{ left: `${pos(Math.min(p.expected, p.value))}%`, width: `${Math.abs(pos(p.value) - pos(p.expected))}%` }}
              />
              <span
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--text-muted)] bg-[var(--bg)]"
                style={{ left: `${pos(p.expected)}%` }}
              />
              <span
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg)]"
                style={{ left: `${pos(p.value)}%` }}
              />
            </div>
            <span className="font-[family-name:var(--font-dm-mono)] text-right text-[var(--accent)]">
              {p.surplus > 0 ? '+' : ''}
              {p.surplus}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-4">
        Hollow dot: {unit} expected at that pick. Filled dot: actual. Number: the difference.
      </p>
    </div>
  )
}
