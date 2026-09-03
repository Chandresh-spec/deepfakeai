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

/**
 * Shares the design system introduced on LandingPage — add once, globally:
 * <link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
 *
 * Note: this page keeps the dark "examination room" palette rather than the
 * paper "light table" surface used on the auth/profile pages, because it hosts
 * MediaList, ForensicCharts, and MediaUploader — components whose internal
 * styling isn't defined here, so a light paper background risks contrast
 * issues for content this file doesn't control. The same color and type
 * tokens (amber/brick/moss/steel, slab + mono) are used throughout instead.
 */

const slab = { fontFamily: '"Zilla Slab", Georgia, serif' }
const sans = { fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif' }
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' }

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
    <div className="h-screen flex flex-col bg-[#15130F] text-[#EDE7DA] antialiased overflow-hidden selection:bg-[#C97A2E]/30" style={sans}>
      {/* ========== TOP BAR ========== */}
      <header className="shrink-0 h-16 border-b border-[#2C2820] bg-[#1D1A14]/95 backdrop-blur-xl z-20">
        <div className="w-full max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: brand + breadcrumb */}
          <div className="flex items-center gap-5">
            <Link to="/dashboard" className="flex items-center gap-3 shrink-0 group">
              <div className="w-8 h-8 rounded border border-[#C97A2E]/50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#C97A2E]" />
              </div>
              <div className="hidden sm:block">
                <span className="text-[15px] font-semibold text-[#F5F1E6] tracking-tight leading-tight block" style={slab}>
                  DeepForensics
                </span>
                <span className="text-[9px] text-[#8B8272] tracking-wide leading-none block mt-0.5" style={mono}>
                  Studio workspace
                </span>
              </div>
            </Link>

            <div className="h-5 w-px bg-[#2C2820] hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#B8AF9C]">Workspace</span>
              <span className="text-[#4A4436]">/</span>
              <span className="text-xs font-semibold text-[#F5F1E6]">Overview</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6B8F6A]/10 text-[#8FB58E] font-semibold border border-[#6B8F6A]/25 flex items-center gap-1" style={mono}>
                <span className="w-1 h-1 rounded-full bg-[#8FB58E]" />
                Live
              </span>
            </div>
          </div>

          {/* Right: actions + profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploaderOpen(true)}
              className="px-3.5 py-1.5 rounded bg-[#C97A2E] hover:bg-[#E2924A] text-[#15130F] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload media</span>
            </button>

            <button
              onClick={() => {
                refetchMedia()
                refetchAnalyses()
                toast.success('Workspace telemetry refreshed')
              }}
              className="p-2 rounded border border-[#2C2820] hover:border-[#3A352A] text-[#8B8272] hover:text-[#F5F1E6] transition-colors"
              title="Refresh workspace"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button className="relative p-2 rounded border border-[#2C2820] hover:border-[#3A352A] text-[#8B8272] hover:text-[#F5F1E6] transition-colors">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C97A2E]" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded border border-[#2C2820] hover:border-[#3A352A] transition-all text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full border border-[#C97A2E]/60 text-[#C97A2E] font-semibold text-xs flex items-center justify-center" style={mono}>
                  {userInitial}
                </div>
                <span className="hidden md:block text-xs font-medium text-[#D8D0BE] max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B6250]" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-sm bg-[#EDE6D3] text-[#201B12] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] py-1.5 z-50 divide-y divide-[#C9BFA4]">
                  <div className="px-3.5 py-2.5">
                    <p className="text-xs font-semibold text-[#201B12] truncate">{displayName}</p>
                    <p className="text-[10px] text-[#6B6250] truncate" style={mono}>{user?.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-semibold border border-[#C97A2E] text-[#8A4E17]" style={mono}>
                        {user?.role || 'ANALYST'}
                      </span>
                      <span className="text-[10px] text-[#4F7350] flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Online
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#4A4436] hover:bg-white/40 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#C97A2E]" />
                      Account settings
                    </Link>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-[#B5493A] hover:bg-[#B5493A]/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========== SCROLLABLE CONTENT ========== */}
      <main className="flex-1 overflow-y-auto bg-[#100E0A]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">

          {/* Welcome header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#2C2820]">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5F1E6]" style={slab}>
                Analyst studio overview
              </h2>
              <p className="text-xs sm:text-sm text-[#B8AF9C]">
                Multi-modal forensic investigation workspace. Monitor model verdicts and inspect media provenance.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#8B8272]" style={mono}>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Session active
              </span>
              <span className="pl-3 border-l border-[#2C2820] text-[#6B6250]">ISO 27037 standard</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Total analyses', value: totalAnalyses, note: 'Active stream', icon: BarChart3, tone: 'amber' as const },
              { label: 'Authentic media', value: authenticCount, note: 'Verified genuine assets', icon: ShieldCheck, tone: 'moss' as const },
              { label: 'Deepfakes detected', value: suspiciousCount, note: 'Synthesized artifacts', icon: AlertTriangle, tone: 'brick' as const },
              { label: 'Avg confidence', value: avgConfidence, note: 'Multi-model consensus', icon: Activity, tone: 'steel' as const },
            ].map(({ label, value, note, icon: Icon, tone }) => {
              const toneMap = {
                amber: { text: 'text-[#C97A2E]', border: 'border-[#C97A2E]/25', bg: 'bg-[#C97A2E]/10' },
                moss: { text: 'text-[#8FB58E]', border: 'border-[#6B8F6A]/25', bg: 'bg-[#6B8F6A]/10' },
                brick: { text: 'text-[#D08573]', border: 'border-[#B5493A]/25', bg: 'bg-[#B5493A]/10' },
                steel: { text: 'text-[#9BC0D9]', border: 'border-[#5F84A0]/25', bg: 'bg-[#5F84A0]/10' },
              }[tone]

              return (
                <div key={label} className="p-5 rounded-sm bg-[#1D1A14] border border-[#2C2820] hover:border-[#3A352A] transition-all flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-[#8B8272] tracking-wide" style={mono}>
                      {label}
                    </span>
                    <div className="text-2xl font-bold text-[#F5F1E6] leading-none" style={mono}>
                      {value}
                    </div>
                    <span className="text-[11px] text-[#6B6250] block">{note}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${toneMap.border} ${toneMap.bg} ${toneMap.text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts */}
          <div className="rounded-sm border border-[#2C2820] bg-[#1D1A14] p-5">
            <ForensicCharts analyses={analysesList} />
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Media library */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xs font-semibold tracking-wide text-[#D8D0BE]" style={mono}>
                    Evidence media repository
                  </h3>
                  <span className="text-[10px] text-[#8B8272] bg-[#1D1A14] px-2 py-0.5 rounded border border-[#2C2820]" style={mono}>
                    {mediaFiles.length} assets
                  </span>
                </div>

                <button
                  onClick={() => setIsUploaderOpen(true)}
                  className="text-xs font-medium text-[#C97A2E] hover:text-[#E2924A] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>New upload</span>
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

            {/* Right column */}
            <div className="xl:col-span-1 space-y-5">
              {/* Recent verdicts */}
              <div className="p-5 rounded-sm bg-[#1D1A14] border border-[#2C2820] space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-[#2C2820]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#C97A2E]" />
                    <h3 className="text-xs font-semibold tracking-wide text-[#D8D0BE]" style={mono}>
                      Recent AI verdicts
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#6B6250]" style={mono}>Live feed</span>
                </div>

                {analysesList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#6B6250]" style={mono}>
                    No analyses executed yet. Upload media to begin inspection.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysesList.slice(0, 5).map((item, idx) => {
                      const fn = item.media_filename || 'Media Asset'
                      const isManip = item.label === 'manipulated'
                      const isAuth = item.label === 'authentic'
                      const confPct = Math.round((item.confidence || 0) * 100)

                      const stateTone = isManip
                        ? { text: 'text-[#D08573]', bg: 'bg-[#B5493A]/10', badgeBorder: 'border-[#B5493A]/30' }
                        : isAuth
                        ? { text: 'text-[#8FB58E]', bg: 'bg-[#6B8F6A]/10', badgeBorder: 'border-[#6B8F6A]/30' }
                        : { text: 'text-[#9BC0D9]', bg: 'bg-[#5F84A0]/10', badgeBorder: 'border-[#5F84A0]/30' }

                      return (
                        <div
                          key={item.id || idx}
                          onClick={() => handleInspectMedia(item.media_id)}
                          className="flex items-center justify-between gap-3 p-2.5 rounded bg-[#15130F]/60 hover:bg-[#15130F] border border-[#2C2820] hover:border-[#3A352A] cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${stateTone.bg} ${stateTone.text}`}>
                              <Cpu className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-xs font-semibold text-[#D8D0BE] truncate group-hover:text-[#F5F1E6] transition-colors"
                                title={fn}
                              >
                                {fn.length > 20 ? `${fn.slice(0, 18)}...` : fn}
                              </p>
                              <p className="text-[10px] text-[#6B6250]" style={mono}>
                                {item.provider || 'realitydefender'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0" style={mono}>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${stateTone.text} ${stateTone.bg} ${stateTone.badgeBorder}`}>
                              {item.label}
                            </span>
                            <span className="text-xs text-[#D8D0BE] font-semibold">{confPct}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Session security */}
              <div className="p-5 rounded-sm bg-[#1D1A14] border border-[#2C2820] space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-[#2C2820]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#C97A2E]" />
                    <h3 className="text-xs font-semibold tracking-wide text-[#D8D0BE]" style={mono}>
                      Session security
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#8FB58E] bg-[#6B8F6A]/10 px-2 py-0.5 rounded border border-[#6B8F6A]/25" style={mono}>
                    Encrypted
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-[#C97A2E] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#D8D0BE] truncate text-xs" style={mono}>
                        {user?.email}
                      </p>
                      <span className="text-[10px] text-[#6B6250]" style={mono}>
                        Tier: {user?.role || 'ANALYST'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <Lock className="w-4 h-4 text-[#9BC0D9] shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#D8D0BE] text-xs">
                          JWT bearer session
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#5F84A0]/10 text-[#9BC0D9] border border-[#5F84A0]/25" style={mono}>
                          AUTH-V2
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6B6250] block mt-0.5" style={mono}>
                        SHA-256 protected workspace
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2C2820]">
                    <Link
                      to="/profile"
                      className="text-xs font-semibold text-[#C97A2E] hover:text-[#E2924A] transition-colors inline-flex items-center gap-1"
                    >
                      Manage account & tokens <ArrowRight className="w-3 h-3" />
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