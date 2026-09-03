import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Mail,
  Shield,
  KeyRound,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  Lock,
  Cpu,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { Navbar } from '../components/Navbar'

export const ProfilePage: React.FC = () => {
  const { user, token } = useAuth()
  const [copied, setCopied] = useState(false)

  const handleCopyToken = () => {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopied(true)
    toast.success('JWT Bearer token copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const userInitial = (user?.full_name ? user.full_name.charAt(0) : user?.email?.charAt(0) || 'A').toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Top Breadcrumb & Heading */}
        <div className="space-y-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Analyst Account & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your forensic credentials, session tokens, and automated detection service configurations.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#0b101e] border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-mono font-bold text-xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-cyan-400/30">
                {userInitial}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {user?.full_name || 'Forensic Analyst'}
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase bg-blue-500/10 text-cyan-400 border border-cyan-500/25">
                {user?.role || 'ANALYST'}
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Active Session
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Full Name</span>
                <span className="text-xs font-semibold text-slate-200 truncate block">
                  {user?.full_name || 'Not configured'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Email Address</span>
                <span className="text-xs font-semibold font-mono text-slate-200 truncate block">
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">User UUID</span>
                <span className="text-xs font-mono text-slate-300 break-all block">{user?.id}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Provisioned Date</span>
                <span className="text-xs font-semibold text-slate-200 font-mono block">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Token Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#0b101e] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">JWT Bearer Authorization Token</h3>
                <p className="text-xs text-slate-400">Cryptographically signed session credentials for API access.</p>
              </div>
            </div>

            <button
              onClick={handleCopyToken}
              disabled={!token}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Token'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 break-all leading-relaxed max-h-28 overflow-y-auto">
            {token || 'No active JWT session token found'}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Tokens expire automatically after session duration. Store securely.</span>
          </div>
        </div>

        {/* Forensic Provider Integrations */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#0b101e] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            Integrated AI Provider Engines
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">SightEngine</span>
                <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Deepfake face detection & AI image synthesis heuristics.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">RealityDefender</span>
                <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Multimodal synthetic audio & video frame temporal analysis.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Local ELA Engine</span>
                <span className="text-[9px] font-mono font-bold uppercase text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Pixel error level analysis & SHA-256 cryptographic hashing.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

