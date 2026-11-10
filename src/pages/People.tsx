import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import type { PaginatedUsers, UserOut } from '../types'

const availabilityLabel = (value: UserOut['availability']) => {
  if (value === 'now') return 'Available now'
  if (value === 'open') return 'Open to offers'
  return 'Not available'
}

export default function People() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState<PaginatedUsers | null>(null)
  const [q, setQ] = useState('')
  const [skill, setSkill] = useState('')
  const [query, setQuery] = useState({ q: '', skill: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .searchUsers({ q: query.q || undefined, skill: query.skill || undefined, page })
      .then(setData)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [query, page])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setPage(1)
    setQuery({ q: q.trim(), skill: skill.trim() })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1

  const messageUser = async (id: number) => {
    try {
      const conv = await api.startConversation(id)
      navigate(`/messages/${conv.id}`)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-slate-800">
      <header className="px-4 py-3 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">People</h1>
        <p className="text-sm text-slate-500 mt-1">Find nearby hustlers and specialists by name, bio or skill.</p>
      </header>

      <div className="p-4 border-b border-slate-800">
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or bio"
            className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
          <input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Skill"
            className="w-40 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
          <button className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 text-sm">
            Search
          </button>
        </form>
      </div>

      {error && <p className="text-red-400 text-sm px-4 py-2">{error}</p>}

      {loading ? (
        <p className="text-center text-slate-500 py-10">Loading…</p>
      ) : !data || data.items.length === 0 ? (
        <p className="text-center text-slate-500 py-10">
          No people found for that search.
        </p>
      ) : (
        <>
          {data.items.map((person) => (
            <article
              key={person.id}
              className="flex gap-3 px-4 py-4 border-b border-slate-800"
            >
              <Avatar username={person.username} avatar_url={person.avatar_url} size={50} />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/u/${person.id}`}
                  className="font-semibold text-white hover:text-indigo-300"
                >
                  @{person.username}
                </Link>
                {person.bio && (
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{person.bio}</p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  {person.location && <>📍 {person.location} · </>}
                  {person.availability && (
                    <span className="text-slate-300">
                      {availabilityLabel(person.availability)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {person.account_type === 'hirer' ? 'Hirer' : 'Worker'}
                  {person.expected_rate && ` · ${person.expected_rate}`}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to={`/u/${person.id}`}
                  className="text-center rounded-full border border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 hover:text-white"
                >
                  Profile
                </Link>
                {person.id !== user?.id && (
                  <button
                    onClick={() => messageUser(person.id)}
                    className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5"
                  >
                    Message
                  </button>
                )}
              </div>
            </article>
          ))}
          <div className="flex items-center justify-between px-4 py-4 text-sm border-t border-slate-800">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-slate-200 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-slate-400">
              Page {page} of {totalPages} ({data.total} people)
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-slate-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
