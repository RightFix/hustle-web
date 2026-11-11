import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Applicant, Gig } from '../types'
import { collarLabels, collarStyles } from '../lib/collars'
import Avatar from '../components/Avatar'

const statusStyle: Record<string, string> = {
  open: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  in_progress: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  completed: 'text-indigo-300 border-indigo-500/30 bg-indigo-500/10',
  closed: 'text-red-400 border-red-500/30 bg-red-500/10',
}

export default function GigDetail() {
  const { id } = useParams<{ id: string }>()
  const gigId = Number(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [gig, setGig] = useState<Gig | null>(null)
  const [applicants, setApplicants] = useState<Applicant[] | null>(null)
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(5)
  const [ratingComment, setRatingComment] = useState('')
  const [rated, setRated] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const isPoster = gig?.poster_id === user?.id
  const isHired = gig?.hired_worker_id != null && gig.hired_worker_id === user?.id
  const isWorker = user?.account_type === 'worker'
  const isParticipant = isPoster || isHired

  const myAccepted = gig?.my_application_status === 'accepted'

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const g = await api.gig(gigId)
      setGig(g)
      if (g.poster_id === user?.id) {
        setApplicants(await api.gigApplicants(gigId))
      } else {
        setApplicants(null)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    setError(''); setNotice(''); setRated(false)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gigId, user?.id])

  const run = async (fn: () => Promise<void>, ok?: string) => {
    setBusy(true); setError(''); setNotice('')
    try {
      await fn()
      if (ok) setNotice(ok)
      await load(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const toggleSave = async () => {
    if (!gig) return
    await run(async () => {
      if (gig.saved) await api.unsaveGig(gigId)
      else await api.saveGig(gigId)
    })
  }

  const setStatus = async (status: 'open' | 'closed') => {
    await run(() => api.updateGigStatus(gigId, status).then(() => undefined), `Gig ${status}.`)
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

  const reportGig = async () => {
    const reason = prompt('Report this gig. Reason (spam, scam, inappropriate, other):')
    if (!reason || !reason.trim()) return
    const details = prompt('Additional details (optional):') || undefined
    setError(''); setNotice('')
    try {
      await api.report({ target_type: 'gig', target_id: gigId, reason: reason.trim(), details })
      setNotice('Report submitted. Our team will review it.')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const canWithdraw = useMemo(() => gig?.my_application_status === 'pending', [gig])

  if (loading) return <p className="text-center text-slate-500 py-10">Loading…</p>
  if (!gig) return <p className="text-center text-red-400 py-10">{error || 'Gig not found'}</p>

  const statusLabel = gig.status === 'in_progress' ? 'IN PROGRESS' : gig.status.toUpperCase()

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-slate-800">
      <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <Link to="/gigs" className="text-slate-400 hover:text-white text-sm">← Back to gigs</Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleSave} disabled={busy} className="text-sm text-amber-300 hover:text-amber-200">
            {gig.saved ? '🔖 Saved' : '🔖 Save'}
          </button>
          {!isPoster && (
            <button onClick={reportGig} className="text-sm text-slate-400 hover:text-amber-400">Report</button>
          )}
          <span className={`text-xs font-semibold rounded-full border px-2 py-0.5 ${collarStyles[gig.collar]}`}>
            {collarLabels[gig.collar]}
          </span>
        </div>
      </header>

      <div className="p-4 border-b border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-white">{gig.title}</h1>
          <span className={`text-xs font-bold border rounded-full px-2 py-0.5 ${statusStyle[gig.status] || statusStyle.closed}`}>
            {statusLabel}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-slate-400">
          {gig.location && <span>📍 {gig.location}</span>}
          {gig.pay && <span className="text-amber-300 font-semibold">{gig.pay}</span>}
          <span>{new Date(gig.created_at).toLocaleDateString()}</span>
          <span>{gig.applicant_count} {gig.applicant_count === 1 ? 'applicant' : 'applicants'}</span>
        </div>
        <p className="text-slate-300 mt-4 whitespace-pre-wrap">{gig.description}</p>
        {gig.hired_worker_id && (
          <p className="text-sm text-amber-300 mt-3">Hired worker: <Link className="underline" to={`/u/${gig.hired_worker_id}`}>@user #{gig.hired_worker_id}</Link></p>
        )}
      </div>

      {error && <p className="text-red-400 text-sm px-4 py-2">{error}</p>}
      {notice && <p className="text-emerald-400 text-sm px-4 py-2">{notice}</p>}

      {/* Hiring/completion actions for participants */}
      {isParticipant && gig.status === 'in_progress' && (
        <section className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white mb-2">Gig in progress</h2>
          <p className="text-sm text-slate-400 mb-3">When the job is done, both the poster and hired worker must confirm completion before ratings unlock.</p>
          <button
            disabled={busy}
            onClick={() => run(() => api.completeGig(gigId).then(() => undefined), 'Completion confirmed.')}
            className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 text-sm"
          >
            {busy ? '…' : 'Mark job as done'}
          </button>
        </section>
      )}

      {isParticipant && gig.status === 'completed' && (
        <section className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white mb-2">Gig completed — leave a rating</h2>
          {rated ? (
            <p className="text-sm text-emerald-400">Thanks, your rating was submitted.</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-300">Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rounded bg-slate-800 border border-slate-700 text-white px-2 py-1 text-sm">
                  {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                </select>
              </div>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Share feedback (optional)"
                className="w-full resize-none rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              />
              <button
                disabled={busy}
                onClick={() => run(async () => {
                  await api.rateGig(gigId, rating, ratingComment.trim() || undefined)
                  setRated(true)
                }, 'Rating submitted.')}
                className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 text-sm"
              >
                {busy ? '…' : 'Submit rating'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Poster view: applicants & management */}
      {isPoster ? (
        <section className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Applicants</h2>
            <div className="flex gap-2">
              {gig.status === 'open' && (
                <button disabled={busy} onClick={() => setStatus('closed')} className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-200">Close gig</button>
              )}
              {gig.status === 'closed' && (
                <button disabled={busy} onClick={() => setStatus('open')} className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-200">Reopen</button>
              )}
              <button disabled={busy} onClick={remove} className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs text-red-400">Delete</button>
            </div>
          </div>
          {!applicants || applicants.length === 0 ? (
            <p className="text-sm text-slate-500">No applications yet.</p>
          ) : (
            <ul className="space-y-3">
              {applicants.map((a) => (
                <li key={a.id} className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar username={a.username} avatar_url={a.avatar_url} size={40} />
                      <Link to={`/u/${a.id}`} className="font-semibold text-white hover:text-indigo-300">@{a.username}</Link>
                      <span className={`text-xs rounded-full px-2 py-0.5 border ${
                        a.status === 'accepted' ? 'text-emerald-300 border-emerald-500/30' :
                        a.status === 'rejected' ? 'text-red-400 border-red-500/30' :
                        'text-slate-300 border-slate-600'
                      }`}>{a.status}</span>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(a.applied_at).toLocaleDateString()}</span>
                  </div>
                  {a.bio && <p className="text-sm text-slate-400 mt-1">{a.bio}</p>}
                  {a.message && <p className="text-sm text-slate-300 mt-2 border-l-2 border-indigo-500 pl-2">{a.message}</p>}
                  {gig.status === 'open' && a.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button disabled={busy} onClick={() => run(() => api.acceptApplicant(gigId, a.id).then(() => undefined), `Hired @${a.username}.`)} className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5">Accept</button>
                      <button disabled={busy} onClick={() => run(() => api.rejectApplicant(gigId, a.id).then(() => undefined), `Rejected @${a.username}.`)} className="rounded-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3 py-1.5">Reject</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : gig.status === 'open' && isWorker ? (
        <section className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white mb-2">
            {gig.my_application_status === 'pending' ? 'Applied (pending)' :
             gig.my_application_status === 'accepted' ? 'You were hired!' :
             gig.my_application_status === 'rejected' ? 'Application not selected' :
             'Apply for this gig'}
          </h2>
          {gig.my_application_status === 'rejected' && (
            <p className="text-sm text-slate-400 mb-2">You can update your message and apply again.</p>
          )}
          {canWithdraw ? (
            <button disabled={busy} onClick={() => run(() => api.withdrawGig(gigId), 'Application withdrawn.')} className="rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-4 py-2 text-sm">
              {busy ? '…' : 'Withdraw application'}
            </button>
          ) : gig.my_application_status === 'accepted' ? (
            <p className="text-sm text-emerald-300">The poster selected you. Use messages to coordinate, then confirm completion when done.</p>
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
                <button disabled={busy} onClick={() => run(() => api.applyGig(gigId, message.trim() || undefined).then(() => undefined), 'Application sent!')} className="rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-1.5 text-sm">
                  {busy ? '…' : gig.my_application_status === 'rejected' ? 'Apply again' : 'Apply'}
                </button>
              </div>
            </>
          )}
        </section>
      ) : !isPoster && !isParticipant && user?.account_type === 'hirer' && gig.status === 'open' ? (
        <p className="p-4 text-sm text-slate-500 border-b border-slate-800">
          You're on a hirer profile — switch to a worker profile in <Link to="/settings" className="text-indigo-400 hover:underline">settings</Link> to apply.
        </p>
      ) : !isPoster && !isParticipant && (gig.status === 'in_progress' || gig.status === 'completed') ? (
        <p className="p-4 text-sm text-slate-500 border-b border-slate-800">
          {gig.status === 'in_progress' ? 'This gig is in progress.' : 'This gig has been completed.'}
        </p>
      ) : !isPoster && myAccepted && gig.status !== 'open' ? (
        <p className="p-4 text-sm text-emerald-300 border-b border-slate-800">You were hired for this gig.</p>
      ) : null}
    </div>
  )
}
