import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { chatSocket } from '../lib/ws'
import NotificationsBell from './NotificationsBell'
import Avatar from './Avatar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) {
      setUnread(0)
      return
    }
    const load = async () => {
      try {
        const convs = await api.conversations()
        setUnread(convs.reduce((n, c) => n + c.unread_count, 0))
      } catch {
        /* transient */
      }
    }
    load()
    const interval = setInterval(load, 30000)
    const unsubscribe = chatSocket.subscribe((event) => {
      if (event.type === 'message' || event.type === 'read') load()
    })
    return () => {
      clearInterval(interval)
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to={user ? '/feed' : '/'} className="text-xl font-bold text-indigo-400">
          Hustle
        </Link>
        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <Link to="/feed" className="text-slate-300 hover:text-white">
              Feed
            </Link>
            <Link to="/gigs" className="text-slate-300 hover:text-white">
              Gigs
            </Link>
            <Link to="/people" className="text-slate-300 hover:text-white">
              People
            </Link>
            <NotificationsBell />
            <Link
              to="/messages"
              className="relative text-slate-300 hover:text-white"
            >
              Messages
              {unread > 0 && (
                <span className="absolute -top-2 -right-3 min-w-4 h-4 px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
            {user.is_admin && (
              <Link to="/admin" className="text-slate-300 hover:text-white">
                Admin
              </Link>
            )}
            <Link
              to={`/u/${user.id}`}
              className="flex items-center gap-2 text-slate-300 hover:text-white"
              aria-label={`Profile of @${user.username}`}
            >
              <Avatar username={user.username} avatar_url={user.avatar_url} size={34} />
              <span className="hidden lg:inline">@{user.username}</span>
            </Link>
            <Link to="/settings" className="text-slate-400 hover:text-white">
              Settings
            </Link>
            <button
              onClick={async () => {
                chatSocket.close()
                await logout()
                navigate('/login')
              }}
              className="text-slate-400 hover:text-white"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link to="/login" className="text-slate-300 hover:text-white">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-1.5"
            >
              Join free
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
