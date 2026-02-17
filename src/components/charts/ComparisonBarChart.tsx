'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ComparisonBarChartProps {
  data: { label: string; brown: number; tatum: number }[]
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
  formatValue,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
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
          {entry.name}: {formatValue(entry.value)}
        </p>
      ))}
    </div>
  )
}

export default function ComparisonBarChart({
  data,
  formatValue = (v) => v.toFixed(1),
}: ComparisonBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e6ea" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: '#7a808c' }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12, fill: '#7a808c' }} tickLine={false} />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} />}
        />
        <Legend
          formatter={(value: string) =>
            value === 'brown' ? 'Jaylen Brown' : 'Jayson Tatum'
          }
        />
        <Bar
          dataKey="brown"
          name="brown"
          fill={BROWN_COLOR}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="tatum"
          name="tatum"
          fill={TATUM_COLOR}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
