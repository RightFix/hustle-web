import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import type { GalleryItem } from '../types'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024
const MAX_ITEMS = 30
const ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/webm'

function fmtSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Props {
  userId: number
  isSelf: boolean
}

export default function GallerySection({ userId, isSelf }: Props) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // upload state
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // lightbox state
  const [active, setActive] = useState<GalleryItem | null>(null)

  const load = async () => {
    try {
      setItems(await api.userGallery(userId))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active])

  const pickFile = (f: File | null) => {
    setError('')
    if (!f) return
    const isVideo = f.type.startsWith('video/')
    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (f.size > limit) {
      setError(
        isVideo
          ? 'Videos must be 50 MB or smaller'
          : 'Images must be 10 MB or smaller',
      )
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(f.type)) {
      setError('Only JPEG, PNG, WebP images or MP4/WebM videos are supported')
      return
    }
    setFile(f)
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      await api.uploadGalleryItem(file, caption.trim() || undefined)
      setFile(null)
      setCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const remove = async (item: GalleryItem) => {
    try {
      await api.deleteGalleryItem(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      if (active?.id === item.id) setActive(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const atLimit = items.length >= MAX_ITEMS

  return (
    <section className="p-4 border-b border-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">
          Work gallery{' '}
          <span className="text-sm font-normal text-slate-500">
            {items.length}/{MAX_ITEMS}
          </span>
        </h2>
        {isSelf && !atLimit && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            + Add work
          </button>
        )}
      </div>

      {isSelf && (
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          {file && (
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-200 truncate">
                  {file.name}{' '}
                  <span className="text-slate-500">({fmtSize(file.size)})</span>
                </span>
                <button
                  onClick={() => {
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={200}
                placeholder="Caption (optional) — e.g. “Kitchen repipe, Accra”"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              />
              <button
                onClick={upload}
                disabled={uploading}
                className="rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-1.5"
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          )}
          {atLimit && (
            <p className="text-xs text-slate-500 mt-2">
              Gallery is full — delete an item to add more.
            </p>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500 mt-3">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500 mt-3">
          {isSelf
            ? 'Show your best work — photos of jobs done, before/after shots, short clips.'
            : 'No work posted yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item)}
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-slate-700 hover:border-indigo-500 group"
            >
              {item.kind === 'image' ? (
                <img
                  src={item.url}
                  alt={item.caption ?? 'Work photo'}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={item.url}
                  muted
                  preload="metadata"
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              {item.kind === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-xl bg-black/30 group-hover:bg-black/20">
                  ▶
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-30 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActive(null)}
              className="absolute top-2 right-3 z-10 text-slate-300 hover:text-white text-xl"
              aria-label="Close"
            >
              ✕
            </button>
            {active.kind === 'image' ? (
              <img
                src={active.url}
                alt={active.caption ?? 'Work photo'}
                className="max-h-[70vh] w-full object-contain bg-black"
              />
            ) : (
              <video
                src={active.url}
                controls
                autoPlay
                className="max-h-[70vh] w-full bg-black"
              />
            )}
            <div className="p-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-200">
                  {active.caption || <span className="text-slate-500">No caption</span>}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(active.created_at).toLocaleDateString()} ·{' '}
                  {fmtSize(active.byte_size)}
                  {active.width && active.height
                    ? ` · ${active.width}×${active.height}`
                    : ''}
                  {active.duration_seconds
                    ? ` · ${active.duration_seconds}s`
                    : ''}
                </p>
              </div>
              {isSelf && (
                <button
                  onClick={() => remove(active)}
                  className="text-sm text-red-400 hover:text-red-300 shrink-0"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
