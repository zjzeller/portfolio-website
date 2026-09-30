import { heatColor } from '@/lib/chartTheme'

type HeatRow = { quarter: string; customers: number; rates: (number | null)[] }

// Small, decorative version of the cohort heatmap for the homepage card.
// No labels or hover: it's a preview, and the whole card links to the full,
// interactive chart on the case study page. Same color ramp as the full chart.
// Server component (no 'use client'), so it adds no JavaScript to the page.
export default function CohortHeatmapMini({ rows, max = 6 }: { rows: HeatRow[]; max?: number }) {
  const months = rows[0]?.rates.length ?? 12
  return (
    <div
      role="img"
      aria-label="Cohort retention heatmap preview: rows brighten toward recent quarters, meaning newer customers reorder more often"
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${months}, minmax(0, 1fr))` }}
    >
      {rows.flatMap((row) =>
        row.rates.map((v, m) => (
          <span
            key={`${row.quarter}-${m}`}
            className="block h-[5px] md:h-[6px] rounded-[1px]"
            // Months a cohort hasn't reached yet stay empty, like the full chart
            style={{ background: v === null ? 'transparent' : heatColor(v, max) }}
          />
        ))
      )}
    </div>
  )
}
