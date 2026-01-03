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
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold">Resume</h1>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={handleDownload} className="gap-2">
            <Download size={20} /> Download PDF
          </Button>
          <a
            href="/assets/resume/zachary-zeller-resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2">
              <ExternalLink size={20} /> Open in New Tab
            </Button>
          </a>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="border rounded-lg overflow-hidden shadow-lg bg-white animate-fade-in">
        <iframe
          src="/assets/resume/zachary-zeller-resume.pdf"
          className="w-full h-[800px] md:h-[1000px]"
          title="Resume PDF"
        />
      </div>

      {/* Alternative text version for SEO and accessibility */}
      <div className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-bold mb-4 text-[#1D3557]">Zachary Zeller</h2>
        <p className="text-[#457B9D] mb-6">Senior Data Analyst | Berkeley, CA</p>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-[#457B9D]">Contact</h3>
          <p className="text-[#1D3557]">Email: zjzeller@gmail.com</p>
          <p className="text-[#1D3557]">Phone: (707) 815-5241</p>
          <p className="text-[#1D3557]">GitHub: github.com/zjzeller</p>
          <p className="text-[#1D3557]">LinkedIn: linkedin.com/in/zzeller</p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-[#457B9D]">Professional Summary</h3>
          <p className="text-[#1D3557]">
            Results-driven Senior Data Analyst with 4+ years of experience building GTM reporting
            infrastructure, investigating data quality issues, and delivering actionable insights to
            executive leadership. Proven expertise in automating ETL processes, maintaining cross-system
            data integrity, and leveraging AI to accelerate analytical workflows.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-[#457B9D]">Current Role</h3>
          <p className="text-[#1D3557]">
            <strong>Senior Data Analyst: Strategy</strong> at AAA - Mountain West Group (November 2025 - Present)
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-[#457B9D]">Core Skills</h3>
          <p className="text-[#1D3557]">
            SQL (Complex Joins, CTEs, Window Functions, 10M+ Row Datasets), Claude AI, Python (Automation,
            ETL, scikit-learn), Tableau (Dashboard Development), BigQuery, Salesforce, ConnectSuite CRM,
            Data Visualization, Revenue Analytics, Cross-Functional Collaboration
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-[#457B9D]">Education</h3>
          <p className="text-[#1D3557]">
            <strong>Master's Degree, Applied Economics</strong> - University of San Francisco (December 2021)
          </p>
          <p className="text-[#1D3557]">
            <strong>Bachelor's Degree, Economics</strong> | Minor, Environmental Studies - Santa Clara University (June 2018)
          </p>
        </div>

        <p className="text-sm text-[#457B9D] mt-8">
          For full resume details including complete work history and achievements, please view the PDF above or download it.
        </p>
      </div>
    </div>
  )
}
