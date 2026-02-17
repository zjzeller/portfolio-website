import { NextRequest, NextResponse } from 'next/server'
import { trackPageView, trackResumeEvent } from '@/lib/supabase/analytics'

const VALID_TYPES = ['page_view', 'resume_view', 'resume_download'] as const
const MAX_STRING_LENGTH = 500

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60_000 // 1 minute
const RATE_LIMIT_MAX = 30 // requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimit) {
    if (now > entry.resetTime) rateLimit.delete(key)
  }
}, RATE_LIMIT_WINDOW)

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
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Origin validation
    const origin = request.headers.get('origin')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (origin && siteUrl && !origin.startsWith(siteUrl)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
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
