export type PageViewData = {
  page_path: string
  page_title?: string
  referrer?: string
  user_agent?: string
  session_id?: string
}

export type ResumeEventData = {
  event_type: 'view' | 'download'
  referrer?: string
  user_agent?: string
  session_id?: string
}

export type AnalyticsEvent = {
  type: 'page_view' | 'resume_view' | 'resume_download'
  page_path?: string
  page_title?: string
  referrer?: string
  session_id?: string
}
