import { NextRequest, NextResponse } from 'next/server'
import { trackPageView, trackResumeEvent } from '@/lib/supabase/analytics'

const VALID_TYPES = ['page_view', 'resume_view', 'resume_download'] as const
const MAX_STRING_LENGTH = 500

function sanitizeString(value: unknown, maxLength = MAX_STRING_LENGTH): string | undefined {
  if (typeof value !== 'string') return undefined
  return value.slice(0, maxLength)
}

function isValidUUID(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export async function POST(request: NextRequest) {
  try {
    // Origin validation — fail closed if env var is missing or host doesn't match
    const origin = request.headers.get('origin')
    if (origin) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      if (!siteUrl) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      try {
        const originHost = new URL(origin).host
        const siteHost = new URL(siteUrl).host
        if (originHost !== siteHost) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const body = await request.json()

    // Validate event type
    const { type } = body
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') || undefined

    // Validate and extract only whitelisted fields
    const sessionId = isValidUUID(body.session_id) ? body.session_id : undefined

    if (type === 'page_view') {
      const pagePath = sanitizeString(body.page_path)
      if (!pagePath) {
        return NextResponse.json(
          { error: 'page_path is required' },
          { status: 400 }
        )
      }

      await trackPageView({
        page_path: pagePath,
        page_title: sanitizeString(body.page_title),
        referrer: sanitizeString(body.referrer),
        user_agent: userAgent,
        session_id: sessionId,
      })
    } else if (type === 'resume_view' || type === 'resume_download') {
      await trackResumeEvent({
        event_type: type === 'resume_view' ? 'view' : 'download',
        referrer: sanitizeString(body.referrer),
        user_agent: userAgent,
        session_id: sessionId,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
