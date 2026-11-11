import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { FollowInfo, PostOut, Skill, UserOut, UserRatingsOut } from '../types'
import PostCard from '../components/PostCard'
import GallerySection from '../components/GallerySection'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const { user: me, refresh } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserOut | null>(null)
  const [info, setInfo] = useState<FollowInfo | null>(null)
  const [posts, setPosts] = useState<PostOut[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [ratings, setRatings] = useState<UserRatingsOut | null>(null)
  const [bioDraft, setBioDraft] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  // skills editor state
  const [editingSkills, setEditingSkills] = useState(false)
  const [skillDraft, setSkillDraft] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  const isSelf = me?.id === userId

  const load = async () => {
    try {
      const [p, i, ps, sk, rt] = await Promise.all([
        api.getUser(userId),
        api.followInfo(userId),
        api.userPosts(userId),
        api.userSkills(userId),
        api.userRatings(userId).catch(() => null),
      ])
      setProfile(p)
      setInfo(i)
      setPosts(ps)
      setSkills(sk)
      setRatings(rt)
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

  const toggleBlock = async () => {
    if (!info) return
    const action = info.is_blocked_by_me ? 'unblock' : 'block'
    if (action === 'block' && !confirm(`Block @${profile?.username}? They won't be able to follow, message, or apply to your gigs.`)) return
    setError(''); setNotice('')
    try {
      if (info.is_blocked_by_me) await api.unblockUser(userId)
      else await api.blockUser(userId)
      setInfo(await api.followInfo(userId))
      setNotice(info.is_blocked_by_me ? 'User unblocked.' : 'User blocked.')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const reportUser = async () => {
    const reason = prompt('Report this user. Reason (spam, harassment, scam, inappropriate, other):')
    if (!reason || !reason.trim()) return
    const details = prompt('Additional details (optional):') || undefined
    setError(''); setNotice('')
    try {
      await api.report({ target_type: 'user', target_id: userId, reason: reason.trim(), details })
      setNotice('Report submitted. Our team will review it.')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const saveBio = async () => {
    try {
      await api.updateProfile({ bio: bioDraft })
      await refresh()
      await load()
      setNotice('Bio saved.')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const startEditSkills = () => {
    setSkillDraft(skills.map((s) => s.skill))
    setSkillInput('')
    setEditingSkills(true)
  }

  const messageUser = async () => {
    try {
      const conv = await api.startConversation(userId)
      navigate(`/messages/${conv.id}`)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const addSkill = () => {
    const value = skillInput.trim()
    if (!value || skillDraft.length >= 20) return
    if (!skillDraft.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setSkillDraft([...skillDraft, value])
    }
    setSkillInput('')
  }

  const saveSkills = async () => {
    if (skillDraft.length === 0) {
      setError('Add at least one skill')
      return
    }
    try {
      setSkills(await api.updateSkills(skillDraft))
      setEditingSkills(false)
      setError('')
      setNotice('Skills saved.')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  if (loading) return <p className="text-center text-slate-500 py-10">Loading…</p>
  if (!profile) return <p className="text-center text-red-400 py-10">{error || 'Not found'}</p>

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-slate-800">
      <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">@{profile.username}</h1>
        <span className="text-xs font-semibold rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-300 capitalize">
          {profile.account_type}
        </span>
      </header>

      <div className="p-4 border-b border-slate-800">
        <Avatar username={profile.username} avatar_url={profile.avatar_url} size={80} className="mb-3" />
        <p className="text-slate-300">{profile.bio || 'No bio yet.'}</p>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          {profile.location && (
            <span className="rounded-full bg-slate-800 border border-slate-700 text-slate-200 px-2 py-0.5">
              📍 {profile.location}
            </span>
          )}
          {profile.availability && (
            <span className={`rounded-full border px-2 py-0.5 ${
              profile.availability === 'now'
                ? 'border-emerald-500/40 text-emerald-300'
                : profile.availability === 'open'
                  ? 'border-amber-500/40 text-amber-300'
                  : 'border-slate-600 text-slate-400'
            }`}>
              {profile.availability === 'now'
                ? 'Available now'
                : profile.availability === 'open'
                  ? 'Open to offers'
                  : 'Not available'}
            </span>
          )}
          {profile.expected_rate && (
            <span className="rounded-full bg-slate-800 border border-slate-700 text-slate-200 px-2 py-0.5">
              {profile.expected_rate}
            </span>
          )}
          {profile.languages && (
            <span className="rounded-full bg-slate-800 border border-slate-700 text-slate-200 px-2 py-0.5">
              {profile.languages}
            </span>
          )}
        </div>
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
            <div className="flex flex-col gap-2">
              {info?.is_blocked_by_them && (
                <p className="text-sm text-amber-400">You can’t interact with this user.</p>
              )}
              {info?.is_blocked_by_me && (
                <p className="text-sm text-slate-400">You have blocked this user.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={toggleFollow}
                  disabled={info?.is_blocked_by_me || info?.is_blocked_by_them}
                  className={`rounded-full font-semibold px-4 py-1.5 text-sm disabled:opacity-50 ${
                    info?.is_following
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {info?.is_following ? 'Unfollow' : 'Follow'}
                </button>
                <button
                  onClick={messageUser}
                  disabled={info?.is_blocked_by_me || info?.is_blocked_by_them}
                  className="rounded-full border border-slate-600 hover:border-slate-400 disabled:opacity-50 text-slate-200 font-semibold px-4 py-1.5 text-sm"
                >
                  Message
                </button>
                <button
                  onClick={toggleBlock}
                  className={`rounded-full font-semibold px-4 py-1.5 text-sm ${
                    info?.is_blocked_by_me
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  {info?.is_blocked_by_me ? 'Unblock' : 'Block'}
                </button>
                <button
                  onClick={reportUser}
                  className="rounded-full border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 font-semibold px-4 py-1.5 text-sm"
                >
                  Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      <section className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Skills</h2>
          {isSelf && !editingSkills && (
            <button
              onClick={startEditSkills}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              {skills.length === 0 ? '+ Add skills' : 'Edit'}
            </button>
          )}
        </div>

        {editingSkills ? (
          <div className="mt-3">
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
                maxLength={40}
                placeholder="e.g. Plumbing, Welding, Braiding"
                className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              />
              <button
                onClick={addSkill}
                className="rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-4"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {skillDraft.map((s) => (
                <button
                  key={s}
                  onClick={() => setSkillDraft(skillDraft.filter((x) => x !== s))}
                  title="Remove"
                  className="group rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-sm px-3 py-1"
                >
                  {s} <span className="text-indigo-400 group-hover:text-red-400">✕</span>
                </button>
              ))}
              {skillDraft.length === 0 && (
                <p className="text-sm text-slate-500">No skills added yet.</p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={saveSkills}
                className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-1.5"
              >
                Save skills
              </button>
              <button
                onClick={() => setEditingSkills(false)}
                className="text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <span className="text-xs text-slate-500 ml-auto">{skillDraft.length}/20</span>
            </div>
          </div>
        ) : skills.length === 0 ? (
          <p className="text-sm text-slate-500 mt-2">No skills listed yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mt-3">
            {skills.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-sm px-3 py-1"
              >
                {s.skill}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Ratings */}
      <section className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Ratings</h2>
          {ratings && ratings.summary.count > 0 ? (
            <span className="text-sm text-amber-300 font-semibold">
              ★ {ratings.summary.average?.toFixed(1)} <span className="text-slate-400 font-normal">({ratings.summary.count})</span>
            </span>
          ) : (
            <span className="text-sm text-slate-500">No ratings yet</span>
          )}
        </div>
        {ratings && ratings.items.length > 0 && (
          <ul className="mt-3 space-y-3">
            {ratings.items.slice(0, 5).map((r) => (
              <li key={r.id} className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                <div className="flex items-center justify-between">
                  <Link to={`/u/${r.rater_id}`} className="flex items-center gap-2 text-sm font-semibold text-white hover:text-indigo-300">
                    <Avatar username={r.rater_username} avatar_url={r.rater_avatar_url} size={24} />
                    @{r.rater_username}
                  </Link>
                  <span className="text-amber-300 text-sm font-semibold">{'★'.repeat(r.rating)}<span className="text-slate-600">{'★'.repeat(5 - r.rating)}</span></span>
                </div>
                {r.comment && <p className="text-sm text-slate-300 mt-2">{r.comment}</p>}
                <p className="text-xs text-slate-500 mt-1">{new Date(r.created_at).toLocaleDateString()} · <Link className="hover:underline" to={`/gigs/${r.gig_id}`}>Gig #{r.gig_id}</Link></p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Work gallery */}
      <GallerySection userId={userId} isSelf={isSelf} />

      {notice && <p className="text-emerald-400 text-sm px-4 py-2">{notice}</p>}
      {error && <p className="text-red-400 text-sm px-4 py-2">{error}</p>}

      <div className="px-4 py-2 border-b border-slate-800 text-sm font-semibold text-slate-400">
        Posts
      </div>
      {posts.length === 0 ? (
        <p className="text-center text-slate-500 py-10">No posts yet.</p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
      {isSelf && (
        <p className="text-center text-xs text-slate-600 py-4">
          Manage role and bio in{' '}
          <Link to="/settings" className="text-indigo-400 hover:underline">
            settings
          </Link>
        </p>
      )}
    </div>
  )
}
