'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface PlayerRadarChartProps {
  data: { category: string; brown: number; tatum: number; fullMark: number }[]
}

interface TooltipPayloadEntry {
  name: string
  value: number
  payload: { category: string }
}

const BROWN_COLOR = '#1e3a5f'
const TATUM_COLOR = '#007A33'

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) => {
  if (!active || !payload || payload.length < 2) return null

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d4d7dd',
        padding: '8px 12px',
        borderRadius: '4px',
      }}
    >
      <p style={{ margin: '0 0 6px 0', fontWeight: 600, fontSize: '13px' }}>
        {payload[0].payload.category}
      </p>
      <p
        style={{
          margin: '2px 0',
          color: BROWN_COLOR,
          fontFamily: "'DM Mono', monospace",
          fontSize: '12px',
        }}
      >
        Jaylen Brown: {payload[0].value}
      </p>
      <p
        style={{
          margin: '2px 0',
          color: TATUM_COLOR,
          fontFamily: "'DM Mono', monospace",
          fontSize: '12px',
        }}
      >
        Jayson Tatum: {payload[1].value}
      </p>
    </div>
  )
}

export default function PlayerRadarChart({ data }: PlayerRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="#e4e6ea" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 12, fill: '#7a808c' }}
        />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <Radar
          name="Jaylen Brown"
          dataKey="brown"
          stroke={BROWN_COLOR}
          fill={BROWN_COLOR}
          fillOpacity={0.25}
        />
        <Radar
          name="Jayson Tatum"
          dataKey="tatum"
          stroke={TATUM_COLOR}
          fill={TATUM_COLOR}
          fillOpacity={0.25}
        />
        <Legend />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
