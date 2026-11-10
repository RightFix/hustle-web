import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { PaginatedUsers, StatsOut } from '../types'

const PER_PAGE = 20

export default function Admin() {
  const [stats, setStats] = useState<StatsOut | null>(null)
  const [users, setUsers] = useState<PaginatedUsers | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    api.adminStats().then(setStats).catch((err) => setError((err as Error).message))
  }, [])

  useEffect(() => {
    api
      .adminUsers(page, PER_PAGE)
      .then(setUsers)
      .catch((err) => setError((err as Error).message))
  }, [page])

  const totalPages = users ? Math.max(1, Math.ceil(users.total / users.per_page)) : 1

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Admin dashboard</h1>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3">
            <p className="text-slate-400 text-xs">Users</p>
            <p className="text-2xl font-bold text-white">{stats.user_count}</p>
          </div>
          <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3">
            <p className="text-slate-400 text-xs">Posts</p>
            <p className="text-2xl font-bold text-white">{stats.post_count}</p>
          </div>
        </div>
      )}
      <h2 className="text-lg font-semibold text-white mb-3">Users</h2>
      <div className="rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Username</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Admin</th>
            </tr>
          </thead>
          <tbody>
            {users?.items.map((u) => (
              <tr key={u.id} className="border-b border-slate-700/50 text-slate-200">
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">@{u.username}</td>
                <td className="px-3 py-2 truncate max-w-40">{u.email}</td>
                <td className="px-3 py-2">{u.is_admin ? 'yes' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-slate-200 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-slate-400">
          Page {page} of {totalPages} ({users?.total ?? 0} users)
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-slate-200 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
