import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 px-4">
      <h1 className="text-3xl font-bold text-center text-indigo-400 mb-2">
        Forgot password
      </h1>
      {sent ? (
        <p className="text-center text-slate-300 text-sm mt-6">
          If an account with that email exists, a reset link has been sent.
          Check your inbox.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 mt-6">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            disabled={busy}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2"
          >
            {busy ? '…' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="text-center text-slate-400 text-sm mt-4">
        <Link to="/login" className="text-indigo-400 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  )
}
