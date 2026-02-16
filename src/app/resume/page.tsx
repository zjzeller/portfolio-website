'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Download, ExternalLink } from 'lucide-react'
import { usePageView, useResumeEvent } from '@/hooks/useAnalytics'

export default function ResumePage() {
  const { trackView, trackDownload } = useResumeEvent()
  usePageView('/resume', 'Resume')

  useEffect(() => {
    trackView()
  }, [trackView])

  const handleDownload = () => {
    trackDownload()
    const link = document.createElement('a')
    link.href = '/assets/resume/zachary-zeller-resume.pdf'
    link.download = 'zachary-zeller-resume.pdf'
    link.click()
  }

  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-5xl">
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
          <Button onClick={handleDownload} size="sm" className="gap-2">
            <Download size={14} /> Download
          </Button>
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

      {/* PDF Viewer */}
      <div className="border border-[var(--border)] overflow-hidden bg-[var(--bg-surface)] animate-reveal-delay-1">
        <iframe
          src="/assets/resume/zachary-zeller-resume.pdf"
          className="w-full h-[800px] md:h-[1000px]"
          title="Resume PDF"
        />
      </div>

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
                Results-driven Senior Data Analyst with 4+ years of experience building GTM reporting
                infrastructure, investigating data quality issues, and delivering actionable insights to
                executive leadership. Proven expertise in automating ETL processes, maintaining cross-system
                data integrity, and leveraging AI to accelerate analytical workflows.
              </p>
            </div>

            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--accent)] mb-4">Current Role</h3>
              <p className="text-sm text-[var(--text-primary)]">Senior Data Analyst: Strategy</p>
              <p className="text-sm text-[var(--text-muted)]">AAA - Mountain West Group</p>
              <p className="metric text-xs text-[var(--text-muted)] mt-1">Nov 2025 &mdash; Present</p>
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
                SQL, Python, Claude AI, Tableau, BigQuery, Salesforce, Data Visualization, Revenue Analytics, Process Automation
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] mt-12">
          For complete details including full work history and achievements, view the PDF above.
        </p>
      </div>
    </div>
  )
}
