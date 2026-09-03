import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Shield,
  UploadCloud,
  Activity,
  AlertTriangle,
  Cpu,
  BarChart3,
  Clock,
  ChevronDown,
  User,
  LogOut,
  Lock,
  Bell,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { MediaUploader } from '../components/MediaUploader'
import { MediaList } from '../components/MediaList'
import { ForensicCharts } from '../components/ForensicCharts'
import { mediaService } from '../services/mediaService'
import { analysisService } from '../services/analysisService'

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false)

  // Fetch user media files
  const {
    data: mediaFiles = [],
    isLoading: isLoadingList,
    refetch: refetchMedia,
  } = useQuery({
    queryKey: ['mediaList'],
    queryFn: mediaService.listMedia,
  })

  // Fetch user AI analyses
  const {
    data: analysesList = [],
    refetch: refetchAnalyses,
  } = useQuery({
    queryKey: ['analysesList'],
    queryFn: analysisService.listUserAnalyses,
  })

  // Calculate dynamic stats
  const totalAnalyses = analysesList.length
  const authenticCount = analysesList.filter((a) => a.label?.toLowerCase() === 'authentic').length
  const suspiciousCount = analysesList.filter(
    (a) => a.label?.toLowerCase() === 'suspicious' || a.label?.toLowerCase() === 'manipulated'
  ).length

  const avgConfidence =
    totalAnalyses > 0
      ? `${Math.round(
          (analysesList.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / totalAnalyses) *
            100
        )}%`
      : '62%'

  const handleInspectMedia = (mediaId: string) => {
    navigate(`/investigation/${mediaId}`)
  }

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await mediaService.deleteMedia(mediaId)
      toast.success('Media asset removed from workspace')
      queryClient.invalidateQueries({ queryKey: ['mediaList'] })
      queryClient.invalidateQueries({ queryKey: ['analysesList'] })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete media asset')
    }
  }

  const handleLogout = () => {
    logout()
    setProfileMenuOpen(false)
    navigate('/login')
  }

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Analyst'
  const userInitial = (user?.full_name ? user.full_name.charAt(0) : user?.email?.charAt(0) || 'A').toUpperCase()

  return (
    <div className="h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans antialiased overflow-hidden selection:bg-blue-500/30">
      {/* ========== TOP NAVIGATION BAR ========== */}
      <header className="shrink-0 h-16 border-b border-slate-800/80 bg-[#080d19]/90 backdrop-blur-xl z-20">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-4">
          {/* Left: Brand + Page Title */}
          <div className="flex items-center gap-5">
            <Link to="/dashboard" className="flex items-center gap-3 shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-sm shadow-blue-500/20">
                <div className="w-full h-full bg-[#090e1c] rounded-[7px] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-400 group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-[15px] font-semibold text-white tracking-tight leading-tight block">
                  DeepForensics
                </span>
                <span className="text-[9px] text-cyan-400 font-mono font-bold uppercase tracking-wider leading-none block mt-0.5">
                  STUDIO WORKSPACE
                </span>
              </div>
            </Link>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            {/* Breadcrumb / Location */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">Workspace</span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-semibold text-white">Overview</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold font-mono border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                LIVE
              </span>
            </div>
          </div>

          {/* Right: Actions + Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Upload Action */}
            <button
              onClick={() => setIsUploaderOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-xs shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Media</span>
            </button>

            {/* Refresh Queries */}
            <button
              onClick={() => {
                refetchMedia()
                refetchAnalyses()
                toast.success('Workspace telemetry refreshed')
              }}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Refresh Workspace"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute 1 top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-md bg-blue-500/15 text-cyan-300 font-semibold text-xs flex items-center justify-center font-mono border border-cyan-500/20">
                  {userInitial}
                </div>
                <span className="hidden md:block text-xs font-medium text-slate-200 max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0d1322] border border-slate-800 shadow-2xl py-1.5 z-50 divide-y divide-slate-800/70">
                  <div className="px-3.5 py-2.5">
                    <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase rounded bg-blue-500/15 text-cyan-300 border border-cyan-500/25">
                        {user?.role || 'ANALYST'}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Online
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      Account Settings
                    </Link>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========== SCROLLABLE MAIN CONTENT ========== */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-7">

          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Analyst Studio Overview
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-normal">
                Multi-modal forensic investigation workspace. Monitor model verdicts and inspect media provenance.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Session: Active</span>
              <span className="text-slate-700">•</span>
              <span className="text-slate-500">ISO 27037 Standard</span>
            </div>
          </div>

          {/* 4 Clean Minimalist Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="p-5 rounded-xl bg-[#0b101e] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono">
                  TOTAL ANALYSES
                </span>
                <div className="text-2xl font-bold text-white font-mono leading-none">
                  {totalAnalyses}
                </div>
                <span className="text-[11px] text-emerald-400 font-medium font-mono block">
                  +100% active stream
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-xl bg-[#0b101e] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  AUTHENTIC MEDIA
                </span>
                <div className="text-2xl font-bold text-white font-mono leading-none">
                  {authenticCount}
                </div>
                <span className="text-[11px] text-slate-400 font-mono block">Verified genuine assets</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-5 rounded-xl bg-[#0b101e] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider font-mono">
                  DEEPFAKES DETECTED
                </span>
                <div className="text-2xl font-bold text-white font-mono leading-none">
                  {suspiciousCount}
                </div>
                <span className="text-[11px] text-slate-400 font-mono block">Synthesized artifacts</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:text-red-300 transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-5 rounded-xl bg-[#0b101e] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                  AVG CONFIDENCE
                </span>
                <div className="text-2xl font-bold text-white font-mono leading-none">
                  {avgConfidence}
                </div>
                <span className="text-[11px] text-slate-400 font-mono block">Multi-model consensus</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="rounded-xl border border-slate-800 bg-[#0b101e] p-5 shadow-xs">
            <ForensicCharts analyses={analysesList} />
          </div>

          {/* Bottom Grid: Media Library & Right Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Area (2/3): Media Library */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    EVIDENCE MEDIA REPOSITORY
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {mediaFiles.length} Assets
                  </span>
                </div>

                <button
                  onClick={() => setIsUploaderOpen(true)}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>New Upload</span>
                </button>
              </div>

              <MediaList
                items={mediaFiles}
                onSelectMedia={handleInspectMedia}
                onDeleteMedia={handleDeleteMedia}
                onAddMedia={() => setIsUploaderOpen(true)}
                isLoading={isLoadingList}
              />
            </div>

            {/* Right Area (1/3): Recent AI Verdicts & Security */}
            <div className="xl:col-span-1 space-y-5">
              {/* Recent AI Verdicts Card */}
              <div className="p-5 rounded-xl bg-[#0b101e] border border-slate-800 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      RECENT AI VERDICTS
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Live feed</span>
                </div>

                {analysesList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">
                    No analyses executed yet. Upload media to begin inspection.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysesList.slice(0, 5).map((item, idx) => {
                      const fn = item.media_filename || 'Media Asset'
                      const isManip = item.label === 'manipulated'
                      const isAuth = item.label === 'authentic'
                      const confPct = Math.round((item.confidence || 0) * 100)

                      return (
                        <div
                          key={item.id || idx}
                          onClick={() => handleInspectMedia(item.media_id)}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/70 hover:border-slate-700 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                                isManip
                                  ? 'bg-red-500/10 text-red-400'
                                  : isAuth
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              <Cpu className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors"
                                title={fn}
                              >
                                {fn.length > 20 ? `${fn.slice(0, 18)}...` : fn}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {item.provider || 'realitydefender'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                isManip
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                                  : isAuth
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span className="text-xs text-slate-300 font-semibold">{confPct}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Active Session & Security Card */}
              <div className="p-5 rounded-xl bg-[#0b101e] border border-slate-800 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      SESSION SECURITY
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Encrypted ●
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 font-mono truncate text-xs">
                        {user?.email}
                      </p>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        Tier: {user?.role || 'ANALYST'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200 text-xs">
                          JWT Bearer Session
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25">
                          AUTH-V2
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        SHA-256 Protected Workspace
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <Link
                      to="/profile"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                    >
                      Manage Account & Tokens <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Media Uploader Modal */}
      <MediaUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['mediaList'] })
        }}
      />
    </div>
  )
}

