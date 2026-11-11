import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { chatSocket } from '../lib/ws'
import Avatar from '../components/Avatar'
import type { Conversation, Message } from '../types'

export default function Thread() {
  const { id } = useParams<{ id: string }>()
  const conversationId = Number(id)
  const { user } = useAuth()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [peerTyping, setPeerTyping] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const seenIds = useRef<Set<number>>(new Set())
  const typingHideTimer = useRef<number | null>(null)
  const lastTypingSent = useRef(0)

  const loadHistory = async () => {
    try {
      const [convs, history] = await Promise.all([
        api.conversations(),
        api.conversationMessages(conversationId, 1, 100),
      ])
      const conv = convs.find((c) => c.id === conversationId)
      if (!conv) {
        setNotFound(true)
        return
      }
      setConversation(conv)
      // history is newest-first; display oldest-first
      const ordered = [...history].reverse()
      ordered.forEach((m) => seenIds.current.add(m.id))
      setMessages(ordered)
      await api.markRead(conversationId)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  useEffect(() => {
    loadHistory()
    const unsubscribe = chatSocket.subscribe((event) => {
      if (event.type === 'message' && event.message.conversation_id === conversationId) {
        const m = event.message
        if (!seenIds.current.has(m.id)) {
          seenIds.current.add(m.id)
          setMessages((prev) => [...prev, m])
          if (m.sender_id !== user?.id) {
            setPeerTyping(false)
            chatSocket.send({ type: 'read', conversation_id: conversationId })
          }
        }
      } else if (event.type === 'read' && event.conversation_id === conversationId) {
        // the other person read our messages
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === user?.id ? { ...m, read_at: m.read_at ?? new Date().toISOString() } : m,
          ),
        )
      } else if (event.type === 'delivered' && event.conversation_id === conversationId) {
        // our messages reached the other person's socket
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === user?.id && !m.delivered_at
              ? { ...m, delivered_at: new Date().toISOString() }
              : m,
          ),
        )
      } else if (
        event.type === 'typing' &&
        event.conversation_id === conversationId &&
        event.user_id !== user?.id
      ) {
        setPeerTyping(true)
        if (typingHideTimer.current) window.clearTimeout(typingHideTimer.current)
        typingHideTimer.current = window.setTimeout(() => setPeerTyping(false), 4000)
      } else if (event.type === 'error') {
        setError(event.detail)
      }
    })
    return () => {
      unsubscribe()
      if (typingHideTimer.current) window.clearTimeout(typingHideTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const send = () => {
    const body = draft.trim()
    if (!body) return
    setError('')
    chatSocket.send({ type: 'send', conversation_id: conversationId, body })
    // echo comes back over the socket; clear optimistically
    setDraft('')
  }

  const onDraftChange = (value: string) => {
    setDraft(value)
    if (!value.trim()) return
    // throttle: a fresh "typing" ping at most every 2s while the user types
    const now = Date.now()
    if (now - lastTypingSent.current > 2000) {
      lastTypingSent.current = now
      chatSocket.send({ type: 'typing', conversation_id: conversationId })
    }
  }

  if (notFound)
    return (
      <p className="text-center text-slate-500 py-10">
        Conversation not found.{' '}
        <Link to="/messages" className="text-indigo-400 hover:underline">
          Back to messages
        </Link>
      </p>
    )

  const blocked = Boolean(conversation && (conversation.is_blocked_by_me || conversation.is_blocked_by_them))

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-slate-800 flex flex-col">
      <header className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
        <Link to="/messages" className="text-slate-400 hover:text-white text-sm">
          ←
        </Link>
        {conversation ? (
          <Link
            to={`/u/${conversation.other_user.id}`}
            className="flex items-center gap-2 font-semibold text-white hover:underline"
          >
            <Avatar username={conversation.other_user.username} avatar_url={conversation.other_user.avatar_url} size={34} />
            @{conversation.other_user.username}
          </Link>
        ) : (
          <span className="font-semibold text-white">…</span>
        )}
      </header>

      {error && <p className="text-red-400 text-sm px-4 py-2">{error}</p>}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-slate-500 py-10">No messages yet. Say hello 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                  mine
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                }`}
              >
                {m.body}
                <div
                  className={`text-[10px] mt-1 ${
                    mine ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  {new Date(m.created_at).toLocaleString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {mine && (m.read_at ? ' · read' : m.delivered_at ? ' · delivered' : ' · sent')}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {peerTyping && conversation && !blocked && (
        <p className="px-4 pb-1 text-xs text-slate-500 animate-pulse">
          @{conversation.other_user.username} is typing…
        </p>
      )}

      {blocked ? (
        <div className="border-t border-slate-800 p-3 text-sm text-slate-400">
          {conversation?.is_blocked_by_me
            ? 'You blocked this user. Unblock them from their profile to send messages.'
            : 'You can’t message this user.'}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="border-t border-slate-800 p-3 flex gap-2"
        >
          <input
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            maxLength={2000}
            placeholder="Type a message…"
            className="flex-1 rounded-full bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold px-5"
          >
            Send
          </button>
        </form>
      )}
    </div>
  )
}
