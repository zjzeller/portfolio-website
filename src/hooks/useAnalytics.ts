'use client'

import { useEffect, useCallback } from 'react'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

export function usePageView(pagePath: string, pageTitle?: string) {
  useEffect(() => {
    const trackView = async () => {
      const sessionId = getSessionId()

      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'page_view',
            page_path: pagePath,
            page_title: pageTitle,
            referrer: document.referrer,
            session_id: sessionId,
          }),
        })
      } catch (error) {
        console.error('Error tracking page view:', error)
      }
    }

    trackView()
  }, [pagePath, pageTitle])
}

export function useResumeEvent() {
  const trackView = useCallback(async () => {
    const sessionId = getSessionId()

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'resume_view',
          referrer: document.referrer,
          session_id: sessionId,
        }),
      })
    } catch (error) {
      console.error('Error tracking resume view:', error)
    }
  }, [])

  const trackDownload = useCallback(async () => {
    const sessionId = getSessionId()

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'resume_download',
          referrer: document.referrer,
          session_id: sessionId,
        }),
      })
    } catch (error) {
      console.error('Error tracking resume download:', error)
    }
  }, [])

  return { trackView, trackDownload }
}
