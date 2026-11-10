import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { chatSocket } from '../lib/ws'
import Avatar from '../components/Avatar'
import type { Conversation } from '../types'

function preview(c: Conversation): string {
  if (!c.last_message) return 'No messages yet'
  return c.last_message.body
}

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setConversations(await api.conversations())
      setError('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // live updates: any incoming message or read receipt refreshes the list
    const unsubscribe = chatSocket.subscribe((event) => {
      if (event.type === 'message' || event.type === 'read') load()
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <p className="text-center text-slate-500 py-10">Loading…</p>

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-slate-800">
      <header className="px-4 py-3 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">Messages</h1>
      </header>

      {error && <p className="text-red-400 text-sm px-4 py-2">{error}</p>}

      {conversations.length === 0 ? (
        <div className="text-center py-16 px-4">
          <p className="text-slate-400">No conversations yet.</p>
          <p className="text-sm text-slate-500 mt-2">
            Find someone on the{' '}
            <Link to="/gigs" className="text-indigo-400 hover:underline">
              gigs board
            </Link>{' '}
            or their profile and hit <strong>Message</strong> to start talking.
          </p>
        </div>
      ) : (
        <ul>
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                to={`/messages/${c.id}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 hover:bg-slate-900"
              >
                <Avatar username={c.other_user.username} avatar_url={c.other_user.avatar_url} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-white truncate">
                      @{c.other_user.username}
                    </span>
                    <span className="text-xs text-slate-500 shrink-0">
                      {new Date(c.updated_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm truncate ${
                        c.unread_count > 0 ? 'text-slate-200 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {c.last_message &&
                        c.last_message.sender_id === user?.id &&
                        'You: '}
                      {preview(c)}
                    </p>
                    {c.unread_count > 0 && (
                      <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
