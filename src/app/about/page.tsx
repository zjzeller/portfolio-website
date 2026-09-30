import { pageMetadata } from '@/lib/metadata'
import PageViewTracker from '@/components/analytics/PageViewTracker'

export const metadata = pageMetadata(
  'About',
  'Background, skills and approach: strategy and FP&A analytics, BigQuery data modeling, dbt and Tableau.',
)


const skills = {
  'Data & Analytics': [
    'SQL (CTEs, window functions, 10M+ row datasets)',
    'BigQuery data sources and data modeling',
    'dbt (Analytics Engineering certification in progress)',
    'Python (ETL automation, scikit-learn)',
    'Tableau (executive dashboards)',
  ],
  'Strategy & Business': [
    'Executive and monthly business review reporting',
    'Forecasting and plan-vs-actual analysis',
    'Excel financial modeling',
    'Data quality and governance',
    'Salesforce, Claude and Claude Code',
  ],
}

// How I work, stated as practices rather than adjectives
const approach = [
  'Start from the decision, then find the data that informs it',
  'Build the data foundation once, as governed and tested tables, instead of rebuilding it in every report',
  'Automate recurring work so the time goes to analysis',
  'Explain results in plain language, with the caveats included',
  'Train and mentor analysts: I have onboarded 4 new analysts and mentor 8 more',
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-4xl">
      <PageViewTracker pagePath="/about" pageTitle="About" />

      {/* Header */}
      <div className="mb-16 animate-reveal">
        <span className="section-label">About</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl mt-4 tracking-tight">
          Background &<br />
          <span className="text-[var(--accent)]">Expertise</span>
        </h1>
        <div className="editorial-rule w-16 mt-6" />
      </div>

      {/* Bio */}
      <div className="space-y-6 mb-20 animate-reveal-delay-1">
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          I&apos;m a Senior Data Analyst on a Strategy and FP&amp;A team with 4+ years of turning messy,
          multi-system data into decisions. I own the reporting behind the monthly business review for
          the CEO, CFO and Chief Strategy Officer.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Most of my work sits between the warehouse and the decision. I&apos;ve built about ten governed
          BigQuery data sources that serve as the source of truth for travel, credit card and headcount
          reporting, traced data quality problems to their root causes, and automated 8 key reports to
          save <span className="metric text-[var(--accent)]">$120K</span> a year. I&apos;m now modeling
          with dbt and working toward the dbt Analytics Engineering certification.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          I hold a Master&apos;s in Applied Economics from the University of San Francisco and a
          Bachelor&apos;s in Economics from Santa Clara University. The economics shows up in how I
          frame analysis: start with the decision, then measure what informs it.
        </p>
      </div>

      {/* Skills */}
      <div className="mb-20 animate-reveal-delay-2">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Skills</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--accent)] mb-6">{category}</h3>
              <ul className="space-y-3">
                {items.map((skill) => (
                  <li key={skill} className="flex items-start gap-3 group">
                    <span className="mt-2 w-1.5 h-1.5 bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors duration-300 shrink-0" />
                    <span className="text-[var(--text-secondary)] text-sm leading-relaxed">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Approach */}
      <div className="animate-reveal-delay-3">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Approach</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <div className="border-l border-[var(--accent)]/30 pl-6 space-y-4">
          {approach.map((item) => (
            <p key={item} className="text-[var(--text-secondary)] text-sm leading-relaxed">
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
