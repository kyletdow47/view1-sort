export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'pinterest'
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'
export type CaptionTone = 'professional' | 'casual' | 'storytelling'

export interface ContentPost {
  id: string
  photoIds: string[]
  caption: string
  hashtags: string[]
  platforms: Platform[]
  status: PostStatus
  scheduledAt?: string
  publishedAt?: string
  createdAt: string
}

export interface MockPhoto {
  id: string
  name: string
  projectName: string
  gradient: string // Tailwind gradient classes for mock thumbnail
  category: string
}

export interface CaptionOption {
  id: string
  text: string
  tone: CaptionTone
}

export interface ScheduleConfig {
  postNow: boolean
  date: string
  time: string
}
