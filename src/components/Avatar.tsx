interface AvatarProps {
  username: string
  avatar_url?: string | null
  size?: number
  className?: string
}

/** Shared user avatar: serves the uploaded image, or initials as fallback. */
export default function Avatar({ username, avatar_url, size = 48, className = '' }: AvatarProps) {
  const base = `rounded-full shrink-0 flex items-center justify-center overflow-hidden border border-slate-700 bg-indigo-500/15 text-indigo-300 font-bold ${className}`
  const style = { width: size, height: size, fontSize: Math.max(12, Math.floor(size * 0.32)) }

  if (avatar_url) {
    return (
      <img
        src={avatar_url}
        alt={`@${username}`}
        width={size}
        height={size}
        className={`${base} object-cover`}
        style={style}
      />
    )
  }

  return (
    <div aria-hidden="true" className={base} style={style}>
      {username.slice(0, 2).toUpperCase()}
    </div>
  )
}
