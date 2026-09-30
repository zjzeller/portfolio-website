'use client'

import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Area, AreaChart, ReferenceArea, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { CHART } from '@/lib/chartTheme'
import type { TopName } from '@/types/baby-names'

// ---------------------------------------------------------------------------
// Guess the Decade
// Shows a name; the visitor guesses the decade most people with it were born.
// Answer = decade of the median birth year. Only names concentrated in one era
// are used (80% of people born within a 35-year window), so every round has a
// fair answer. After guessing, the real curve is revealed.
// ---------------------------------------------------------------------------

const DECADES = Array.from({ length: 12 }, (_, i) => 1910 + i * 10) // 1910s to 2020s
const MAX_SPREAD = 35 // years between the 10th and 90th percentile birth year

const decadeOf = (year: number) => Math.floor(year / 10) * 10

// Deterministic shuffle so the server and browser agree on the first name
// (a random first pick would cause a hydration mismatch in Next.js).
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  let s = seed
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function GuessTheDecade({ names }: { names: TopName[] }) {
  const pool = useMemo(
    () =>
      seededShuffle(
        names.filter((n) => n.predictedRange[2] - n.predictedRange[0] <= MAX_SPREAD),
        42
      ),
    [names]
  )
  const [i, setI] = useState(0)
  const [guess, setGuess] = useState<number | null>(null)
  const [score, setScore] = useState({ right: 0, played: 0 })

  const n = pool[i % pool.length]
  const [p10, p50, p90] = n.predictedRange
  const answer = decadeOf(p50)
  const revealed = guess !== null
  const verdict = !revealed ? null : guess === answer ? 'right' : Math.abs(guess - answer) === 10 ? 'close' : 'miss'

  function choose(d: number) {
    if (revealed) return
    setGuess(d)
    setScore((s) => ({ right: s.right + (d === answer ? 1 : 0), played: s.played + 1 }))
  }

  function next() {
    setGuess(null)
    setI((x) => x + 1)
  }

  return (
    <div className="border border-[var(--border)] bg-[var(--bg-surface)] p-5 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs tracking-wider uppercase text-[var(--text-muted)]">
          When were most people named&hellip;
        </span>
        <span className="font-[family-name:var(--font-dm-mono)] text-xs text-[var(--text-muted)]">
          Score {score.right}/{score.played}
        </span>
      </div>

      <p className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-[var(--text-primary)]">
        {n.name}
        <span className="ml-3 align-middle text-sm font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)]">
          {n.gender === 'F' ? 'Female' : 'Male'}
        </span>
      </p>

      {/* Decade buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-8">
        {DECADES.map((d) => {
          const isAnswer = revealed && d === answer
          const isWrongGuess = revealed && d === guess && d !== answer
          return (
            <button
              key={d}
              type="button"
              onClick={() => choose(d)}
              disabled={revealed}
              className={`py-2.5 text-sm font-[family-name:var(--font-dm-mono)] border transition-colors ${
                isAnswer
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                  : isWrongGuess
                    ? 'border-[var(--text-muted)] text-[var(--text-muted)] line-through'
                    : revealed
                      ? 'border-[var(--border-subtle)] text-[var(--text-muted)]/60'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }`}
            >
              {d}s
            </button>
          )
        })}
      </div>

      {/* Reveal */}
      {revealed && (
        <div className="mt-8 animate-[fade-in_0.4s_ease-out]">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)] font-medium">
              {verdict === 'right' ? 'Nailed it.' : verdict === 'close' ? 'Close, one decade off.' : 'Not quite.'}
            </strong>{' '}
            Half of everyone named {n.name} was born by <span className="metric text-[var(--accent)]">{p50}</span>, and 80% were
            born between <span className="metric text-[var(--accent)]">{p10}</span> and{' '}
            <span className="metric text-[var(--accent)]">{p90}</span>.
          </p>
          <div className="h-40 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={n.yearlyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                {/* Shaded band: where 80% of people with the name were born */}
                <ReferenceArea x1={p10} x2={p90} fill={CHART.accent} fillOpacity={0.08} />
                <ReferenceLine x={p50} stroke={CHART.muted} strokeDasharray="3 3" />
                <XAxis dataKey="year" type="number" domain={[1910, 2024]} tick={{ fontSize: 11, fill: CHART.muted }} tickLine={false} axisLine={{ stroke: CHART.grid }} ticks={[1920, 1950, 1980, 2010]} />
                <YAxis hide />
                <Area type="monotone" dataKey="share" stroke={CHART.accent} strokeWidth={2} fill={CHART.accent} fillOpacity={0.15} isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <button
            type="button"
            onClick={next}
            className="mt-4 inline-flex items-center gap-2 text-xs tracking-wider uppercase text-[var(--accent)] hover:text-[var(--accent-dim)]"
          >
            Next name <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
