import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Collar, PaginatedGigs } from '../types'
import GigCard from '../components/GigCard'

const collarFilters: { id: Collar | ''; label: string }[] = [
  { id: '', label: 'All' },
  { id: 'pink', label: 'Pink' },
  { id: 'gray', label: 'Gray' },
  { id: 'blue', label: 'Blue' },
  { id: 'green', label: 'Green' },
]

export default function Gigs() {
  const { user } = useAuth()
  const [data, setData] = useState<PaginatedGigs | null>(null)
  const [collar, setCollar] = useState<Collar | ''>('')
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [status, setStatus] = useState('open')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const request = savedOnly
      ? api.savedGigs(page)
      : api.gigs({ collar: collar || undefined, q: search || undefined, location: locationFilter || undefined, status, page })
    request
      .then(setData)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [collar, search, status, page, locationFilter, savedOnly, reloadKey])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-slate-800">
      <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Gigs</h1>
        {user?.account_type === 'hirer' && (
          <Link
            to="/gigs/new"
            className="rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-1.5 text-sm"
          >
            + Post a gig
          </Link>
        )}
      </header>

      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex gap-3 text-xs font-semibold">
          {[
            { id: false, label: 'All gigs' },
            { id: true, label: 'Saved' },
          ].map((tab) => (
            <button
              key={String(tab.id)}
              onClick={() => {
                setSavedOnly(tab.id)
                setPage(1)
              }}
              className={`capitalize ${
                savedOnly === tab.id
                  ? 'text-white border-b-2 border-amber-400 pb-1'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!savedOnly && (<>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            setSearch(q.trim())
          }}
          className="flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search gigs — plumber, cook, guard…"
            className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
          <button className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 text-sm">
            Search
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            setLocationFilter(location.trim())
          }}
          className="flex gap-2"
        >
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Filter by location — Lagos, Enugu…"
            className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
          <button className="rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 text-sm">
            Apply
          </button>
          {locationFilter && (
            <button
              type="button"
              onClick={() => {
                setLocation('')
                setLocationFilter('')
                setPage(1)
              }}
              className="rounded-lg border border-slate-700 text-slate-300 px-3 text-sm"
            >
              Clear
            </button>
          )}
        </form>

        <div className="flex gap-2 overflow-x-auto">
          {collarFilters.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCollar(c.id)
                setPage(1)
              }}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                collar === c.id
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                  : 'border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 text-xs font-semibold">
          {['open', 'in_progress', 'completed', 'closed', 'all'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s)
                setPage(1)
              }}
              className={`capitalize ${
                status === s
                  ? 'text-white border-b-2 border-indigo-500 pb-1'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        </>)}
      </div>

      {error && <p className="text-red-400 text-sm px-4 py-3">{error}</p>}

      {loading ? (
        <p className="text-center text-slate-500 py-10">Loading…</p>
      ) : !data || data.items.length === 0 ? (
        <p className="text-center text-slate-500 py-10">
          {savedOnly ? 'No saved gigs yet. Tap the bookmark on any gig to keep it here.' : 'No gigs here yet. Check back soon.'}
        </p>
      ) : (
        <>
          {data.items.map((gig) => (
            <GigCard key={gig.id} gig={gig} onSavedChange={() => setReloadKey((value) => value + 1)} />
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
              Page {page} of {totalPages} ({data.total} gigs)
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
