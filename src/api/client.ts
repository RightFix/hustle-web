import type { PostOut, Token, UserOut, FollowInfo } from '../types'

const TOKEN_KEY = 'hustle_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

const API = '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API}${path}`, { ...options, headers })
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

  me: () => request<UserOut>('/users/me'),

  updateBio: (bio: string) =>
    request<UserOut>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ bio }),
    }),

  getUser: (id: number) => request<UserOut>(`/users/${id}`),

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

  feed: (following: boolean) =>
    request<PostOut[]>(`/posts/feed?following=${following}`),

  userPosts: (id: number) => request<PostOut[]>(`/posts/user/${id}`),

  deletePost: (id: number) =>
    request<void>(`/posts/${id}`, { method: 'DELETE' }),
}
