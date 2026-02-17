'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface PlayerRadarChartProps {
  data: { category: string; brown: number; tatum: number; fullMark: number }[]
}

const BROWN_COLOR = '#1e3a5f'
const TATUM_COLOR = '#007A33'

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
      </RadarChart>
    </ResponsiveContainer>
  )
}
