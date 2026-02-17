import { createClient } from './server'
import type { PageViewData, ResumeEventData } from '@/types/analytics'

export async function trackPageView(data: PageViewData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('page_views')
    .insert([{
      page_path: data.page_path,
      page_title: data.page_title,
      referrer: data.referrer,
      user_agent: data.user_agent,
      session_id: data.session_id,
    }])

  if (error) {
    console.error('Error tracking page view:', error)
  }
}

export async function trackResumeEvent(data: ResumeEventData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('resume_events')
    .insert([{
      event_type: data.event_type,
      referrer: data.referrer,
      user_agent: data.user_agent,
      session_id: data.session_id,
    }])

  if (error) {
    console.error('Error tracking resume event:', error)
  }
}

export async function getPageViewCount(pagePath?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })

  if (pagePath) {
    query = query.eq('page_path', pagePath)
  }

  const { count, error } = await query

  if (error) {
    console.error('Error getting page view count:', error)
    return 0
  }

  return count || 0
}

export async function getResumeStats() {
  const supabase = await createClient()

  const [viewsResult, downloadsResult] = await Promise.all([
    supabase
      .from('resume_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'view'),
    supabase
      .from('resume_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'download'),
  ])

  if (viewsResult.error || downloadsResult.error) {
    console.error('Error getting resume stats:', viewsResult.error || downloadsResult.error)
    return { views: 0, downloads: 0 }
  }

  return {
    views: viewsResult.count || 0,
    downloads: downloadsResult.count || 0,
  }
}
