'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import type { YearlyTop } from '@/types/baby-names'

// ---------------------------------------------------------------------------
// Name Time Machine
// An animated "bar chart race": the top 10 girls' or boys' names for the
// selected year. Drag the slider or press play to watch 1910 to 2024 go by.
// Built with plain divs + CSS transitions (no chart library): each bar is
// positioned by its rank, so when a name moves up or down the bar slides.
// ---------------------------------------------------------------------------

const ROW = 36 // px height per row, including the gap
const STEP_MS = 450 // time per year while playing

export default function NameTimeMachine({ years }: { years: YearlyTop[] }) {
  const first = years[0].year
  const last = years[years.length - 1].year
  const [year, setYear] = useState(1950)
  const [gender, setGender] = useState<'F' | 'M'>('F')
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Advance one year per tick while playing; stop at the last year
  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => {
      setYear((y) => {
        if (y >= last) {
          setPlaying(false)
          return y
        }
        return y + 1
      })
    }, STEP_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, last])

  const entry = years.find((y) => y.year === year) ?? years[0]
  const rows = entry[gender]
  const max = rows[0]?.[1] ?? 1 // the #1 name sets the full bar width

  function togglePlay() {
    // Pressing play at the end restarts from the beginning
    if (!playing && year >= last) setYear(first)
    setPlaying((p) => !p)
  }

  return (
    <div className="border border-[var(--border)] bg-[var(--bg-surface)] p-5 md:p-8">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-4">
          <span className="font-[family-name:var(--font-dm-mono)] text-4xl md:text-5xl text-[var(--accent)] tabular-nums">
            {year}
          </span>
          <span className="text-xs tracking-wider uppercase text-[var(--text-muted)]">Top 10 names</span>
        </div>
        <div className="flex items-center gap-2">
          {(['F', 'M'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              aria-pressed={gender === g}
              className={`text-xs tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                gender === g
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {g === 'F' ? 'Girls' : 'Boys'}
            </button>
          ))}
        </div>
      </div>

      {/* Bars. The container has a fixed height; each bar is absolutely
          positioned at rank * ROW so rank changes animate as a slide. */}
      <div className="relative" style={{ height: rows.length * ROW }} aria-live="polite">
        {rows.map(([name, count], rank) => (
          <div
            key={name}
            className="absolute left-0 right-0 flex items-center gap-3 transition-transform duration-500 ease-out motion-reduce:transition-none animate-[fade-in_0.4s_ease-out]"
            style={{ transform: `translateY(${rank * ROW}px)`, height: ROW - 6 }}
          >
            <span className="w-5 text-right font-[family-name:var(--font-dm-mono)] text-xs text-[var(--text-muted)]">
              {rank + 1}
            </span>
            <span className="w-24 sm:w-28 truncate text-sm text-[var(--text-primary)]">{name}</span>
            <div className="relative flex-1 h-full">
              <div
                className="absolute inset-y-0 left-0 rounded-r-[4px] bg-[var(--accent)]/80 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${Math.max((count / max) * 100, 2)}%` }}
              />
            </div>
            <span className="w-16 text-right font-[family-name:var(--font-dm-mono)] text-xs text-[var(--text-secondary)] tabular-nums">
              {count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-4 mt-6">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dim)] transition-colors"
        >
          {playing ? <Pause size={16} /> : year >= last ? <RotateCcw size={16} /> : <Play size={16} />}
        </button>
        <input
          type="range"
          min={first}
          max={last}
          value={year}
          onChange={(e) => {
            setPlaying(false)
            setYear(Number(e.target.value))
          }}
          aria-label="Year"
          className="flex-1 accent-[var(--accent)]"
        />
      </div>
      <div className="flex justify-between mt-1 pl-14 text-xs font-[family-name:var(--font-dm-mono)] text-[var(--text-muted)]">
        <span>{first}</span>
        <span>{last}</span>
      </div>
    </div>
  )
}
