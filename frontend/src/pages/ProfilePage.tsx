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

/**
 * Shares the design system introduced on LandingPage — add once, globally:
 * <link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
 */

const slab = { fontFamily: '"Zilla Slab", Georgia, serif' }
const sans = { fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif' }
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' }

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
    <div className="min-h-screen flex flex-col bg-[#15130F] text-[#EDE7DA] selection:bg-[#C97A2E]/30" style={sans}>
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-6">
        {/* Breadcrumb & heading */}
        <div className="space-y-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B8272] hover:text-[#F5F1E6] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F1E6]" style={slab}>
            Analyst account & security
          </h1>
          <p className="text-xs sm:text-sm text-[#B8AF9C]">
            Manage your forensic credentials, session tokens, and detection service configurations.
          </p>
        </div>

        {/* Identity card — paper surface, consistent with the console and auth screens */}
        <div className="rounded-sm bg-[#EDE6D3] text-[#201B12] p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C9BFA4]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-[#C97A2E] text-[#C97A2E] font-bold text-xl flex items-center justify-center" style={mono}>
                {userInitial}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#201B12] leading-tight" style={slab}>
                  {user?.full_name || 'Forensic Analyst'}
                </h2>
                <p className="text-xs text-[#6B6250] mt-0.5" style={mono}>{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-2.5 py-1 text-[11px] font-semibold border border-[#C97A2E] text-[#8A4E17]" style={mono}>
                {user?.role || 'ANALYST'}
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold border border-[#6B8F6A] text-[#4F7350] flex items-center gap-1.5" style={mono}>
                <CheckCircle2 className="w-3 h-3" /> Active session
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3.5 rounded border border-[#C9BFA4] bg-white/30">
              <div className="w-8 h-8 rounded-full border border-[#C97A2E]/50 flex items-center justify-center text-[#C97A2E] shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#8B8272] block" style={mono}>Full name</span>
                <span className="text-xs font-semibold text-[#201B12] truncate block">
                  {user?.full_name || 'Not configured'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded border border-[#C9BFA4] bg-white/30">
              <div className="w-8 h-8 rounded-full border border-[#C97A2E]/50 flex items-center justify-center text-[#C97A2E] shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#8B8272] block" style={mono}>Email address</span>
                <span className="text-xs font-semibold text-[#201B12] truncate block" style={mono}>
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded border border-[#C9BFA4] bg-white/30">
              <div className="w-8 h-8 rounded-full border border-[#C97A2E]/50 flex items-center justify-center text-[#C97A2E] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#8B8272] block" style={mono}>User UUID</span>
                <span className="text-xs text-[#4A4436] break-all block" style={mono}>{user?.id}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded border border-[#C9BFA4] bg-white/30">
              <div className="w-8 h-8 rounded-full border border-[#C97A2E]/50 flex items-center justify-center text-[#C97A2E] shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#8B8272] block" style={mono}>Provisioned date</span>
                <span className="text-xs font-semibold text-[#201B12] block" style={mono}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security token card */}
        <div className="rounded-sm bg-[#EDE6D3] text-[#201B12] p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#C97A2E]/50 flex items-center justify-center text-[#C97A2E] shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#201B12]" style={slab}>JWT bearer authorization token</h3>
                <p className="text-xs text-[#6B6250]">Cryptographically signed session credentials for API access.</p>
              </div>
            </div>

            <button
              onClick={handleCopyToken}
              disabled={!token}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#C9BFA4] bg-white/40 hover:bg-white/70 text-xs font-medium text-[#4A4436] transition-colors cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#4F7350]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy token'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded bg-[#1D1A14] border border-[#2C2820] text-xs text-[#B8AF9C] break-all leading-relaxed max-h-28 overflow-y-auto" style={mono}>
            {token || 'No active JWT session token found'}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#6B6250]" style={mono}>
            <Lock className="w-3 h-3" />
            <span>Tokens expire automatically after session duration. Store securely.</span>
          </div>
        </div>

        {/* Provider integrations */}
        <div className="rounded-sm bg-[#EDE6D3] text-[#201B12] p-6 sm:p-7 space-y-4">
          <h3 className="text-sm font-bold text-[#201B12] flex items-center gap-2" style={slab}>
            <Cpu className="w-4 h-4 text-[#C97A2E]" />
            Integrated AI provider engines
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              { name: 'SightEngine', status: 'Ready', copy: 'Deepfake face detection and AI image synthesis heuristics.' },
              { name: 'RealityDefender', status: 'Ready', copy: 'Multimodal synthetic audio and video frame temporal analysis.' },
              { name: 'Local ELA Engine', status: 'Active', copy: 'Pixel error level analysis and SHA-256 cryptographic hashing.' },
            ].map(({ name, status, copy }) => (
              <div key={name} className="p-3.5 rounded border border-[#C9BFA4] bg-white/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#201B12]">{name}</span>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 border ${
                      status === 'Active'
                        ? 'text-[#8A4E17] border-[#C97A2E]'
                        : 'text-[#4F7350] border-[#6B8F6A]'
                    }`}
                    style={mono}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6250]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}