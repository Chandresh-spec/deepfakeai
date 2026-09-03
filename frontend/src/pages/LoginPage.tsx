import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { Navbar } from '../components/Navbar'

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
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 relative">
        {/* Subtle grid and radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f60d_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative w-full max-w-md my-6">
          {/* Card Container */}
          <div className="p-8 sm:p-9 rounded-2xl bg-[#0b101e]/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3.5 text-blue-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Analyst Sign In</h1>
              <p className="text-xs text-slate-400 mt-1.5">
                Authenticate to access explainable forensic inspection and model telemetry.
              </p>
            </div>

            {/* Quick Demo Credentials helper */}
            <div className="mb-6 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Need test credentials?</span>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="px-2.5 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-cyan-400 font-mono text-[10px] font-semibold transition-colors"
              >
                Autofill Demo
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@forensics.ai"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Min 8 chars</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 focus:outline-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating Session...
                  </span>
                ) : (
                  <>
                    <span>Enter Forensic Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-7 text-center pt-5 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Don&apos;t have an authorized account?{' '}
                <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Register Account
                </Link>
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-5 text-center text-[11px] font-mono text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Token Custody • SHA-256 Integrity Seal</span>
          </div>
        </div>
      </main>
    </div>
  )
}

