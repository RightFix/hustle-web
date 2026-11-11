export interface UserOut {
  id: number
  email: string
  username: string
  bio: string | null
  is_admin: boolean
  account_type: 'worker' | 'hirer'
  location: string | null
  availability: 'now' | 'open' | 'unavailable' | null
  expected_rate: string | null
  languages: string | null
  avatar_url: string | null
  email_verified: boolean
  email_messages_enabled: boolean
  created_at: string
}

export interface UserPublic {
  id: number
  username: string
  bio: string | null
}

export interface PostOut {
  id: number
  author_id: number
  content: string
  created_at: string
  author?: UserPublic
}

export interface Token {
  access_token: string
  token_type: string
}

export interface Message {
  detail: string
}

export interface FollowInfo {
  followers_count: number
  following_count: number
  is_following: boolean
  is_blocked_by_me: boolean
  is_blocked_by_them: boolean
}

export interface StatsOut {
  user_count: number
  post_count: number
}

export interface PaginatedUsers {
  items: UserOut[]
  total: number
  page: number
  per_page: number
}

export type Collar = 'pink' | 'gray' | 'blue' | 'green'

export interface Gig {
  id: number
  poster_id: number
  title: string
  description: string
  collar: Collar
  location: string | null
  pay: string | null
  status: 'open' | 'closed'
  created_at: string
  applied?: boolean
  saved?: boolean
  applicant_count: number
}

export interface PaginatedGigs {
  items: Gig[]
  total: number
  page: number
  per_page: number
}

export interface PaginatedPosts {
  items: PostOut[]
  total: number
  page: number
  per_page: number
}

export interface Skill {
  id: number
  skill: string
}

export interface UserBrief {
  id: number
  username: string
  bio: string | null
  avatar_url?: string | null
}

export interface Conversation {
  id: number
  other_user: UserBrief
  last_message: { body: string; sender_id: number; created_at: string } | null
  unread_count: number
  updated_at: string
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  body: string
  read_at: string | null
  delivered_at: string | null
  created_at: string
}

export interface NotificationItem {
  id: number
  kind: 'follow' | 'gig_apply' | 'message'
  actor: UserBrief
  ref_type: string | null
  ref_id: number | null
  created_at: string
  read_at: string | null
}

export interface NotificationPage {
  items: NotificationItem[]
  total: number
  page: number
  per_page: number
  unread_count: number
}

export interface GalleryItem {
  id: number
  user_id: number
  kind: 'image' | 'video'
  url: string
  mime_type: string
  byte_size: number
  width: number | null
  height: number | null
  duration_seconds: number | null
  caption: string | null
  created_at: string
}

export interface Applicant {
  id: number
  username: string
  bio: string | null
  avatar_url?: string | null
  message: string | null
  applied_at: string
}


export interface ReportOut {
  id: number
  reporter_id: number
  target_type: 'user' | 'post' | 'gig'
  target_id: number
  reason: string
  details?: string | null
  status: string
  admin_note?: string | null
  resolved_by?: number | null
  resolved_at?: string | null
  created_at: string
}
