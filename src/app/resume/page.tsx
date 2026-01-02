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
        <h2 className="text-2xl font-bold mb-4">Zachary Zeller</h2>
        <p className="text-gray-600 mb-6">Software Developer & Data Scientist</p>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-blue-600">Contact</h3>
          <p className="text-gray-700">Email: zjzeller@gmail.com</p>
          <p className="text-gray-700">GitHub: github.com/zjzeller</p>
          <p className="text-gray-700">LinkedIn: linkedin.com/in/zzeller</p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-blue-600">Skills</h3>
          <p className="text-gray-700">
            React, Next.js, TypeScript, JavaScript, Node.js, Supabase, Tailwind CSS,
            Git, Vercel, Data Analysis, Python, SQL
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          For full resume details, please view the PDF above or download it.
        </p>
      </div>
    </div>
  )
}
