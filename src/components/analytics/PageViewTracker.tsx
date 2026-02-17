'use client'

import { usePageView } from '@/hooks/useAnalytics'

export default function PageViewTracker({ pagePath, pageTitle }: { pagePath: string; pageTitle?: string }) {
  usePageView(pagePath, pageTitle)
  return null
}
