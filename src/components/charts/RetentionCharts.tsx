'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Scatter,
  ErrorBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { Fragment, useState } from 'react'
import { CHART, heatColor, HEAT_GRADIENT } from '@/lib/chartTheme'

// Single-series charts use the site accent; grid, axes and text stay neutral.
const ACCENT = CHART.accent
const GRID = CHART.grid
const MUTED = CHART.muted

const axisTick = { fontSize: 12, fill: MUTED }

function TooltipBox({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2 text-xs">
      <p className="text-[var(--text-muted)] mb-1">{title}</p>
      {lines.map((line) => (
        <p key={line} className="font-[family-name:var(--font-dm-mono)] text-[var(--text-primary)]">
          {line}
        </p>
      ))}
    </div>
  )
}

// Collapsible table so every chart's numbers are readable without the chart
export function DataTable({
  columns,
  rows,
}: {
  columns: string[]
  rows: (string | number)[][]
}) {
  return (
    <details className="mt-4 text-xs text-[var(--text-muted)]">
      <summary className="cursor-pointer select-none">View data</summary>
      {/* Wide tables (like the 14-column heatmap data) scroll inside this box instead of the page */}
      <div className="overflow-x-auto">
      <table className="mt-3 w-full font-[family-name:var(--font-dm-mono)] whitespace-nowrap">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} className="text-left font-normal pb-2 pr-4">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[var(--border-subtle)]">
              {r.map((cell, j) => (
                <td key={j} className="py-1 pr-4 text-[var(--text-secondary)]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </details>
  )
}

// ---------------------------------------------------------------------------
// 1. Retention curve: % of customers ordering in each month after their first
// ---------------------------------------------------------------------------
type CurvePoint = { month: number; retention: number; customers: number }

export function RetentionCurveChart({ data }: { data: CurvePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="month"
          tick={axisTick}
          tickLine={false}
          ticks={[1, 6, 12, 18, 24]}
          label={{ value: 'Months since first order', position: 'insideBottom', offset: -10, fontSize: 12, fill: MUTED }}
        />
        <YAxis
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          domain={[0, 3]}
          tickFormatter={(v: number) => `${v}%`}
          width={48}
        />
        <Tooltip
          cursor={{ stroke: MUTED, strokeDasharray: '3 3' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as CurvePoint
            return (
              <TooltipBox
                title={`Month ${p.month}`}
                lines={[`${p.retention.toFixed(2)}% ordered`, `${p.customers.toLocaleString()} customers observed`]}
              />
            )
          }}
        />
        <Line
          type="monotone"
          dataKey="retention"
          stroke={ACCENT}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, stroke: CHART.surface, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// 2. 90-day repeat rate by acquisition channel, with 95% confidence intervals
// ---------------------------------------------------------------------------
type ChannelPoint = { channel: string; customers: number; rate: number; low: number; high: number }

export function ChannelRepeatChart({ data, overall }: { data: ChannelPoint[]; overall: number }) {
  // ErrorBar needs the distance from the point to each end of the interval
  const rows = data.map((d) => ({ ...d, err: [d.rate - d.low, d.high - d.rate] }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        layout="vertical"
        data={rows}
        margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
      >
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis
          type="number"
          domain={[4, 8]}
          ticks={[4, 5, 6, 7, 8]}
          tick={axisTick}
          tickLine={false}
          tickFormatter={(v: number) => `${v}%`}
          label={{ value: 'Reordered within 90 days (95% confidence interval)', position: 'insideBottom', offset: -10, fontSize: 12, fill: MUTED }}
        />
        <YAxis type="category" dataKey="channel" tick={axisTick} tickLine={false} axisLine={false} width={80} />
        <ReferenceLine x={overall} stroke={MUTED} strokeDasharray="4 4" />
        <Tooltip
          cursor={{ fill: CHART.cursorFill }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as ChannelPoint
            return (
              <TooltipBox
                title={p.channel}
                lines={[
                  `${p.rate.toFixed(1)}% reordered`,
                  `95% CI: ${p.low.toFixed(1)}% to ${p.high.toFixed(1)}%`,
                  `${p.customers.toLocaleString()} customers`,
                ]}
              />
            )
          }}
        />
        <Scatter dataKey="rate" fill={ACCENT} shape="circle">
          <ErrorBar dataKey="err" direction="x" width={6} stroke={ACCENT} strokeWidth={2} />
        </Scatter>
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// 3. Month-1 retention by the year customers first ordered
// ---------------------------------------------------------------------------
type YearPoint = { year: string; retention: number; customers: number }

export function Month1ByYearChart({ data }: { data: YearPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }} barCategoryGap="30%">
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="year"
          tick={axisTick}
          tickLine={false}
          tickFormatter={(v: string) => v.replace(' (Jan-Jul)', '*')}
        />
        <YAxis
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}%`}
          width={48}
        />
        <Tooltip
          cursor={{ fill: CHART.cursorFill }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as YearPoint
            return (
              <TooltipBox
                title={`First ordered in ${p.year}`}
                lines={[`${p.retention.toFixed(2)}% ordered again the next month`, `${p.customers.toLocaleString()} customers`]}
              />
            )
          }}
        />
        <Bar dataKey="retention" fill={ACCENT} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Cohort heatmap
// Rows = customers grouped by the quarter of their first order.
// Columns = months since that first order. Cell color = share who ordered again.
// Built as a CSS grid of divs (Recharts has no heatmap type). Phones show the
// first 6 months so cells stay tappable; the data table has all 12.
// ---------------------------------------------------------------------------

type HeatRow = { quarter: string; customers: number; rates: (number | null)[] }

const HEAT_MAX = 6 // % at which the color tops out
const LABEL_FROM = 3 // only label cells at or above this, to keep it readable

export function CohortHeatmap({ rows }: { rows: HeatRow[] }) {
  // Which cell is hovered/tapped, shown in the readout above the grid
  const [active, setActive] = useState<{ row: HeatRow; month: number } | null>(null)
  const months = rows[0]?.rates.length ?? 12

  return (
    <div className="mt-2">
      {/* Readout: replaces a floating tooltip so it works the same on touch screens */}
      <p className="text-xs text-[var(--text-muted)] min-h-8 sm:min-h-5 mb-2 font-[family-name:var(--font-dm-mono)]" aria-live="polite">
        {active
          ? `${active.row.quarter} customers · month ${active.month}: ${active.row.rates[active.month - 1]}% ordered again (${active.row.customers.toLocaleString()} customers)`
          : 'Hover or tap a cell for its value'}
      </p>

      <div className="grid grid-cols-[56px_repeat(6,minmax(0,1fr))] sm:grid-cols-[64px_repeat(12,minmax(0,1fr))_64px] gap-[2px] text-[11px]">
        {/* Column headers */}
        <span />
        {Array.from({ length: months }, (_, m) => (
          <span
            key={m}
            className={`text-center text-[var(--text-muted)] font-[family-name:var(--font-dm-mono)] pb-1 ${m >= 6 ? 'hidden sm:block' : ''}`}
          >
            {m + 1}
          </span>
        ))}
        <span className="hidden sm:block text-right text-[var(--text-muted)] pb-1">customers</span>

        {rows.map((row) => (
          <Fragment key={row.quarter}>
            <span
              className={`font-[family-name:var(--font-dm-mono)] self-center ${
                row.quarter.endsWith('Q1') ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {row.quarter}
            </span>
            {row.rates.map((v, m) => {
              const hidden = m >= 6 ? 'hidden sm:flex' : 'flex'
              if (v === null) return <span key={m} className={m >= 6 ? 'hidden sm:block' : ''} />
              const isActive = active?.row.quarter === row.quarter && active.month === m + 1
              return (
                <button
                  key={m}
                  type="button"
                  aria-label={`${row.quarter}, month ${m + 1}: ${v}%`}
                  onMouseEnter={() => setActive({ row, month: m + 1 })}
                  onFocus={() => setActive({ row, month: m + 1 })}
                  onClick={() => setActive({ row, month: m + 1 })}
                  onMouseLeave={() => setActive(null)}
                  className={`${hidden} h-5 items-center justify-center rounded-[3px] font-[family-name:var(--font-dm-mono)] outline-none ${
                    isActive ? 'ring-2 ring-[var(--text-primary)]' : ''
                  }`}
                  style={{
                    background: heatColor(v, HEAT_MAX),
                    // dark text on the light end of the ramp, light text on the dark end
                    color: v >= 4.5 ? 'var(--bg)' : 'var(--text-primary)',
                  }}
                >
                  {v >= LABEL_FROM ? v.toFixed(1) : ''}
                </button>
              )
            })}
            <span className="hidden sm:block self-center text-right text-[var(--text-muted)] font-[family-name:var(--font-dm-mono)]">
              {row.customers.toLocaleString()}
            </span>
          </Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-dm-mono)]">0%</span>
          <span className="block h-2.5 w-32 rounded-sm" style={{ background: HEAT_GRADIENT }} />
          <span className="font-[family-name:var(--font-dm-mono)]">{HEAT_MAX}%+</span>
        </div>
        <span>Months since first order across the top. Blank cells: not enough time has passed yet.</span>
      </div>
    </div>
  )
}
