import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Shield, LayoutDashboard, User, LogOut, ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

interface HealthStatus {
  status: string
  version: string
  service: string
}

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    axios
      .get<HealthStatus>(`${API_URL}/health`)
      .then((res) => setHealth(res.data))
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/login')
  }

  const userInitial = (user?.full_name ? user.full_name.charAt(0) : user?.email?.charAt(0) || 'A').toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/70 bg-[#070b14]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-sm shadow-blue-500/20">
            <div className="w-full h-full bg-[#090e1c] rounded-[7px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold tracking-tight text-white group-hover:text-slate-200 transition-colors">
              DeepForensics
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
              v2.4
            </span>
          </div>
        </Link>

        {/* Center navigation links */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                location.pathname === '/dashboard'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                location.pathname === '/profile'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Settings
            </Link>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <a href="#demo" className="hover:text-white transition-colors">
              Live Inspector
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Capabilities
            </a>
            <a href="#pipeline" className="hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#trust" className="hover:text-white transition-colors">
              Benchmarks
            </a>
          </nav>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-3.5">
          {/* API Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                health
                  ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span>{health ? 'API Online' : 'Connecting…'}</span>
          </div>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-cyan-300 font-semibold text-[11px] flex items-center justify-center font-mono border border-cyan-500/20">
                  {userInitial}
                </div>
                <span className="hidden sm:block text-xs font-medium text-slate-200 max-w-[120px] truncate">
                  {user?.full_name || user?.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0d1322] border border-slate-800 shadow-2xl py-1.5 z-50 divide-y divide-slate-800/70">
                  <div className="px-3.5 py-2.5">
                    <p className="text-xs font-semibold text-white truncate">
                      {user?.full_name || 'Forensic Analyst'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase rounded bg-blue-500/15 text-cyan-300 border border-cyan-500/25">
                        {user?.role || 'ANALYST'}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Active
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      Account Settings
                    </Link>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-xs shadow-blue-500/25 transition-all flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
