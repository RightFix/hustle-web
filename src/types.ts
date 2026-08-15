export interface UserOut {
  id: number
  email: string
  username: string
  bio: string | null
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

export interface FollowInfo {
  followers_count: number
  following_count: number
  is_following: boolean
}
