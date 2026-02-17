'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface SeasonLineChartProps {
  data: { year: string; brown: number | null; tatum: number | null }[]
  statLabel: string
  formatValue?: (value: number) => string
}

const BROWN_COLOR = '#1e3a5f'
const TATUM_COLOR = '#007A33'

interface TooltipPayloadEntry {
  name: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
  statLabel,
  formatValue,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
  statLabel: string
  formatValue: (value: number) => string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d4d7dd',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
      }}
    >
      <p style={{ margin: 0, marginBottom: 4, color: '#7a808c', fontSize: 12 }}>
        {label}
      </p>
      {payload.map((entry: TooltipPayloadEntry, index: number) => (
        <p
          key={index}
          style={{
            margin: 0,
            color: entry.color,
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
          }}
        >
          {entry.name}: {formatValue(entry.value)} {statLabel}
        </p>
      ))}
    </div>
  )
}

export default function SeasonLineChart({
  data,
  statLabel,
  formatValue = (v) => v.toFixed(1),
}: SeasonLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e6ea" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: '#7a808c' }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12, fill: '#7a808c' }} tickLine={false} />
        <Tooltip
          content={
            <CustomTooltip statLabel={statLabel} formatValue={formatValue} />
          }
        />
        <Legend
          formatter={(value: string) =>
            value === 'brown' ? 'Jaylen Brown' : 'Jayson Tatum'
          }
        />
        <Line
          type="monotone"
          dataKey="brown"
          name="brown"
          stroke={BROWN_COLOR}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="tatum"
          name="tatum"
          stroke={TATUM_COLOR}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
