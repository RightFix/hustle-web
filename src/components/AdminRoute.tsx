import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="text-center mt-20 text-slate-400">Loading…</div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (!user.is_admin) {
    return <Navigate to="/feed" replace />
  }
  return <>{children}</>
}
