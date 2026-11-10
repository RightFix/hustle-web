import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setBusy(true)
    try {
      await api.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <div className="max-w-sm mx-auto mt-20 px-4">
        <p className="text-center text-red-400 text-sm">
          This reset link is invalid. Request a new one{' '}
          <Link to="/forgot-password" className="text-indigo-400 hover:underline">
            here
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto mt-20 px-4">
      <h1 className="text-3xl font-bold text-center text-indigo-400 mb-2">
        New password
      </h1>
      {done ? (
        <p className="text-center text-slate-300 text-sm mt-6">
          Password updated.{' '}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Log in
          </Link>
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 mt-6">
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            required
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            disabled={busy}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2"
          >
            {busy ? '…' : 'Reset password'}
          </button>
        </form>
      )}
    </div>
  )
}
