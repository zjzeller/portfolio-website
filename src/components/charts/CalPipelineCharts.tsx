'use client'

import { useState } from 'react'
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

// Formats a surplus with an explicit plus sign, e.g. +12
const signed = (v: number) => `${v > 0 ? '+' : ''}${v}`

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
