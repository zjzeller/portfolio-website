import { NextRequest, NextResponse } from 'next/server'
import { trackPageView, trackResumeEvent } from '@/lib/supabase/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    // Get user agent from request
    const userAgent = request.headers.get('user-agent') || undefined

    if (type === 'page_view') {
      await trackPageView({
        ...data,
        user_agent: userAgent,
      })
    } else if (type === 'resume_view' || type === 'resume_download') {
      await trackResumeEvent({
        event_type: type === 'resume_view' ? 'view' : 'download',
        ...data,
        user_agent: userAgent,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
