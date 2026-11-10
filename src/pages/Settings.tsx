import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'

const roles = [
  {
    id: 'worker' as const,
    title: 'Worker',
    desc: 'Browse gigs, apply, get hired. Default profile.',
    emoji: '🧰',
  },
  {
    id: 'hirer' as const,
    title: 'Hirer',
    desc: 'Post gigs, review applicants, hire nearby hustlers.',
    emoji: '📋',
  },
]

export default function Settings() {
  const { user, refresh } = useAuth()
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [availability, setAvailability] = useState<'' | 'now' | 'open' | 'unavailable'>('')
  const [expectedRate, setExpectedRate] = useState('')
  const [languages, setLanguages] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [avatarBusy, setAvatarBusy] = useState(false)

  useEffect(() => {
    setBio(user?.bio ?? '')
    setLocation(user?.location ?? '')
    setAvailability(user?.availability ?? '')
    setExpectedRate(user?.expected_rate ?? '')
    setLanguages(user?.languages ?? '')
  }, [user?.bio, user?.location, user?.availability, user?.expected_rate, user?.languages])

  if (!user) return null

  const switchRole = async (account_type: 'worker' | 'hirer') => {
    if (account_type === user.account_type) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.updateProfile({ account_type })
      await refresh()
      setNotice(
        account_type === 'hirer'
          ? 'Switched to hirer profile — you can post gigs now.'
          : 'Switched to worker profile.',
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const saveBio = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.updateProfile({ bio })
      await refresh()
      setNotice('Profile saved.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const saveAbout = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.updateProfile({
        location: location.trim() || null,
        availability: availability || null,
        expected_rate: expectedRate.trim() || null,
        languages: languages.trim() || null,
      })
      await refresh()
      setNotice('Profile details saved.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    setAvatarBusy(true)
    setError('')
    setNotice('')
    try {
      await api.uploadAvatar(file)
      await refresh()
      setNotice('Avatar updated.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setAvatarBusy(false)
    }
  }

  const removeAvatar = async () => {
    setAvatarBusy(true)
    setError('')
    setNotice('')
    try {
      await api.deleteAvatar()
      await refresh()
      setNotice('Avatar removed.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setAvatarBusy(false)
    }
  }

  const toggleEmailNotifications = async () => {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      await api.updateProfile({ email_messages_enabled: !user.email_messages_enabled })
      await refresh()
      setNotice(user.email_messages_enabled ? 'Message emails disabled.' : 'Message emails enabled.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const resendVerification = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      setNotice((await api.resendVerification()).detail)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Avatar
        </h2>
        <div className="flex items-center gap-4 rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <Avatar username={user.username} avatar_url={user.avatar_url} size={96} />
          <div className="flex flex-wrap gap-2">
            <label
              className={`cursor-pointer rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 ${
                avatarBusy ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              {user.avatar_url ? 'Replace avatar' : 'Upload avatar'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void uploadAvatar(file)
                  e.target.value = ''
                }}
              />
            </label>
            {user.avatar_url && (
              <button
                type="button"
                disabled={avatarBusy}
                onClick={removeAvatar}
                className="rounded-full border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Profile type
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {roles.map((role) => {
            const active = user.account_type === role.id
            return (
              <button
                key={role.id}
                disabled={busy}
                onClick={() => switchRole(role.id)}
                className={`text-left rounded-2xl border p-4 transition ${
                  active
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{role.emoji}</span>
                  <span
                    className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                      active
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {active ? 'Active' : 'Switch'}
                  </span>
                </div>
                <p className="font-bold text-white mt-2">{role.title}</p>
                <p className="text-sm text-slate-400 mt-1">{role.desc}</p>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Switch anytime — your posts, follows and applications stay with you.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Bio
        </h2>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="What do you do? e.g. 'Electrician, 8 years — wired 40+ homes in Lagos.'"
          className="w-full resize-none rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
        />
        <button
          onClick={saveBio}
          disabled={busy}
          className="mt-2 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-4 py-1.5 text-sm"
        >
          Save bio
        </button>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          About you
        </h2>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 grid gap-3">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={80}
            placeholder="Location — Lagos, Enugu, remote…"
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as typeof availability)}
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
          >
            <option value="">Availability — not set</option>
            <option value="now">Available now</option>
            <option value="open">Open to offers</option>
            <option value="unavailable">Not available</option>
          </select>
          <input
            value={expectedRate}
            onChange={(e) => setExpectedRate(e.target.value)}
            maxLength={60}
            placeholder="Expected rate — ₦25,000/day"
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          <input
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            maxLength={120}
            placeholder="Languages — English, Igbo, Pidgin"
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={saveAbout}
          disabled={busy}
          className="mt-2 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-4 py-1.5 text-sm"
        >
          Save about you
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Account
        </h2>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-sm space-y-1">
          <p className="text-slate-400">
            Username: <span className="text-white">@{user.username}</span>
          </p>
          <p className="text-slate-400">
            Email: <span className="text-white">{user.email}</span>
          </p>
          {user.email_verified ? (
            <p className="text-emerald-400 font-semibold">✓ Email verified</p>
          ) : (
            <div className="pt-2">
              <p className="text-amber-300 font-semibold">Email not verified</p>
              <p className="text-slate-500 text-xs mt-1">Check your inbox for the verification link, or request another one.</p>
              <button
                onClick={resendVerification}
                disabled={busy}
                className="mt-2 rounded-full border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold px-3 py-1.5"
              >
                Resend verification email
              </button>
            </div>
          )}
          <label className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800 mt-2 cursor-pointer">
            <span>
              <span className="block text-white font-semibold">Email me about new messages</span>
              <span className="block text-slate-500 text-xs mt-1">One email per unread burst; turn off any time.</span>
            </span>
            <input
              type="checkbox"
              checked={user.email_messages_enabled}
              onChange={toggleEmailNotifications}
              className="h-5 w-5 accent-indigo-600"
              aria-label="Email me about new messages"
            />
          </label>
        </div>
      </section>

      {notice && <p className="text-emerald-400 text-sm mt-4">{notice}</p>}
      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
    </div>
  )
}
