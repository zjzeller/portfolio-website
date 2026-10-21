import { pageMetadata } from '@/lib/metadata'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import { ExternalLink } from 'lucide-react'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import { ResumeDownloadButton, ResumeViewTracker } from '@/components/analytics/ResumeTracker'

export const metadata = pageMetadata(
  'Resume',
  'Experience, education and skills of Zachary Zeller, Senior Data Analyst.',
)


export default function ResumePage() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-5xl">
      <PageViewTracker pagePath="/resume" pageTitle="Resume" />
      <ResumeViewTracker />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-reveal">
        <div>
          <span className="section-label">Resume</span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl mt-4 tracking-tight">
            Experience &<br />
            <span className="text-[var(--accent)]">Qualifications</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <ResumeDownloadButton />
          <a
            href="/assets/resume/zachary-zeller-resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink size={14} /> Open
            </Button>
          </a>
        </div>
      </div>

      <div className="editorial-rule w-16 mb-12 animate-reveal-delay-1" />

      {/* Resume preview: an image of page 1 that opens the PDF. Embedded PDFs
          (iframes) are blank or cut off on most phones, an image works everywhere. */}
      <a
        href="/assets/resume/zachary-zeller-resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="group block border border-[var(--border)] overflow-hidden bg-white animate-reveal-delay-1 transition-colors duration-300 hover:border-[var(--accent)]/60"
        aria-label="Open the resume PDF"
      >
        <Image
          src="/assets/resume/resume-preview.webp"
          alt="Zachary Zeller resume, page 1"
          width={1400}
          height={1812}
          sizes="(min-width: 1024px) 960px, 100vw"
          className="w-full h-auto"
          priority
        />
      </a>
      <p className="text-xs text-[var(--text-muted)] mt-3">Click the preview to open the full PDF.</p>

      {/* Text version for SEO */}
      <div className="mt-20 animate-reveal-delay-2">
        <div className="flex items-center gap-4 mb-10">
          <span className="section-label">Overview</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <div className="grid md:grid-cols-[1fr_1px_1fr] gap-8 md:gap-12">
          {/* Left column */}
          <div className="space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl mb-2">Zachary Zeller</h2>
              <p className="text-sm text-[var(--text-muted)]">Senior Data Analyst | Berkeley, CA</p>
            </div>

            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--accent)] mb-4">Summary</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Senior Data Analyst with 4+ years, most recently on a Strategy and FP&amp;A team, turning messy,
                multi-system data into decisions for the CEO, CFO, and business leaders. Built the reporting and data
                foundation for a relaunched travel business, launched a cross-functional data quality project,
                and helped redesign sales compensation. Strongest where analytics meets strategy, operations,
                and product, with AI tools built into daily work.
              </p>
            </div>

            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--accent)] mb-4">Most Recent Role</h3>
              <p className="text-sm text-[var(--text-primary)]">Senior Data Analyst: Strategy</p>
              <p className="text-sm text-[var(--text-muted)]">AAA - Mountain West Group</p>
              <p className="metric text-xs text-[var(--text-muted)] mt-1">May 2025 &ndash; Oct 2026</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block bg-[var(--border-subtle)]" />

          {/* Right column */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--accent)] mb-4">Contact</h3>
              <div className="space-y-2 text-sm">
                <p className="text-[var(--text-secondary)]">zjzeller@gmail.com</p>
                <p className="text-[var(--text-secondary)]">(707) 815-5241</p>
                <p className="text-[var(--text-muted)]">github.com/zjzeller</p>
                <p className="text-[var(--text-muted)]">linkedin.com/in/zzeller</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--accent)] mb-4">Education</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--text-primary)]">MS Applied Economics</p>
                  <p className="text-sm text-[var(--text-muted)]">University of San Francisco</p>
                  <p className="metric text-xs text-[var(--text-muted)]">Dec 2021</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-primary)]">BS Economics</p>
                  <p className="text-sm text-[var(--text-muted)]">Santa Clara University</p>
                  <p className="metric text-xs text-[var(--text-muted)]">Jun 2018</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--accent)] mb-4">Core Skills</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                SQL, Python, BigQuery, dbt, Tableau, Data Modeling, Data Governance, Excel Financial Modeling, Claude and Claude Code
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] mt-12">
          For the full work history and results, open the PDF above.
        </p>
      </div>
    </div>
  )
}
