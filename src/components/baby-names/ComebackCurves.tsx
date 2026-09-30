'use client'

import { useState } from 'react'
import type { ComebackName } from '@/types/baby-names'

// ---------------------------------------------------------------------------
// Comeback Curves
// Small multiples: one tiny line chart per comeback name, showing the U-shape
// (popular, near-extinct, back again). Each chart has its own vertical scale,
// because the point is the shape, not comparing sizes between names.
// Hover (or tap) a chart to read the exact year and share.
// ---------------------------------------------------------------------------

const W = 240
const H = 64
const PAD = 4

function Sparkline({ n }: { n: ComebackName }) {
  const [hover, setHover] = useState<[number, number] | null>(null)
  const pts = n.yearlyData
  const y0 = pts[0][0]
  const y1 = pts[pts.length - 1][0]
  const max = Math.max(...pts.map((p) => p[1]))
  const x = (year: number) => PAD + ((year - y0) / (y1 - y0)) * (W - PAD * 2)
  const y = (share: number) => H - PAD - (share / max) * (H - PAD * 2)
  const path = pts.map(([yr, s], i) => `${i ? 'L' : 'M'}${x(yr).toFixed(1)},${y(s).toFixed(1)}`).join(' ')
  const at = (yr: number) => pts.find((p) => p[0] === yr)

  // The three moments that define a comeback
  const marks = [
    { yr: n.originalPeakYear, label: 'Peak', strong: true },
    { yr: n.troughYear, label: 'Low', strong: false },
    { yr: n.comebackYear, label: 'Back', strong: true },
  ]

  // Convert the pointer's x position into a year
  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    const yr = Math.round(y0 + ((e.clientX - r.left) / r.width) * (y1 - y0))
    const p = at(Math.min(Math.max(yr, y0), y1))
    if (p) setHover(p)
  }

  return (
    <div className="bg-[var(--bg-surface)] p-4">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-[family-name:var(--font-playfair)] text-lg text-[var(--text-primary)]">{n.name}</span>
        <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[var(--text-muted)] h-4">
          {hover ? `${hover[0]}: ${(hover[1] * 100).toFixed(3)}%` : n.gender === 'F' ? 'Female' : 'Male'}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto touch-none cursor-crosshair"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${n.name}: peaked in ${n.originalPeakYear}, low point ${n.troughYear}, back by ${n.comebackYear}`}
      >
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {marks.map((m) => {
          const p = at(m.yr)
          if (!p) return null
          return (
            <circle
              key={m.label}
              cx={x(p[0])}
              cy={y(p[1])}
              r={3.5}
              fill={m.strong ? 'var(--accent)' : 'var(--bg-surface)'}
              stroke={m.strong ? 'var(--bg-surface)' : 'var(--text-muted)'}
              strokeWidth={1.5}
            />
          )
        })}
        {hover && <line x1={x(hover[0])} x2={x(hover[0])} y1={0} y2={H} stroke="var(--text-muted)" strokeWidth={1} vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="flex justify-between mt-2 font-[family-name:var(--font-dm-mono)] text-[11px]">
        <span className="text-[var(--accent)]">{n.originalPeakYear}</span>
        <span className="text-[var(--text-muted)]">low {n.troughYear}</span>
        <span className="text-[var(--accent)]">back {n.comebackYear}</span>
      </div>
    </div>
  )
}

export default function ComebackCurves({ names }: { names: ComebackName[] }) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)] border border-[var(--border)]">
        {names.map((n) => (
          <Sparkline key={`${n.name}-${n.gender}`} n={n} />
        ))}
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-4">
        Share of US births, 1910 to 2024. Filled dots: original peak and comeback year. Hollow dot: low
        point. Each chart uses its own scale so the shape is easy to see.
      </p>
    </div>
  )
}
