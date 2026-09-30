'use client'

import { useState, useMemo } from 'react'
import { Github } from 'lucide-react'
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import { requireProject } from '@/data/projects'
import rawData from '@/data/baby-names.json'
import type { BabyNamesData, TopName } from '@/types/baby-names'

const data = rawData as BabyNamesData
const project = requireProject('/projects/baby-names')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

function decade(year: number): string {
  return `${Math.floor(year / 10) * 10}s`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2 text-xs">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {(p.value * 100).toFixed(3)}% of births
        </p>
      ))}
    </div>
  )
}

function NamePredictor() {
  const [query, setQuery] = useState('Jennifer')
  const [gender, setGender] = useState<'all' | 'M' | 'F'>('all')

  const matches = useMemo<TopName[]>(() => {
    const q = query.trim()
    if (!q) return []
    const normalized = q.charAt(0).toUpperCase() + q.slice(1).toLowerCase()
    return data.topNames.filter(
      (n) => n.name === normalized && (gender === 'all' || n.gender === gender)
    )
  }, [query, gender])

  const entry = matches[0] ?? null
  const notFound = query.trim().length > 1 && matches.length === 0

  return (
    <div>
      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a first name…"
          className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as 'all' | 'M' | 'F')}
          className="bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200"
        >
          <option value="all">All genders</option>
          <option value="F">Female</option>
          <option value="M">Male</option>
        </select>
      </div>

      {notFound && (
        <p className="text-sm text-[var(--text-muted)] italic mb-6">
          &ldquo;{query}&rdquo; isn&apos;t in the top 300 names. Either it&apos;s rare or spelled differently in SSA records.
        </p>
      )}

      {entry && (
        <div className="space-y-6">
          {/* Prediction callout */}
          <div className="border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <p className="section-label mb-4">Predicted birth decade</p>
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-4xl text-[var(--accent)]">
                  {decade(entry.predictedRange[1])}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">median</p>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                <p>80% of people named <strong>{entry.name}</strong> were born</p>
                <p>
                  between{' '}
                  <span className="metric text-[var(--accent)]">{entry.predictedRange[0]}</span>
                  {' '}and{' '}
                  <span className="metric text-[var(--accent)]">{entry.predictedRange[2]}</span>
                </p>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                <p>Peak popularity</p>
                <p>
                  <span className="metric text-[var(--accent)]">{entry.peakYear}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Popularity chart */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-4">
              {entry.name} ({entry.gender === 'F' ? 'Female' : 'Male'}): share of all US births
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={entry.yearlyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="nameGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickFormatter={(v) => String(v)}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine
                  x={entry.peakYear}
                  stroke="var(--accent)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="share"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#nameGrad)"
                  dot={false}
                  activeDot={{ r: 3, fill: 'var(--accent)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BabyNamesPage() {
  const [yearsRange] = useState(data.metadata.yearsRange)

  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-4xl">
      <PageViewTracker pagePath="/projects/baby-names" pageTitle="What Your Name Says About When You Were Born" />

      {/* ----------------------------------------------------------------- */}
      {/* HERO                                                               */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-20 animate-reveal">
        <span className="section-label">Data Analysis</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl mt-4 tracking-tight">
          What Your Name Says<br />
          <span className="text-[var(--accent)]">About When You Were Born</span>
        </h1>
        <div className="editorial-rule w-16 mt-6" />
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed mt-8 max-w-2xl">
          Your first name carries a timestamp. The US Social Security Administration
          has published baby name counts every year since 1910, over{' '}
          <span className="metric text-[var(--accent)]">
            {(data.metadata.totalBirths / 1_000_000).toFixed(0)}M
          </span>{' '}
          birth records across{' '}
          <span className="metric text-[var(--accent)]">
            {data.metadata.yearsRange[1] - data.metadata.yearsRange[0] + 1}
          </span>{' '}
          years. Certain names cluster around specific decades. Jennifer is
          almost certainly a Boomer or Gen X. Liam almost certainly isn&apos;t.
          The data tells the story.
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-6 mt-12 border-t border-[var(--border-subtle)] pt-8">
          {[
            { label: 'Years of data', value: `${yearsRange[0]}–${yearsRange[1]}` },
            { label: 'Unique names', value: data.metadata.totalNames.toLocaleString() },
            { label: 'Total births', value: `${(data.metadata.totalBirths / 1_000_000).toFixed(0)}M` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-[family-name:var(--font-dm-mono)] text-2xl text-[var(--accent)]">{value}</p>
              <p className="text-xs tracking-wider uppercase text-[var(--text-muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* PREDICTOR                                                          */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-20 animate-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Try It</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-4 tracking-tight">
          Name Predictor
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          Type any first name to see when people with that name were most likely born,
          how its popularity changed over time, and the decade you&apos;d predict for
          someone with that name today. Try{' '}
          <button
            className="text-[var(--accent)] underline underline-offset-2"
            onClick={() => {
              const input = document.querySelector('input[type="text"]') as HTMLInputElement
              if (input) { input.value = 'Jennifer'; input.dispatchEvent(new Event('input', { bubbles: true })) }
            }}
          >
            Jennifer
          </button>
          ,{' '}
          <button
            className="text-[var(--accent)] underline underline-offset-2"
            onClick={() => {
              const input = document.querySelector('input[type="text"]') as HTMLInputElement
              if (input) { input.value = 'Liam'; input.dispatchEvent(new Event('input', { bubbles: true })) }
            }}
          >
            Liam
          </button>
          , or your own name.
        </p>
        <NamePredictor />
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* COMEBACK NAMES                                                     */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-20 animate-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Trends</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          The Comeback Names
        </h2>
        <div className="space-y-6 mb-10">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Some names peaked generations ago, nearly vanished, and then came roaring back.
            To qualify, a name had to peak before <span className="metric text-[var(--accent)]">1950</span>,
            drop below <span className="metric text-[var(--accent)]">10%</span> of its original
            peak for at least 20 consecutive years, then recover to more than{' '}
            <span className="metric text-[var(--accent)]">50%</span> of its original peak after 2000.
            These are the vintage names that parents rediscovered.
          </p>
        </div>
        <div className="grid gap-px bg-[var(--border)]">
          {data.comebackNames.map((n) => (
            <div
              key={`${n.name}-${n.gender}`}
              className="bg-[var(--bg-surface)] px-6 py-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="font-[family-name:var(--font-playfair)] text-xl text-[var(--text-primary)]">
                  {n.name}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {n.gender === 'F' ? 'Female' : 'Male'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-[family-name:var(--font-dm-mono)]">
                <span className="text-[var(--accent)]">{n.originalPeakYear}</span>
                <span className="text-[var(--border)]">→</span>
                <span className="text-[var(--text-muted)]">{n.troughYear}</span>
                <span className="text-[var(--border)]">→</span>
                <span className="text-[var(--accent)]">{n.comebackYear}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Format: original peak → trough (near-extinction) → comeback
        </p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* UNISEX NAMES                                                       */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-20 animate-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Gender</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Names That Crossed Over
        </h2>
        <div className="space-y-6 mb-10">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Many names that feel firmly gendered today were once used for both. The charts
            below show the male/female split over time for names that have seen meaningful
            usage by both genders (at least{' '}
            <span className="metric text-[var(--accent)]">10%</span> each). Some crossed
            from predominantly male to predominantly female (or vice versa) within a single generation.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {data.unisexNames.slice(0, 6).map((n) => (
            <div key={n.name}>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-[family-name:var(--font-playfair)] text-lg">{n.name}</span>
                {n.crossoverYear && (
                  <span className="text-xs text-[var(--text-muted)]">
                    crossed over <span className="metric text-[var(--accent)]">{n.crossoverYear}</span>
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={n.yearlyData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`mGrad-${n.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id={`fGrad-${n.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--highlight)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--highlight)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => String(v)}
                    interval={Math.floor(n.yearlyData.length / 4)}
                  />
                  <YAxis hide domain={[0, 1]} />
                  <Tooltip
                    formatter={(v: number | undefined, name: string | undefined) => [
                      v !== undefined ? `${(v * 100).toFixed(0)}%` : '',
                      name === 'maleShare' ? 'Male' : 'Female',
                    ]}
                    labelFormatter={(l) => String(l)}
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      fontSize: 11,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="maleShare"
                    stroke="var(--accent)"
                    strokeWidth={1.5}
                    fill={`url(#mGrad-${n.name})`}
                    dot={false}
                    stackId="1"
                  />
                  <Area
                    type="monotone"
                    dataKey="femaleShare"
                    stroke="var(--highlight)"
                    strokeWidth={1.5}
                    fill={`url(#fGrad-${n.name})`}
                    dot={false}
                    stackId="1"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-[var(--accent)]">
                  <span className="w-3 h-0.5 bg-[var(--accent)] inline-block" /> Male
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[var(--highlight)]">
                  <span className="w-3 h-0.5 bg-[var(--highlight)] inline-block" /> Female
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* REGIONAL HIGHLIGHTS                                                */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-20 animate-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Regional</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Names That Belong to a Place
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          Some names are disproportionately concentrated in specific states. The ratio
          below compares a name&apos;s share of births in one state against its national
          average. A ratio of <span className="metric text-[var(--accent)]">10×</span>{' '}
          means the name is ten times more common there than anywhere else.
        </p>
        <div className="grid gap-px bg-[var(--border)]">
          <div className="bg-[var(--bg-elevated)] px-4 sm:px-6 py-3 grid grid-cols-4 gap-2 text-xs sm:tracking-wider uppercase text-[var(--text-muted)]">
            <span>Name</span>
            <span>State</span>
            <span className="text-right">State share</span>
            {/* Full word is too wide for a phone column, so phones get the short form */}
            <span className="text-right"><span className="sm:hidden">Overrep.</span><span className="hidden sm:inline">Overrepresentation</span></span>
          </div>
          {data.regionalHighlights.map((r, i) => (
            <div
              // Willie appears twice for Mississippi (once per gender), so name + state isn't unique
              key={`${r.name}-${r.state}-${i}`}
              className="bg-[var(--bg-surface)] px-4 sm:px-6 py-4 grid grid-cols-4 gap-2 items-center"
            >
              <span className="font-[family-name:var(--font-playfair)] text-base">{r.name}</span>
              <span className="text-sm text-[var(--text-secondary)]">
                {STATE_NAMES[r.state] ?? r.state}
              </span>
              <span className="text-right font-[family-name:var(--font-dm-mono)] text-sm text-[var(--text-secondary)]">
                {(r.stateShare * 100).toFixed(2)}%
              </span>
              <span className="text-right font-[family-name:var(--font-dm-mono)] text-sm text-[var(--accent)]">
                {r.ratio}×
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* METHODOLOGY & LIMITATIONS                                          */}
      {/* ----------------------------------------------------------------- */}
      <section className="mb-10 animate-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Methodology</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          How It Works
        </h2>
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            The predictor uses the SSA&apos;s historical name counts as a probability
            distribution over birth years. For a given name, the share of births
            in each year, normalized against total US births that year to remove
            population growth bias, forms the prior. The{' '}
            <span className="metric text-[var(--accent)]">p10</span>,{' '}
            <span className="metric text-[var(--accent)]">p50</span>, and{' '}
            <span className="metric text-[var(--accent)]">p90</span>{' '}
            percentiles of that distribution define the prediction range.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Common names that are concentrated in a single era (Jennifer, Brittany, Liam)
            produce tight, confident ranges. Names used continuously across decades
            (James, Mary, Elizabeth) produce wider ranges, which is honest: there
            genuinely is less information in those names.
          </p>
        </div>

        <div className="border-t border-[var(--border-subtle)] mt-12 pt-6">
          <p className="section-label mb-4">Data limitations</p>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              The SSA dataset only includes names with at least 5 occurrences per state per year, so
              rare names are systematically underrepresented or missing entirely.
            </li>
            <li>
              Gender is recorded as binary (M/F) based on SSA records at the time of registration.
            </li>
            <li>
              Pre-1937 data is incomplete: Social Security card issuance wasn&apos;t
              universal until then, so early records skew toward certain demographics.
            </li>
            <li>
              This is US-only data and doesn&apos;t capture naming patterns among
              US residents born abroad or immigrant naming traditions.
            </li>
          </ul>
        </div>

        {/* Tools + GitHub */}
        <div className="border-t border-[var(--border-subtle)] mt-10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="section-label">Tools Used</span>
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="font-[family-name:var(--font-dm-mono)] text-xs px-3 py-1 rounded border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]"
              >
                {tool}
              </span>
            ))}
          </div>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300"
          >
            <Github size={14} aria-hidden="true" />
            View on GitHub
          </a>
        </div>
      </section>
    </div>
  )
}
