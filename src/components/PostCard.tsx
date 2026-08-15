import { Link } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../api/client'
import type { PostOut } from '../types'
import { useAuth } from '../context/AuthContext'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function PostCard({ post }: { post: PostOut }) {
  const { user } = useAuth()
  const [deleted, setDeleted] = useState(false)

  if (deleted) return null

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    try {
      await api.deletePost(post.id)
      setDeleted(true)
    } catch (e) {
      alert((e as Error).message)
    }
  }

  return (
    <article className="border-b border-slate-800 px-4 py-3 hover:bg-slate-900/40">
      <div className="flex items-center gap-2 text-sm">
        <Link
          to={`/u/${post.author_id}`}
          className="font-semibold text-white hover:underline"
        >
          @{post.author?.username ?? 'unknown'}
        </Link>
        <span className="text-slate-500">· {timeAgo(post.created_at)}</span>
        {user?.id === post.author_id && (
          <button
            onClick={handleDelete}
            className="ml-auto text-slate-500 hover:text-red-400 text-xs"
          >
            Delete
          </button>
        )}
      </div>
      <p className="mt-1 whitespace-pre-wrap text-slate-200">{post.content}</p>
    </article>
  )
}
