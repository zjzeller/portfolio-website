'use client'

import { useEffect } from 'react'
import { useResumeEvent } from '@/hooks/useAnalytics'
import Button from '@/components/ui/Button'
import { Download } from 'lucide-react'

export function ResumeDownloadButton() {
  const { trackDownload } = useResumeEvent()

  const handleDownload = () => {
    trackDownload()
    const link = document.createElement('a')
    link.href = '/assets/resume/zachary-zeller-resume.pdf'
    link.download = 'zachary-zeller-resume.pdf'
    link.click()
  }

  return (
    <Button onClick={handleDownload} size="sm" className="gap-2">
      <Download size={14} /> Download
    </Button>
  )
}

export function ResumeViewTracker() {
  const { trackView } = useResumeEvent()

  useEffect(() => {
    trackView()
  }, [trackView])

  return null
}
