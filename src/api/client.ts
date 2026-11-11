import type {
  Applicant,
  Conversation,
  FollowInfo,
  GalleryItem,
  Gig,
  Message,
  NotificationPage,
  PaginatedGigs,
  PaginatedPosts,
  ReportOut,
  PaginatedUsers,
  PostOut,
  Skill,
  StatsOut,
  Token,
  UserBrief,
  UserOut,
} from '../types'

const API = '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // Auth rides on the HttpOnly cookie set by the backend.
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.detail) detail = data.detail
    } catch {
      /* ignore */
    }
    throw new Error(detail)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  register: (email: string, username: string, password: string) =>
    request<UserOut>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),

  login: (email: string, password: string) =>
    request<Token>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  forgotPassword: (email: string) =>
    request<Message>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, new_password: string) =>
    request<Message>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    }),

  verifyEmail: (token: string) => request<Message>(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: () =>
    request<Message>('/auth/resend-verification', { method: 'POST' }),

  me: () => request<UserOut>('/users/me'),

  updateBio: (bio: string) =>
    request<UserOut>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ bio }),
    }),

  getUser: (id: number) => request<UserOut>(`/users/${id}`),

  searchUsers: (opts: { q?: string; skill?: string; page?: number; per_page?: number }) => {
    const params = new URLSearchParams()
    if (opts.q) params.set('q', opts.q)
    if (opts.skill) params.set('skill', opts.skill)
    if (opts.page) params.set('page', String(opts.page))
    if (opts.per_page) params.set('per_page', String(opts.per_page))
    return request<PaginatedUsers>(`/users?${params}`)
  },

  followInfo: (id: number) => request<FollowInfo>(`/users/${id}/follow-info`),

  follow: (id: number) =>
    request<void>(`/users/${id}/follow`, { method: 'POST' }),

  unfollow: (id: number) =>
    request<void>(`/users/${id}/follow`, { method: 'DELETE' }),

  createPost: (content: string) =>
    request<PostOut>('/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  feed: (opts: { following?: boolean; page?: number; per_page?: number }) =>
    request<PaginatedPosts>(
      `/posts/feed?following=${Boolean(opts.following)}&page=${opts.page ?? 1}&per_page=${opts.per_page ?? 20}`,
    ),

  userSkills: (id: number) => request<Skill[]>(`/users/${id}/skills`),

  updateSkills: (skills: string[]) =>
    request<Skill[]>('/users/me/skills', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    }),

  userPosts: (id: number) => request<PostOut[]>(`/posts/user/${id}`),

  deletePost: (id: number) =>
    request<void>(`/posts/${id}`, { method: 'DELETE' }),

  adminStats: () => request<StatsOut>('/admin/stats'),

  adminUsers: (page: number, per_page: number) =>
    request<PaginatedUsers>(`/admin/users?page=${page}&per_page=${per_page}`),

  // --- gigs ---
  gigs: (opts: { collar?: string; q?: string; status?: string; location?: string; page?: number; per_page?: number }) => {
    const params = new URLSearchParams()
    if (opts.collar) params.set('collar', opts.collar)
    if (opts.q) params.set('q', opts.q)
    if (opts.status) params.set('status', opts.status)
    if (opts.location) params.set('location', opts.location)
    if (opts.page) params.set('page', String(opts.page))
    if (opts.per_page) params.set('per_page', String(opts.per_page))
    return request<PaginatedGigs>(`/gigs?${params}`)
  },

  gig: (id: number) => request<Gig>(`/gigs/${id}`),

  createGig: (data: {
    title: string
    description: string
    collar: string
    location?: string
    pay?: string
  }) =>
    request<Gig>('/gigs', { method: 'POST', body: JSON.stringify(data) }),

  updateGigStatus: (id: number, status: 'open' | 'closed') =>
    request<Gig>(`/gigs/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  deleteGig: (id: number) => request<void>(`/gigs/${id}`, { method: 'DELETE' }),

  applyGig: (id: number, message?: string) =>
    request<Message>(`/gigs/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message: message ?? null }),
    }),

  withdrawGig: (id: number) =>
    request<void>(`/gigs/${id}/apply`, { method: 'DELETE' }),

  gigApplicants: (id: number) => request<Applicant[]>(`/gigs/${id}/applicants`),

  saveGig: (id: number) => request<void>(`/gigs/${id}/save`, { method: 'POST' }),

  unsaveGig: (id: number) => request<void>(`/gigs/${id}/save`, { method: 'DELETE' }),

  savedGigs: (page = 1, per_page = 20) =>
    request<PaginatedGigs>(`/gigs/saved?page=${page}&per_page=${per_page}`),

  // --- messaging ---
  conversations: () => request<Conversation[]>('/conversations'),

  startConversation: (user_id: number) =>
    request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ user_id }),
    }),

  conversationMessages: (id: number, page = 1, per_page = 50) =>
    request<Message[]>(`/conversations/${id}/messages?page=${page}&per_page=${per_page}`),

  markRead: (id: number) =>
    request<void>(`/conversations/${id}/read`, { method: 'POST' }),

  // --- notifications ---
  notifications: (page = 1, per_page = 20) =>
    request<NotificationPage>(`/notifications?page=${page}&per_page=${per_page}`),

  notificationUnreadCount: () => request<{ count: number }>('/notifications/unread-count'),

  markNotificationRead: (id: number) =>
    request<void>(`/notifications/${id}/read`, { method: 'POST' }),

  markAllNotificationsRead: () =>
    request<void>('/notifications/read-all', { method: 'POST' }),

  // --- work gallery ---
  userGallery: (id: number) => request<GalleryItem[]>(`/users/${id}/gallery`),

  deleteGalleryItem: (id: number) =>
    request<void>(`/gallery/${id}`, { method: 'DELETE' }),

  // multipart upload — uses fetch directly so the browser sets the boundary
  uploadGalleryItem: async (file: File, caption?: string) => {
    const form = new FormData()
    form.append('file', file)
    if (caption) form.append('caption', caption)
    const res = await fetch('/api/users/me/gallery', {
      method: 'POST',
      body: form,
      credentials: 'include',
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { detail?: string }
      throw new Error(data.detail || `Upload failed (${res.status})`)
    }
    return (await res.json()) as GalleryItem
  },

  updateProfile: (data: {
    bio?: string
    account_type?: 'worker' | 'hirer'
    location?: string | null
    availability?: 'now' | 'open' | 'unavailable' | null
    expected_rate?: string | null
    languages?: string | null
    email_messages_enabled?: boolean
  }) =>
    request<UserOut>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

  uploadAvatar: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/users/me/avatar', {
      method: 'POST',
      body: form,
      credentials: 'include',
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { detail?: string }
      throw new Error(data.detail || `Upload failed (${res.status})`)
    }
    return (await res.json()) as UserOut
  },

  deleteAvatar: () => request<UserOut>('/users/me/avatar', { method: 'DELETE' }),
  blockUser: (id: number) => request<void>(`/users/${id}/block`, { method: 'POST' }),

  unblockUser: (id: number) => request<void>(`/users/${id}/block`, { method: 'DELETE' }),

  myBlocks: () => request<UserBrief[]>(`/users/me/blocks`),

  report: (data: { target_type: 'user' | 'post' | 'gig'; target_id: number; reason: string; details?: string }) =>
    request<ReportOut>('/reports', { method: 'POST', body: JSON.stringify(data) }),

}
