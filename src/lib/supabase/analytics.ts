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
