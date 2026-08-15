import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { FollowInfo, PostOut, UserOut } from '../types'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const { user: me, refresh } = useAuth()

  const [profile, setProfile] = useState<UserOut | null>(null)
  const [info, setInfo] = useState<FollowInfo | null>(null)
  const [posts, setPosts] = useState<PostOut[]>([])
  const [bioDraft, setBioDraft] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const isSelf = me?.id === userId

  const load = async () => {
    try {
      const [p, i, ps] = await Promise.all([
        api.getUser(userId),
        api.followInfo(userId),
        api.userPosts(userId),
      ])
      setProfile(p)
      setInfo(i)
      setPosts(ps)
      setBioDraft(p.bio ?? '')
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
  }, [userId])

  const toggleFollow = async () => {
    if (!info) return
    try {
      if (info.is_following) await api.unfollow(userId)
      else await api.follow(userId)
      setInfo(await api.followInfo(userId))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const saveBio = async () => {
    try {
      await api.updateBio(bioDraft)
      await refresh()
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  if (loading) return <p className="text-center text-slate-500 py-10">Loading…</p>
  if (!profile) return <p className="text-center text-red-400 py-10">{error || 'Not found'}</p>

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-slate-800">
      <header className="px-4 py-3 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">@{profile.username}</h1>
      </header>

      <div className="p-4 border-b border-slate-800">
        <p className="text-slate-300">{profile.bio || 'No bio yet.'}</p>
        <div className="flex gap-4 mt-3 text-sm text-slate-400">
          <span>
            <strong className="text-white">{info?.following_count ?? 0}</strong> Following
          </span>
          <span>
            <strong className="text-white">{info?.followers_count ?? 0}</strong> Followers
          </span>
        </div>

        <div className="mt-4">
          {isSelf ? (
            <div className="flex flex-col gap-2">
              <input
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                placeholder="Write a bio…"
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
              />
              <button
                onClick={saveBio}
                className="self-start rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-4 py-1.5"
              >
                Save bio
              </button>
            </div>
          ) : (
            <button
              onClick={toggleFollow}
              className={`rounded-full font-semibold px-4 py-1.5 text-sm ${
                info?.is_following
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {info?.is_following ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm px-4 py-2">{error}</p>}

      {posts.length === 0 ? (
        <p className="text-center text-slate-500 py-10">No posts yet.</p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  )
}
