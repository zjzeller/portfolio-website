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

// Single-series charts use the site accent; grid, axes and text stay neutral.
const ACCENT = '#1e3a5f'
const GRID = '#e4e6ea'
const MUTED = '#7a808c'

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
      <table className="mt-3 w-full font-[family-name:var(--font-dm-mono)]">
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
          activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
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
          cursor={{ fill: 'rgba(30, 58, 95, 0.06)' }}
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
          cursor={{ fill: 'rgba(30, 58, 95, 0.06)' }}
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
