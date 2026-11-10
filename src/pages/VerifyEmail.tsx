import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

/**
 * Email verification landing page. Handles both:
 *   /verify-email?sent=1   — freshly registered; show instructions
 *   /verify-email?token=…  — link from the email; verify inline
 */
export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const sent = searchParams.get('sent') === '1'
  const { user, refresh } = useAuth()
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'failed'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setState('working')
    api
      .verifyEmail(token)
      .then(async (res) => {
        if (cancelled) return
        setMessage(res.detail)
        setState('done')
        if (user) {
          try {
            await refresh()
          } catch {
            // the token is still valid even if refresh fails
          }
        }
      })
      .catch((err) => {
        if (cancelled) return
        setMessage((err as Error).message)
        setState('failed')
      })
    return () => {
      cancelled = true
    }
    // token never changes for a mounted link
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="max-w-sm mx-auto mt-20 px-4 text-center">
      <div className="text-6xl mb-4">✉️</div>
      <h1 className="text-2xl font-bold text-white">Verify your email</h1>

      {!token && (
        <>
          <p className="text-slate-300 mt-2">
            We sent a verification link to your inbox. It expires in 48 hours.
          </p>
          <p className="text-slate-500 text-sm mt-3">
            Click the link in the email, then come back here.
          </p>
          {user ? (
            <Link to="/feed" className="block mt-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2">
              Continue to feed (verification pending)
            </Link>
          ) : (
            <Link to="/login" className="block mt-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2">
              Log in
            </Link>
          )}
          {sent && <p className="text-emerald-400 text-xs mt-4">Verification email sent.</p>}
        </>
      )}

      {token && state === 'working' && (
        <p className="text-slate-400 mt-3 animate-pulse">Verifying…</p>
      )}

      {token && state === 'done' && (
        <>
          <p className="text-emerald-400 font-semibold mt-3">{message}</p>
          <Link
            to={user ? '/feed' : '/login'}
            className="block mt-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2"
          >
            {user ? 'Continue to feed' : 'Log in'}
          </Link>
        </>
      )}

      {token && state === 'failed' && (
        <>
          <p className="text-red-400 mt-3">{message}</p>
          <Link
            to={user ? '/settings' : '/login'}
            className="block mt-6 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-semibold py-2"
          >
            {user ? 'Request a new link from Settings' : 'Log in to request a new link'}
          </Link>
        </>
      )}
    </div>
  )
}
