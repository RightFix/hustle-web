import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { chatSocket } from '../lib/ws'
import type { NotificationItem } from '../types'

function describe(n: NotificationItem): { text: string; to: string } {
  const who = `@${n.actor.username}`
  const gigTo = n.ref_id ? `/gigs/${n.ref_id}` : '/gigs'
  switch (n.kind) {
    case 'follow':
      return { text: `${who} followed you`, to: `/u/${n.actor.id}` }
    case 'gig_apply':
      return { text: `${who} applied to your gig`, to: gigTo }
    case 'gig_accept':
      return { text: `${who} hired you for a gig`, to: gigTo }
    case 'gig_reject':
      return { text: `Your application was not selected`, to: gigTo }
    case 'gig_complete':
      return { text: `Gig completion update from ${who}`, to: gigTo }
    case 'gig_rating':
      return { text: `${who} left you a rating`, to: gigTo }
    case 'message':
      return { text: `${who} sent you a message`, to: n.ref_id ? `/messages/${n.ref_id}` : '/messages' }
    default:
      return { text: `${who} triggered an event`, to: '/' }
  }
}

function ago(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`
  return `${Math.floor(secs / 86400)}d`
}

export default function NotificationsBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    try {
      const page = await api.notifications(1, 10)
      setItems(page.items)
      setUnread(page.unread_count)
    } catch {
      /* transient */
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    const unsubscribe = chatSocket.subscribe((event) => {
      if (event.type === 'notification') load()
    })
    return () => {
      clearInterval(interval)
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const openItem = async (n: NotificationItem) => {
    const { to } = describe(n)
    if (!n.read_at) {
      try {
        await api.markNotificationRead(n.id)
      } catch {
        /* ignore */
      }
    }
    setOpen(false)
    navigate(to)
  }

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead()
      setItems((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })),
      )
      setUnread(0)
    } catch {
      /* ignore */
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative text-slate-300 hover:text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-2 -right-3 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-900 shadow-xl z-20 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-slate-500 px-3 py-4 text-center">
              Nothing yet. Follows, gig updates, ratings, and messages show up here.
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {items.map((n) => {
                const { text } = describe(n)
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => openItem(n)}
                      className={`w-full text-left px-3 py-2.5 border-b border-slate-800 hover:bg-slate-800 flex items-start gap-2 ${
                        n.read_at ? '' : 'bg-indigo-500/10'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                        {n.actor.username[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${
                            n.read_at ? 'text-slate-300' : 'text-white font-medium'
                          }`}
                        >
                          {text}
                        </p>
                        <p className="text-xs text-slate-500">{ago(n.created_at)}</p>
                      </div>
                      {!n.read_at && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
