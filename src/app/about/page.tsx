import PageViewTracker from '@/components/analytics/PageViewTracker'

const skills = {
  'Data & Analytics': [
    'SQL (CTEs, Window Functions, 10M+ Rows)',
    'Python (Automation, ETL, scikit-learn)',
    'Tableau (Dashboard Development)',
    'BigQuery & Data Warehousing',
    'Claude AI & Workflow Optimization',
  ],
  'Business & Systems': [
    'Salesforce & ConnectSuite CRM',
    'Data Visualization & Storytelling',
    'Revenue Analytics & GTM Metrics',
    'Cross-Functional Collaboration',
    'Process Automation & Optimization',
  ],
}

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
          I&apos;m a results-driven Senior Data Analyst with 4+ years of experience building GTM reporting
          infrastructure, investigating data quality issues, and delivering actionable insights to
          executive leadership at AAA - Mountain West Group.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          My expertise includes automating ETL processes, maintaining cross-system data integrity,
          and leveraging AI tools like Claude to accelerate analytical workflows. I&apos;ve delivered
          significant business impact, including $120K in annual cost savings through automation and
          identifying revenue-generating opportunities worth thousands in monthly revenue.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          With a Master&apos;s degree in Applied Economics from the University of San Francisco and a
          Bachelor&apos;s in Economics from Santa Clara University, I bring both technical skills and
          business acumen to translate complex data into clear, strategic recommendations.
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
          {[
            'Leveraging AI tools like Claude to accelerate workflows and improve code quality',
            'Automating repetitive processes to free up time for strategic analysis',
            'Data visualization and storytelling to make insights accessible to all stakeholders',
            'Mentoring junior analysts and fostering team growth through knowledge sharing',
            'Solving complex business problems with data-driven recommendations',
          ].map((item) => (
            <p key={item} className="text-[var(--text-secondary)] text-sm leading-relaxed">
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
