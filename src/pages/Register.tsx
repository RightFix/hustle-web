import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const accountType = searchParams.get('type') === 'hirer' ? 'hirer' : 'worker'
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(email, username, password)
      navigate('/verify-email?sent=1', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 px-4">
      <h1 className="text-3xl font-bold text-center text-indigo-400 mb-2">Join Hustle</h1>
      <p className="text-center text-slate-400 text-sm mb-6">
        {accountType === 'hirer' ? 'Hire trusted hustlers near you.' : 'Show your skills. Get hired.'}
      </p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
        />
        <input
          required
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          disabled={busy}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2"
        >
          {busy ? '…' : 'Create account'}
        </button>
      </form>
      <p className="text-center text-slate-400 text-sm mt-4">
        Have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
