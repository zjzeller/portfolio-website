import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageViewTracker from '@/components/analytics/PageViewTracker'

const projects = [
  {
    href: '/projects/brown-vs-tatum',
    title: 'The Case for Jaylen Brown',
    description:
      'A statistical deep-dive comparing Jaylen Brown and Jayson Tatum across scoring, clutch performance, and advanced metrics.',
    tags: ['NBA', 'Python', 'Data Visualization'],
  },
]

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-4xl">
      <PageViewTracker pagePath="/projects" pageTitle="Projects" />

      {/* Header */}
      <div className="mb-16 animate-reveal">
        <span className="section-label">Projects</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl mt-4 tracking-tight">
          Data Analysis &<br />
          <span className="text-[var(--accent)]">Case Studies</span>
        </h1>
        <div className="editorial-rule w-16 mt-6" />
      </div>

      {/* Intro */}
      <div className="mb-20 animate-reveal-delay-1">
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Showcasing analytical skills through hands-on data projects. Each case study
          walks through the full process&mdash;from data collection and cleaning to
          analysis and visualization&mdash;to uncover meaningful insights.
        </p>
      </div>

      {/* Project cards */}
      <div className="animate-reveal-delay-2">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">All Projects</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <div className="grid gap-px bg-[var(--border)]">
          {projects.map((project) => (
            <Link
              key={project.href}
              href={project.href}
              className="group bg-[var(--bg-surface)] p-8 md:p-10 flex flex-col justify-between min-h-[220px] transition-colors duration-300 hover:bg-[var(--bg-elevated)]"
            >
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-lg">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs tracking-wider uppercase px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--accent)]/30 group-hover:text-[var(--accent)] transition-colors duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-6 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all duration-300">
                <span className="text-xs tracking-wider uppercase">View Project</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
