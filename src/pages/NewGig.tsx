import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Collar } from '../types'

const collars: { id: Collar; label: string }[] = [
  { id: 'pink', label: 'Pink — care, retail, beauty' },
  { id: 'gray', label: 'Gray — tech, security, drivers' },
  { id: 'blue', label: 'Blue — building, moving, repair' },
  { id: 'green', label: 'Green — farms, solar, outdoors' },
]

export default function NewGig() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [collar, setCollar] = useState<Collar>('blue')
  const [location, setLocation] = useState('')
  const [pay, setPay] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user && user.account_type !== 'hirer') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-white font-semibold">Only hirer profiles can post gigs.</p>
        <Link
          to="/settings"
          className="inline-block mt-4 rounded-full bg-amber-400 text-slate-950 font-bold px-5 py-2 text-sm"
        >
          Switch to hirer profile
        </Link>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const gig = await api.createGig({
        title: title.trim(),
        description: description.trim(),
        collar,
        location: location.trim() || undefined,
        pay: pay.trim() || undefined,
      })
      navigate(`/gigs/${gig.id}`)
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-slate-800">
      <header className="px-4 py-3 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">Post a gig</h1>
        <p className="text-sm text-slate-400">
          Plain words work best — what, where, when, and pay.
        </p>
      </header>

      <form onSubmit={submit} className="p-4 flex flex-col gap-3">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="e.g. Weekend cook needed for small café"
          className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
        />

        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Describe the job: tasks, dates/times, anything workers should bring."
          className="resize-none rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
        />

        <div>
          <label className="text-sm font-semibold text-slate-300">Trade / collar</label>
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            {collars.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCollar(c.id)}
                className={`text-left text-sm rounded-lg border px-3 py-2 ${
                  collar === c.id
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={120}
            placeholder="Location (e.g. Ikeja, Lagos)"
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          <input
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            maxLength={60}
            placeholder="Pay (e.g. ₦5,000/day, negotiable)"
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            disabled={busy}
            className="rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold px-5 py-2 text-sm"
          >
            {busy ? '…' : 'Post gig'}
          </button>
          <Link
            to="/gigs"
            className="rounded-full border border-slate-700 hover:border-slate-500 text-slate-300 px-5 py-2 text-sm self-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
