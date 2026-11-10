import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Gig } from '../types'
import { collarStyles } from '../lib/collars'

interface GigCardProps {
  gig: Gig
  onSavedChange?: (id: number, saved: boolean) => void
}

export default function GigCard({ gig, onSavedChange }: GigCardProps) {
  const [saved, setSaved] = useState(gig.saved ?? false)
  const [saveBusy, setSaveBusy] = useState(false)
  useEffect(() => setSaved(gig.saved ?? false), [gig.saved])

  const toggleSave = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setSaveBusy(true)
    try {
      if (saved) await api.unsaveGig(gig.id)
      else await api.saveGig(gig.id)
      const next = !saved
      setSaved(next)
      onSavedChange?.(gig.id, next)
    } finally {
      setSaveBusy(false)
    }
  }

  return (
    <Link
      to={`/gigs/${gig.id}`}
      className="block px-4 py-4 border-b border-slate-800 hover:bg-slate-900/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{gig.title}</p>
          <p className="text-sm text-slate-400 line-clamp-2 mt-1">{gig.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSave}
            disabled={saveBusy}
            title={saved ? 'Remove from saved gigs' : 'Save gig'}
            aria-label={saved ? 'Remove from saved gigs' : 'Save gig'}
            className={`text-lg leading-none px-1 ${saved ? 'text-amber-300' : 'text-slate-500 hover:text-amber-300'}`}
          >
            {saved ? '🔖' : '▫️'}
          </button>
          <span className={`shrink-0 text-xs font-semibold rounded-full border px-2 py-0.5 ${collarStyles[gig.collar]}`}>
            {gig.collar}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
        {gig.location && <span>📍 {gig.location}</span>}
        {gig.pay && <span className="text-amber-300 font-semibold">{gig.pay}</span>}
        <span>{new Date(gig.created_at).toLocaleDateString()}</span>
        <span>·</span>
        <span>
          {gig.applicant_count} {gig.applicant_count === 1 ? 'applicant' : 'applicants'}
        </span>
        {gig.status === 'closed' && (
          <span className="text-red-400 font-semibold">Closed</span>
        )}
        {gig.applied && (
          <span className="text-emerald-400 font-semibold">Applied ✓</span>
        )}
      </div>
    </Link>
  )
}
