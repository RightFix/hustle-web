import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { PostOut } from '../types'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'

export default function Feed() {
  const { user } = useAuth()
  const [following, setFollowing] = useState(false)
  const [posts, setPosts] = useState<PostOut[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setPosts(await api.feed(following))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [following])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setBusy(true)
    setError('')
    try {
      const created = await api.createPost(content.trim())
      setPosts((prev) => [created, ...prev])
      setContent('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-slate-800">
      <header className="px-4 py-3 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">Home</h1>
      </header>

      <form onSubmit={submit} className="p-4 border-b border-slate-800">
        <textarea
          value={content}
          maxLength={280}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, @${user?.username}?`}
          rows={3}
          className="w-full resize-none rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-500">{content.length}/280</span>
          <button
            disabled={busy || !content.trim()}
            className="rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-4 py-1.5 text-sm"
          >
            {busy ? '…' : 'Post'}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </form>

      <div className="flex border-b border-slate-800 text-sm">
        <button
          onClick={() => setFollowing(false)}
          className={`flex-1 py-3 font-semibold ${
            !following ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400'
          }`}
        >
          For you
        </button>
        <button
          onClick={() => setFollowing(true)}
          className={`flex-1 py-3 font-semibold ${
            following ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400'
          }`}
        >
          Following
        </button>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-10">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-slate-500 py-10">
          {following ? 'No posts from people you follow yet.' : 'No posts yet.'}
        </p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  )
}
