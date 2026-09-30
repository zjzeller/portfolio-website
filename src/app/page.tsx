import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ArrowRight, FileText, Mail } from 'lucide-react'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import { requireProject } from '@/data/projects'
import CohortHeatmapMini from '@/components/charts/CohortHeatmapMini'
import retention from '@/data/customer-retention.json'

// Lead project gets the wide card; the others sit beside it
const featured = requireProject('/projects/customer-retention')
const supporting = ['/projects/brown-vs-tatum', '/projects/baby-names'].map(requireProject)

// What I do day to day. Tells a recruiter which roles I fit at a glance.
const focusAreas = [
  { title: 'Executive Reporting', desc: 'Monthly business review reporting for the CEO, CFO and Chief Strategy Officer' },
  { title: 'Data Modeling', desc: 'Governed BigQuery sources and tested dbt models that serve as the source of truth' },
  { title: 'Automation', desc: 'Python and SQL pipelines that replace recurring manual work' },
  { title: 'Strategy & FP&A', desc: 'Forecasting, plan vs. actual, and sales compensation analysis' },
]

const delayClasses = [
  'animate-reveal-delay-1',
  'animate-reveal-delay-2',
  'animate-reveal-delay-3',
  'animate-reveal-delay-4',
]

const cards = [
  {
    href: '/about',
    label: '01',
    title: 'About',
    desc: 'Background, skills, and approach to data analytics',
  },
  {
    href: '/projects',
    label: '02',
    title: 'Projects',
    desc: 'Data analysis and visualization case studies',
  },
  {
    href: '/resume',
    label: '03',
    title: 'Resume',
    desc: 'Full professional experience and qualifications',
  },
  {
    href: '/contact',
    label: '04',
    title: 'Contact',
    desc: 'Get in touch for opportunities and collaborations',
  },
]

export default function HomePage() {
  return (
    <>
      <PageViewTracker pagePath="/" pageTitle="Home" />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)]" />
        {/* Accent glow */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[var(--highlight)]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-32 w-72 h-72 bg-[var(--accent)]/5 rounded-full blur-[100px]" />

        <div className="relative container mx-auto px-6 md:px-8">
          <div className="max-w-3xl">
            <p className="section-label animate-reveal mb-6">Senior Data Analyst &middot; <span className="whitespace-nowrap">Strategy &amp; FP&amp;A</span>
              {/* Location drops on phones so the label fits on one line */}
              <span className="hidden sm:inline"> &middot; Berkeley, CA</span></p>

            <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[0.95] tracking-tight animate-reveal-delay-1">
              Zachary
              <br />
              <span className="text-[var(--accent)]">Zeller</span>
            </h1>

            <div className="editorial-rule w-24 my-8 animate-reveal-delay-2" />

            <p className="text-[var(--text-secondary)] text-lg md:text-xl max-w-lg leading-relaxed animate-reveal-delay-2">
              I turn messy, multi-system data into decisions executives act on. SQL, BigQuery and dbt
              underneath, strategy on top.
            </p>

            <div className="flex gap-4 mt-10 animate-reveal-delay-3">
              <Link href="/resume">
                <Button size="lg" className="gap-2">
                  Resume <FileText size={16} />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="gap-2">
                  Contact <Mail size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Focus areas strip: full-width surface band, same as the old stats strip.
          Only the inner grid gets the divider color; its 1px gaps draw the lines
          between cells at every breakpoint (1, 2 or 4 columns), while the band
          outside the container stays the surface color on wide screens. */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border-subtle)]">
            {focusAreas.map((area, i) => (
              <div key={area.title} className={`bg-[var(--bg-surface)] py-8 px-6 md:px-8 ${delayClasses[i]}`}>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--accent)] mb-2">
                  {area.title}
                </h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured work */}
      <section className="container mx-auto px-6 md:px-8 pt-20 md:pt-28">
        <div className="flex items-center gap-4 mb-12 animate-reveal">
          <span className="section-label">Featured Work</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-[var(--border)] animate-reveal-delay-1">
          <Link
            href={featured.href}
            className="group md:col-span-2 md:row-span-2 bg-[var(--bg-surface)] p-8 md:p-10 flex flex-col justify-between min-h-[260px] transition-colors duration-300 hover:bg-[var(--bg-elevated)]"
          >
            <div>
              <span className="metric text-xs text-[var(--accent)]">Case study</span>
              <h3 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl mt-3 mb-4 group-hover:text-[var(--accent)] transition-colors duration-300">
                {featured.title}
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed max-w-xl">{featured.description}</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {featured.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--accent)]/30 group-hover:text-[var(--accent)] transition-colors duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {/* Mini heatmap fills the card and previews the case study's lead chart */}
            <div className="mt-10">
              <CohortHeatmapMini rows={retention.cohortHeatmap.rows} />
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                <span className="metric text-[var(--accent)]">{retention.metadata.repeat90d}%</span> of customers
                reorder within 90 days. Each row is a quarterly cohort; brighter means more came back.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-8 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all duration-300">
              <span className="text-xs tracking-wider uppercase">Read the case study</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>

          {supporting.map((project) => (
            <Link
              key={project.href}
              href={project.href}
              className="group bg-[var(--bg-surface)] p-8 flex flex-col justify-between min-h-[200px] transition-colors duration-300 hover:bg-[var(--bg-elevated)]"
            >
              <div>
                <span className="metric text-xs text-[var(--text-muted)]">{project.tags.slice(0, 2).join(' · ')}</span>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl mt-3 mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{project.description}</p>
              </div>
              <div className="flex items-center gap-2 mt-6 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all duration-300">
                <span className="text-xs tracking-wider uppercase">View</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Navigation cards */}
      <section className="container mx-auto px-6 md:px-8 py-20 md:py-28">
        <div className="flex items-center gap-4 mb-12 animate-reveal">
          <span className="section-label">Explore</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <div className="grid md:grid-cols-4 gap-px bg-[var(--border)]">
          {cards.map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group bg-[var(--bg-surface)] p-8 md:p-10 flex flex-col justify-between min-h-[220px] transition-colors duration-300 hover:bg-[var(--bg-elevated)] ${delayClasses[i]}`}
            >
              <div>
                <span className="metric text-xs text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors duration-300">
                  {card.label}
                </span>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mt-3 mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {card.desc}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-6 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all duration-300">
                <span className="text-xs tracking-wider uppercase">View</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
