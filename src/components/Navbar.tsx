import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-400">
          Hustle
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <Link
              to={`/u/${user.id}`}
              className="text-slate-300 hover:text-white"
            >
              @{user.username}
            </Link>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="text-slate-400 hover:text-white"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
