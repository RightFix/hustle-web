import type { Message, NotificationItem } from '../types'

type ServerEvent =
  | { type: 'message'; message: Message }
  | { type: 'notification'; notification: NotificationItem }
  | { type: 'read'; conversation_id: number }
  | { type: 'delivered'; conversation_id: number }
  | { type: 'typing'; conversation_id: number; user_id: number }
  | { type: 'error'; detail: string }
  | { type: 'pong' }

type Listener = (event: ServerEvent) => void

/**
 * Single shared chat socket (cookie-authenticated; browser sends cookies on
 * the WS handshake automatically). Auto-reconnects; listeners survive
 * reconnects.
 */
class ChatSocket {
  private ws: WebSocket | null = null
  private listeners = new Set<Listener>()
  private reconnectDelay = 1000
  private closedByUser = false

  connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return
    }
    this.closedByUser = false
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${proto}://${window.location.host}/api/ws`
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.reconnectDelay = 1000
      this.keepAlive()
    }
    this.ws.onmessage = (raw) => {
      try {
        const event = JSON.parse(raw.data as string) as ServerEvent
        this.listeners.forEach((fn) => fn(event))
      } catch {
        /* ignore malformed frames */
      }
    }
    this.ws.onclose = () => {
      this.ws = null
      if (!this.closedByUser) {
        setTimeout(() => this.connect(), this.reconnectDelay)
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 15000)
      }
    }
    this.ws.onerror = () => this.ws?.close()
  }

  private keepAlive() {
    const timer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      } else {
        clearInterval(timer)
      }
    }, 30000)
  }

  send(payload: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    }
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    this.connect()
    return () => this.listeners.delete(fn)
  }

  close() {
    this.closedByUser = true
    this.ws?.close()
    this.ws = null
  }
}

export const chatSocket = new ChatSocket()
