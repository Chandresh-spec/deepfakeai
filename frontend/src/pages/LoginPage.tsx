import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react'
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

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)
    try {
      await login({ email, password })
      toast.success('Analyst authenticated successfully')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Authentication failed. Please check your credentials.'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmail('analyst@forensics.ai')
    setPassword('forensics2026')
    toast.success('Demo credentials loaded')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#15130F] text-[#EDE7DA] selection:bg-[#C97A2E]/30" style={sans}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[repeating-linear-gradient(180deg,#EDE7DA_0px,#EDE7DA_1px,transparent_1px,transparent_3px)]" />

        <div className="relative w-full max-w-md my-6">
          {/* Case-file card — paper surface on the dark room, matching the console */}
          <div className="relative -rotate-1">
            <div className="absolute -top-3 left-10 w-10 h-3 bg-[#8B8272]/50 rotate-6 rounded-xs" />
            <div className="p-8 sm:p-9 rounded-sm bg-[#EDE6D3] text-[#201B12] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]">
              {/* Header */}
              <div className="text-center mb-7 pb-6 border-b border-[#C9BFA4]">
                <div className="w-11 h-11 rounded-full border-2 border-[#C97A2E] text-[#C97A2E] flex items-center justify-center mx-auto mb-3.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold text-[#201B12]" style={slab}>Analyst sign in</h1>
                <p className="text-xs text-[#6B6250] mt-1.5">
                  Authenticate to access forensic inspection and model telemetry.
                </p>
              </div>

              {/* Demo credentials helper */}
              <div className="mb-6 p-2.5 rounded border border-[#C9BFA4] bg-white/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-[#6B6250]" style={mono}>
                  <Sparkles className="w-3.5 h-3.5 text-[#C97A2E] shrink-0" />
                  <span>Need test credentials?</span>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="px-2.5 py-1 rounded bg-[#C97A2E]/10 hover:bg-[#C97A2E]/20 border border-[#C97A2E]/40 text-[#8A4E17] font-semibold text-[10px] transition-colors"
                  style={mono}
                >
                  Autofill demo
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6B6250] mb-1.5" style={mono}>
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B8272]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="analyst@forensics.ai"
                      className="w-full pl-10 pr-4 py-2.5 rounded bg-white/50 border border-[#C9BFA4] text-sm text-[#201B12] placeholder-[#A69C87] focus:outline-none focus:border-[#C97A2E] focus:ring-1 focus:ring-[#C97A2E]/40 transition-all"
                      style={mono}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6B6250]" style={mono}>
                      Password
                    </label>
                    <span className="text-[11px] text-[#8B8272]" style={mono}>Min 8 chars</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B8272]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded bg-white/50 border border-[#C9BFA4] text-sm text-[#201B12] placeholder-[#A69C87] focus:outline-none focus:border-[#C97A2E] focus:ring-1 focus:ring-[#C97A2E]/40 transition-all"
                      style={mono}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 rounded bg-[#C97A2E] hover:bg-[#E2924A] text-[#15130F] font-semibold text-xs focus:outline-none transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-[#15130F] border-t-transparent rounded-full animate-spin" />
                      Authenticating session...
                    </span>
                  ) : (
                    <>
                      <span>Enter forensic workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Register link */}
              <div className="mt-7 text-center pt-5 border-t border-[#C9BFA4]">
                <p className="text-xs text-[#6B6250]">
                  Don&apos;t have an authorized account?{' '}
                  <Link to="/register" className="font-semibold text-[#8A4E17] hover:text-[#C97A2E] transition-colors">
                    Register account
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="mt-6 text-center text-[11px] text-[#8B8272] flex items-center justify-center gap-2" style={mono}>
            <ShieldCheck className="w-3.5 h-3.5 text-[#6B8F6A]" />
            <span>Encrypted token custody, SHA-256 integrity seal</span>
          </div>
        </div>
      </main>
    </div>
  )
}