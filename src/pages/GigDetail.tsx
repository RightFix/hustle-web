import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Applicant, Gig } from '../types'
import { collarLabels, collarStyles } from '../lib/collars'
import Avatar from '../components/Avatar'

export default function GigDetail() {
  const { id } = useParams<{ id: string }>()
  const gigId = Number(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [gig, setGig] = useState<Gig | null>(null)
  const [applicants, setApplicants] = useState<Applicant[] | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const isPoster = gig?.poster_id === user?.id
  const isWorker = user?.account_type === 'worker'

  const load = async () => {
    try {
      setGig(await api.gig(gigId))
      if (isPoster) setApplicants(await api.gigApplicants(gigId))
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
  }, [gigId, isPoster])

  const apply = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.applyGig(gigId, message.trim() || undefined)
      setNotice('Application sent!')
      setMessage('')
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const withdraw = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.withdrawGig(gigId)
      setNotice('Application withdrawn.')
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const toggleSave = async () => {
    if (!gig) return
    setBusy(true)
    setError('')
    try {
      if (gig.saved) await api.unsaveGig(gigId)
      else await api.saveGig(gigId)
      setGig({ ...gig, saved: !gig.saved })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const setStatus = async (status: 'open' | 'closed') => {
    setBusy(true)
    setError('')
    try {
      await api.updateGigStatus(gigId, status)
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!confirm('Delete this gig permanently?')) return
    setBusy(true)
    try {
      await api.deleteGig(gigId)
      navigate('/gigs')
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  if (loading) return <p className="text-center text-slate-500 py-10">Loading…</p>
  if (!gig)
    return (
      <p className="text-center text-red-400 py-10">{error || 'Gig not found'}</p>
    )

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-slate-800">
      <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <Link to="/gigs" className="text-slate-400 hover:text-white text-sm">
          ← Back to gigs
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSave}
            disabled={busy}
            className="text-sm text-amber-300 hover:text-amber-200"
            aria-pressed={gig.saved ?? false}
          >
            {gig.saved ? '🔖 Saved' : '🔖 Save'}
          </button>
          <span
            className={`text-xs font-semibold rounded-full border px-2 py-0.5 ${collarStyles[gig.collar]}`}
          >
            {collarLabels[gig.collar]}
          </span>
        </div>
      </header>

      <div className="p-4 border-b border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-white">{gig.title}</h1>
          {gig.status === 'closed' && (
            <span className="text-xs font-bold text-red-400 border border-red-500/30 bg-red-500/10 rounded-full px-2 py-0.5">
              CLOSED
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-slate-400">
          {gig.location && <span>📍 {gig.location}</span>}
          {gig.pay && <span className="text-amber-300 font-semibold">{gig.pay}</span>}
          <span>{new Date(gig.created_at).toLocaleDateString()}</span>
          <span>
            {gig.applicant_count}{' '}
            {gig.applicant_count === 1 ? 'applicant' : 'applicants'}
          </span>
        </div>
        <p className="text-slate-300 mt-4 whitespace-pre-wrap">{gig.description}</p>
      </div>

      {error && <p className="text-red-400 text-sm px-4 py-2">{error}</p>}
      {notice && <p className="text-emerald-400 text-sm px-4 py-2">{notice}</p>}

      {/* Applicant actions */}
      {isPoster ? (
        <section className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Applicants</h2>
            <div className="flex gap-2">
              {gig.status === 'open' ? (
                <button
                  disabled={busy}
                  onClick={() => setStatus('closed')}
                  className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-200"
                >
                  Close gig
                </button>
              ) : (
                <button
                  disabled={busy}
                  onClick={() => setStatus('open')}
                  className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-200"
                >
                  Reopen
                </button>
              )}
              <button
                disabled={busy}
                onClick={remove}
                className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
          {!applicants || applicants.length === 0 ? (
            <p className="text-sm text-slate-500">No applications yet.</p>
          ) : (
            <ul className="space-y-3">
              {applicants.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl bg-slate-900 border border-slate-800 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar username={a.username} avatar_url={a.avatar_url} size={40} />
                      <Link
                        to={`/u/${a.id}`}
                        className="font-semibold text-white hover:text-indigo-300"
                      >
                        @{a.username}
                      </Link>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(a.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                  {a.bio && <p className="text-sm text-slate-400 mt-1">{a.bio}</p>}
                  {a.message && (
                    <p className="text-sm text-slate-300 mt-2 border-l-2 border-indigo-500 pl-2">
                      {a.message}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : gig.status === 'open' && isWorker ? (
        <section className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white mb-2">
            {gig.applied ? 'Applied ✓' : 'Apply for this gig'}
          </h2>
          {gig.applied ? (
            <button
              disabled={busy}
              onClick={withdraw}
              className="rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-4 py-2 text-sm"
            >
              {busy ? '…' : 'Withdraw application'}
            </button>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Introduce yourself briefly — where you are, when you can start (optional)"
                className="w-full resize-none rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">{message.length}/500</span>
                <button
                  disabled={busy}
                  onClick={apply}
                  className="rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-1.5 text-sm"
                >
                  {busy ? '…' : 'Apply'}
                </button>
              </div>
            </>
          )}
        </section>
      ) : !isPoster && user?.account_type === 'hirer' ? (
        <p className="p-4 text-sm text-slate-500 border-b border-slate-800">
          You're on a hirer profile — switch to a worker profile in{' '}
          <Link to="/settings" className="text-indigo-400 hover:underline">
            settings
          </Link>{' '}
          to apply.
        </p>
      ) : null}
    </div>
  )
}
