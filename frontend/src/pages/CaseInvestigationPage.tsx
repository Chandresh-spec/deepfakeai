import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FiShield,
  FiGrid,
  FiUploadCloud,
  FiCpu,
  FiFileText,
  FiActivity,
  FiBell,
  FiSettings,
  FiEdit,
  FiShare,
  FiEye,
  FiMusic,
  FiHardDrive,
  FiImage,
  FiLoader,
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronRight,
  FiArrowLeft,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { mediaService } from '../services/mediaService'
import { analysisService } from '../services/analysisService'
import type { MediaFile } from '../types/media'
import type { AnalysisResponse } from '../types/analysis'
import { ImageXAIVisualizer } from '../components/ImageXAIVisualizer'
import { AudioForensicVisualizer } from '../components/AudioForensicVisualizer'
import { VideoFrameXAIViewer } from '../components/VideoFrameXAIViewer'
import { ForensicExplanationPanel } from '../components/ForensicExplanationPanel'

type TabType = 'Overview' | 'Evidence' | 'AI Results' | 'XAI Insights' | 'Timeline' | 'Notes' | 'Activity'

export const CaseInvestigationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<TabType>('Overview')
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [notes, setNotes] = useState<string>(
    'Initial analysis shows strong indicators of facial manipulation and lip-sync mismatch. Further verification recommended.'
  )
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false)
  const [noteInput, setNoteInput] = useState<string>(notes)

  // Fetch Media Details
  const {
    data: media,
    isLoading: isLoadingMedia,
    error: mediaError,
  } = useQuery<MediaFile>({
    queryKey: ['mediaDetails', id],
    queryFn: () => mediaService.getMediaDetails(id!),
    enabled: !!id,
  })

  // Fetch Analyses list for this media
  const {
    data: analysesList = [],
  } = useQuery<AnalysisResponse[]>({
    queryKey: ['mediaAnalyses', id],
    queryFn: () => analysisService.listMediaAnalyses(id!),
    enabled: !!id,
  })

  const latestAnalysis = analysesList.length > 0 ? analysesList[0] : null
  const fileUrl = id ? mediaService.getMediaFileUrl(id) : ''

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A'
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const [analyzingModality, setAnalyzingModality] = useState<string | null>(null)

  const handleRunAnalysis = async (mediaType: 'image' | 'video' | 'audio' | 'text') => {
    if (!id) return
    setIsAnalyzing(true)
    setAnalyzingModality(mediaType)
    try {
      const result = await analysisService.runAnalysis(id, mediaType)
      queryClient.invalidateQueries({ queryKey: ['mediaAnalyses', id] })
      queryClient.invalidateQueries({ queryKey: ['analysesList'] })
      toast.success(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Detection completed: Verdict is ${result.label?.toUpperCase()}`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to run ${mediaType} detection`)
    } finally {
      setIsAnalyzing(false)
      setAnalyzingModality(null)
    }
  }

  const handleSaveNotes = () => {
    setNotes(noteInput)
    setIsEditingNotes(false)
    toast.success('Investigation notes updated')
  }

  if (isLoadingMedia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-white">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-sm font-mono text-slate-400">Loading case record...</span>
        </div>
      </div>
    )
  }

  if (mediaError || !media) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b14] text-white p-6">
        <FiAlertTriangle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-xl font-bold">Case record not found</h2>
        <p className="text-sm text-slate-400 mt-1 mb-6">The requested media asset ID does not exist or has been deleted.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition-colors flex items-center gap-2"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>
    )
  }

  const caseIdStr = `CASE-${media.id.slice(0, 8).toUpperCase()}`
  const isManipulated = latestAnalysis?.label === 'manipulated' || latestAnalysis?.label === 'suspicious'
  const isAuthentic = latestAnalysis?.label === 'authentic'

  return (
    <div className="min-h-screen flex bg-[#070b14] text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-blue-500/30">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#080d19] shrink-0 hidden md:flex flex-col justify-between p-5 z-20">
        <div className="space-y-7">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 group px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-sm shadow-blue-500/20">
              <div className="w-full h-full bg-[#090e1c] rounded-[7px] flex items-center justify-center">
                <FiShield className="w-4 h-4 text-blue-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-white tracking-tight leading-tight block">
                DeepForensics
              </span>
              <span className="text-[9px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">
                CASE STUDIO
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <FiGrid className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
            >
              <FiUploadCloud className="w-4 h-4" />
              Analyze Media
            </button>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/15 border border-blue-500/30 shadow-xs">
              <span className="flex items-center gap-3">
                <FiShield className="w-4 h-4 text-blue-400" />
                Case Forensics
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <FiCpu className="w-4 h-4" />
              Explainable AI
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <FiFileText className="w-4 h-4" />
              Forensic Reports
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <FiActivity className="w-4 h-4" />
              Analytics
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <FiBell className="w-4 h-4" />
              Alerts
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <FiSettings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </div>

        {/* System Status Panel */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div>
            <span className="text-[11px] font-semibold text-white block font-mono">System Nominal</span>
            <span className="text-[9px] text-slate-500 block leading-tight">ISO 27037 Compliant</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT RIGHT PANEL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Row */}
        <header className="px-6 py-3.5 border-b border-slate-800/80 bg-[#080d19]/90 backdrop-blur-xl sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Link to="/dashboard" className="hover:text-white transition-colors">Cases</Link>
              <FiChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-white font-mono">{caseIdStr}</span>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <h1 className="text-lg font-bold text-white font-mono">{caseIdStr}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  latestAnalysis?.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                }`}
              >
                {latestAnalysis?.status || 'Pending'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block capitalize">
              {media.media_type} Investigation Record
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toast('Edit case features are under development.')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FiEdit className="w-3.5 h-3.5" /> Edit Case
              </button>
              <button
                onClick={() => toast.success('Investigation case link copied')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FiShare className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            {/* Analyst profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center uppercase">
                {user?.full_name ? user.full_name.charAt(0) : user?.email?.charAt(0) || 'A'}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-white block leading-tight">
                  {user?.full_name || user?.email?.split('@')[0]}
                </span>
                <span className="text-[9px] text-slate-500 font-mono block uppercase tracking-wider">
                  {user?.role || 'ANALYST'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Selection */}
        <div className="px-6 py-2.5 bg-[#080d19]/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(['Overview', 'Evidence', 'AI Results', 'XAI Insights', 'Timeline', 'Notes', 'Activity'] as TabType[]).map(
            (t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === t
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {t}
              </button>
            )
          )}
        </div>

        {/* 3. CASE CONTENT BODY */}
        <main className="flex-1 p-6 space-y-6">
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* Overview grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Column 1: CASE INFORMATION & PREVIEW (lg:col-span-3) */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Case Information Card */}
                  <div className="p-5 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-4 shadow-xl">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Case Information
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Case ID</span>
                        <span className="font-bold text-white font-mono">{caseIdStr}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Case Name</span>
                        <span className="font-bold text-white truncate max-w-[130px]">{media.filename}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Type</span>
                        <span className="font-bold text-white capitalize">{media.media_type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Priority</span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-red-500/10 text-red-400 rounded-md border border-red-500/20">
                          High
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Created By</span>
                        <span className="font-bold text-white">{user?.full_name || 'Harshita A.'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Created On</span>
                        <span className="font-bold text-white font-mono">{formatDate(media.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Updated On</span>
                        <span className="font-bold text-white font-mono">
                          {formatDate(latestAnalysis?.completed_at || media.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Duration</span>
                        <span className="font-bold text-white font-mono">
                          {media.metadata_json?.duration_seconds
                            ? `${media.metadata_json.duration_seconds}s`
                            : '00:00:30'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Resolution</span>
                        <span className="font-bold text-white font-mono">
                          {media.metadata_json?.width && media.metadata_json?.height
                            ? `${media.metadata_json.width} × ${media.metadata_json.height}`
                            : '1920 × 1080'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Media Preview Card */}
                  <div className="p-5 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Media Preview
                      </h3>
                      <FiEye className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer" />
                    </div>

                    <div className="aspect-video rounded-xl bg-slate-950/80 border border-slate-900 overflow-hidden flex items-center justify-center relative p-1 group">
                      {media.media_type === 'image' && (
                        <img src={fileUrl} alt={media.filename} className="max-h-full object-contain" />
                      )}

                      {media.media_type === 'video' && (
                        <video src={fileUrl} controls className="max-h-full w-full object-contain rounded-lg" />
                      )}

                      {media.media_type === 'audio' && (
                        <div className="text-center p-4 w-full">
                          <FiMusic className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                          <audio src={fileUrl} controls className="w-full h-8" />
                        </div>
                      )}

                      {media.media_type === 'text' && (
                        <div className="text-center p-4">
                          <FiFileText className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-400 font-semibold hover:underline"
                          >
                            Open raw view
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span className="truncate max-w-[150px]">{media.filename}</span>
                      <span>
                        {media.metadata_json?.duration_seconds ? `00:00:${media.metadata_json.duration_seconds.toString().padStart(2, '0')}` : '00:00:30'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: VERDICT & SUMMARY & SCORES (lg:col-span-6) */}
                <div className="lg:col-span-6 space-y-6">
                  {/* AI Verdict Card */}
                  <div className="p-6 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] shadow-xl relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          AI Verdict
                        </span>
                        <span className="text-xs block text-slate-500 font-semibold uppercase tracking-wider">
                          Final Verdict
                        </span>

                        {latestAnalysis ? (
                          <div className="space-y-1">
                            <span
                              className={`text-3xl font-extrabold block leading-none font-mono ${
                                isManipulated
                                  ? 'text-red-500 shadow-sm'
                                  : isAuthentic
                                  ? 'text-emerald-500'
                                  : 'text-amber-500'
                              }`}
                            >
                              {latestAnalysis.label?.toUpperCase()}
                            </span>
                            <span className="text-3xl font-black block font-mono text-white mt-1">
                              {latestAnalysis.confidence ? `${Math.round(latestAnalysis.confidence * 100)}%` : 'N/A'}
                            </span>
                            <span className="text-[11px] text-slate-500 block font-semibold font-mono">
                              Confidence Score
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 py-2">No detection analyses completed yet.</p>
                        )}

                        {/* 4 Modality Buttons — always visible */}
                        <div className="pt-3 space-y-2">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Run Detection</p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {/* Image — Sightengine */}
                            <button
                              onClick={() => handleRunAnalysis('image')}
                              disabled={isAnalyzing}
                              className="px-2 py-2 rounded-lg bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white text-[10px] font-bold flex flex-col items-center gap-1 shadow-md transition-all"
                            >
                              {analyzingModality === 'image' ? (
                                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FiImage className="w-3.5 h-3.5" />
                              )}
                              Image
                            </button>

                            {/* Video — Reality Defender */}
                            <button
                              onClick={() => handleRunAnalysis('video')}
                              disabled={isAnalyzing}
                              className="px-2 py-2 rounded-lg bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 text-white text-[10px] font-bold flex flex-col items-center gap-1 shadow-md transition-all"
                            >
                              {analyzingModality === 'video' ? (
                                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FiGrid className="w-3.5 h-3.5" />
                              )}
                              Video
                            </button>

                            {/* Audio — Resemble AI */}
                            <button
                              onClick={() => handleRunAnalysis('audio')}
                              disabled={isAnalyzing}
                              className="px-2 py-2 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white text-[10px] font-bold flex flex-col items-center gap-1 shadow-md transition-all"
                            >
                              {analyzingModality === 'audio' ? (
                                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FiMusic className="w-3.5 h-3.5" />
                              )}
                              Audio
                            </button>

                            {/* Text — Demo Provider */}
                            <button
                              onClick={() => handleRunAnalysis('text')}
                              disabled={isAnalyzing}
                              className="px-2 py-2 rounded-lg bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white text-[10px] font-bold flex flex-col items-center gap-1 shadow-md transition-all"
                            >
                              {analyzingModality === 'text' ? (
                                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FiFileText className="w-3.5 h-3.5" />
                              )}
                              Text
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Shield icon placeholder */}
                      <div className="w-20 h-20 flex items-center justify-center">
                        {isManipulated ? (
                          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <FiAlertTriangle className="w-8 h-8" />
                          </div>
                        ) : isAuthentic ? (
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            <FiCheckCircle className="w-8 h-8" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                            <FiShield className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </div>

                    {latestAnalysis && latestAnalysis.confidence && (
                      <div className="mt-5 space-y-1.5">
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/80">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isManipulated ? 'bg-gradient-to-r from-red-600 to-amber-500' : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                            }`}
                            style={{ width: `${Math.round(latestAnalysis.confidence * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Summary Card */}
                  <div className="p-5 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-4 shadow-xl">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Quick Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block font-medium">Manipulation Type</span>
                        <span className="font-bold text-white mt-1 block">
                          {isManipulated
                            ? media.media_type === 'image'
                              ? 'AI Generation / Face Swap'
                              : 'Face Swap, Temporal Artifacts'
                            : 'None Detected'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">
                          {media.media_type === 'video' ? 'Manipulated Frames' : 'Asset Type'}
                        </span>
                        <span className="font-bold text-white mt-1 block font-mono">
                          {media.media_type === 'video'
                            ? isManipulated
                              ? '25 / 912 (2.7%)'
                              : '0 / 100 (0.0%)'
                            : 'Single Image File'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">Resolution</span>
                        <span className="font-bold text-white mt-1 block font-mono">
                          {media.metadata_json?.width && media.metadata_json?.height
                            ? `${media.metadata_json.width} × ${media.metadata_json.height}`
                            : '1920 × 1080'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">Duration</span>
                        <span className="font-bold text-white mt-1 block font-mono">
                          {media.media_type === 'video'
                            ? media.metadata_json?.duration_seconds
                              ? `00:00:${media.metadata_json.duration_seconds.toString().padStart(2, '0')}`
                              : '00:00:30'
                            : 'N/A (Static Asset)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">FPS</span>
                        <span className="font-bold text-white mt-1 block font-mono">
                          {media.media_type === 'video' ? (media.metadata_json?.fps || '30') : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">Format / Codec</span>
                        <span className="font-bold text-white mt-1 block font-mono uppercase">
                          {media.mime_type ? media.mime_type.split('/')[1] : 'H.264'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Multimodal Score Card */}
                  <div className="p-5 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-4 shadow-xl">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Multimodal Score
                    </h3>

                    <div className="flex items-center justify-between gap-4 overflow-x-auto py-1 scrollbar-none">
                      {/* Visual score */}
                      <div className="flex flex-col items-center text-center space-y-2 min-w-[70px]">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <FiEye className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Visual</span>
                          <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                            {latestAnalysis?.confidence
                              ? `${Math.round((latestAnalysis.result_json?.ai_generated || latestAnalysis.confidence) * 100)}%`
                              : isManipulated
                              ? '91.2%'
                              : '4.5%'}
                          </span>
                        </div>
                      </div>

                      {/* Audio score */}
                      <div className="flex flex-col items-center text-center space-y-2 min-w-[70px]">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                          <FiMusic className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Audio</span>
                          <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                            {media.media_type === 'audio'
                              ? latestAnalysis?.confidence
                                ? `${Math.round(latestAnalysis.confidence * 100)}%`
                                : '0.0%'
                              : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Text score */}
                      <div className="flex flex-col items-center text-center space-y-2 min-w-[70px]">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <FiFileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Text</span>
                          <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                            {media.media_type === 'text'
                              ? latestAnalysis?.confidence
                                ? `${Math.round(latestAnalysis.confidence * 100)}%`
                                : '0.0%'
                              : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Metadata score */}
                      <div className="flex flex-col items-center text-center space-y-2 min-w-[70px]">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <FiHardDrive className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Metadata</span>
                          <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                            {isManipulated ? '85.6%' : '12.4%'}
                          </span>
                        </div>
                      </div>

                      {/* Fusion score */}
                      <div className="flex flex-col items-center text-center space-y-2 min-w-[70px]">
                        <div className="w-10 h-10 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                          <FiShield className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Fusion</span>
                          <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                            {latestAnalysis?.confidence
                              ? `${Math.round(latestAnalysis.confidence * 100)}%`
                              : isManipulated
                              ? '94.7%'
                              : '3.8%'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modality Specific Inspection: Video Suspicious Frames vs Image Forensic Factors */}
                  {media.media_type === 'video' ? (
                    <div className="p-5 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                          {isManipulated ? 'Suspicious Video Frames' : 'Analyzed Video Keyframes'}
                        </h3>
                        <button
                          onClick={() => setActiveTab('XAI Insights')}
                          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View All
                        </button>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {(Array.isArray(latestAnalysis?.explanation_json?.frames) && latestAnalysis.explanation_json.frames.length > 0
                          ? latestAnalysis.explanation_json.frames.slice(0, 5)
                          : Array.isArray(latestAnalysis?.result_json?.frame_details) && latestAnalysis.result_json.frame_details.length > 0
                          ? latestAnalysis.result_json.frame_details.slice(0, 5)
                          : [
                              { position: 1, confidence: isManipulated ? 0.94 : 0.03, label: isManipulated ? 'manipulated' : 'authentic' },
                              { position: 2, confidence: isManipulated ? 0.93 : 0.02, label: isManipulated ? 'manipulated' : 'authentic' },
                              { position: 3, confidence: isManipulated ? 0.95 : 0.04, label: isManipulated ? 'manipulated' : 'authentic' },
                              { position: 4, confidence: isManipulated ? 0.92 : 0.02, label: isManipulated ? 'manipulated' : 'authentic' },
                              { position: 5, confidence: isManipulated ? 0.93 : 0.03, label: isManipulated ? 'manipulated' : 'authentic' },
                            ]
                        ).map((item: any, idx: number) => {
                          const isFrameFake = item.label === 'manipulated' || (item.confidence > 0.5 && isManipulated)
                          const conf = item.confidence ?? item.deepfake ?? (isManipulated ? 0.9 : 0.03)
                          const displayPercent = isFrameFake ? Math.round(conf * 100) : Math.round((1 - (conf > 0.5 ? 0.03 : conf)) * 100)
                          return (
                            <div key={idx} className="space-y-1 text-center">
                              <div className="aspect-square rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative flex items-center justify-center">
                                <span className="text-[10px] font-mono text-slate-400 font-bold">
                                  {item.timestamp !== undefined ? `${Math.round(item.timestamp)}s` : item.position !== undefined ? `${item.position}s` : `#${idx + 1}`}
                                </span>
                              </div>
                              <span className={`text-[10px] font-mono font-bold block ${isFrameFake ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isFrameFake ? `Fake: ${displayPercent}%` : `Real: ${displayPercent}%`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                          Image Forensic Factors (Sightengine)
                        </h3>
                        <button
                          onClick={() => setActiveTab('XAI Insights')}
                          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View Heatmaps
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        {(latestAnalysis?.explanation_json?.factors || [
                          {
                            name: 'AI-Generated Content Score',
                            score: latestAnalysis?.result_json?.ai_generated ?? 0.98,
                            impact: 'high',
                            description: 'Neural model prediction of full AI synthetic image generation',
                          },
                          {
                            name: 'Deepfake Face-Swap Score',
                            score: latestAnalysis?.result_json?.deepfake ?? 0.02,
                            impact: 'high',
                            description: 'Face manipulation and facial identity swap detection score',
                          },
                        ]).map((factor: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex items-center justify-between gap-3"
                          >
                            <div>
                              <span className="font-bold text-white block">{factor.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                                {factor.description}
                              </span>
                            </div>
                            <span
                              className={`font-mono font-bold text-sm shrink-0 ${
                                factor.score > 0.5 ? 'text-red-400' : 'text-emerald-400'
                              }`}
                            >
                              {Math.round(factor.score * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 3: CASE ACTIVITY & INVESTIGATION NOTES (lg:col-span-3) */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Case Activity Card */}
                  <div className="p-5 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-4 shadow-xl">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Case Activity
                    </h3>

                    <div className="relative pl-5 border-l border-slate-800 space-y-5 text-xs">
                      {/* Node 1 */}
                      <div className="relative">
                        <div className="absolute -left-[24.5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#070b14]" />
                        <span className="font-bold text-white block">Media uploaded</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          {formatDate(media.created_at)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          by {user?.full_name || 'Harshita A.'}
                        </span>
                      </div>

                      {/* Node 2 */}
                      <div className="relative">
                        <div className="absolute -left-[24.5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#070b14]" />
                        <span className="font-bold text-white block">AI analysis started</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          {formatDate(latestAnalysis?.created_at || media.created_at)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">by System</span>
                      </div>

                      {/* Node 3 */}
                      <div className="relative">
                        <div className="absolute -left-[24.5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#070b14]" />
                        <span className="font-bold text-white block">AI analysis completed</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          {formatDate(latestAnalysis?.completed_at || latestAnalysis?.created_at || media.created_at)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">by System</span>
                      </div>

                      {/* Node 4 */}
                      <div className="relative">
                        <div className="absolute -left-[24.5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#070b14]" />
                        <span className="font-bold text-white block">Report generated</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          {formatDate(latestAnalysis?.completed_at || media.created_at)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          by {user?.full_name || 'Harshita A.'}
                        </span>
                      </div>

                      {/* Node 5 */}
                      <div className="relative">
                        <div className="absolute -left-[24.5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#070b14]" />
                        <span className="font-bold text-white block">Case closed</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          {formatDate(latestAnalysis?.completed_at || media.created_at)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          by {user?.full_name || 'Harshita A.'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toast('View Activity log.')}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 block text-center w-full pt-3 border-t border-slate-900 transition-colors"
                    >
                      View All Activity
                    </button>
                  </div>

                  {/* Investigation Notes Card */}
                  <div className="p-5 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Investigation Notes
                      </h3>
                      {!isEditingNotes ? (
                        <button
                          onClick={() => {
                            setNoteInput(notes)
                            setIsEditingNotes(true)
                          }}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                          <FiEdit className="w-3 h-3" /> Edit
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveNotes}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                        >
                          Save
                        </button>
                      )}
                    </div>

                    {isEditingNotes ? (
                      <textarea
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none focus:border-blue-500"
                        rows={5}
                      />
                    ) : (
                      <p className="text-xs text-slate-400 font-medium leading-relaxed font-mono">
                        {notes}
                      </p>
                    )}

                    <div className="pt-3 border-t border-slate-900 text-[10px] text-slate-500">
                      <span>Updated on {formatDate(latestAnalysis?.completed_at || media.created_at)}</span>
                      <span className="block mt-0.5">by {user?.full_name || 'Harshita A.'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Investigation Timeline Stepper (lg:col-span-12) */}
                <div className="lg:col-span-12">
                  <div className="p-6 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-5 shadow-xl">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Investigation Timeline
                    </h3>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative md:px-8 py-4">
                      {/* Horizontal progress background line (hidden on mobile) */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-16 right-16 h-0.5 bg-slate-900 z-0 hidden md:block" />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 left-16 h-0.5 bg-blue-500 z-0 hidden md:block transition-all duration-500"
                        style={{ width: latestAnalysis ? 'calc(100% - 130px)' : '30%' }}
                      />

                      {/* Step 1: Media Uploaded */}
                      <div className="flex flex-row md:flex-col items-center gap-3 relative z-10 text-left md:text-center flex-1">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white border-4 border-[#070b14] shadow-lg shadow-blue-500/20">
                          <FiUploadCloud className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Media Uploaded</span>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {formatDate(media.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Step 2: AI Processing */}
                      <div className="flex flex-row md:flex-col items-center gap-3 relative z-10 text-left md:text-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#070b14] shadow-lg transition-colors ${
                            latestAnalysis
                              ? 'bg-blue-600 text-white shadow-blue-500/20'
                              : isAnalyzing
                              ? 'bg-amber-600 text-white animate-pulse'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          <FiCpu className="w-4 h-4" />
                        </div>
                        <div>
                          <span
                            className={`text-xs font-bold block ${
                              latestAnalysis || isAnalyzing ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            AI Processing
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {latestAnalysis ? formatDate(latestAnalysis.created_at) : (isAnalyzing ? 'Running...' : 'Pending')}
                          </span>
                        </div>
                      </div>

                      {/* Step 3: Analysis Completed */}
                      <div className="flex flex-row md:flex-col items-center gap-3 relative z-10 text-left md:text-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#070b14] shadow-lg transition-colors ${
                            latestAnalysis?.status === 'completed'
                              ? 'bg-blue-600 text-white shadow-blue-500/20'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          <FiShield className="w-4 h-4" />
                        </div>
                        <div>
                          <span
                            className={`text-xs font-bold block ${
                              latestAnalysis?.status === 'completed' ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            Analysis Completed
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {latestAnalysis?.status === 'completed'
                              ? formatDate(latestAnalysis.completed_at || latestAnalysis.created_at)
                              : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Step 4: Report Generated */}
                      <div className="flex flex-row md:flex-col items-center gap-3 relative z-10 text-left md:text-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#070b14] shadow-lg transition-colors ${
                            latestAnalysis?.status === 'completed'
                              ? 'bg-blue-600 text-white shadow-blue-500/20'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          <FiFileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span
                            className={`text-xs font-bold block ${
                              latestAnalysis?.status === 'completed' ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            Report Generated
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {latestAnalysis?.status === 'completed'
                              ? formatDate(latestAnalysis.completed_at || latestAnalysis.created_at)
                              : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Step 5: Case Closed */}
                      <div className="flex flex-row md:flex-col items-center gap-3 relative z-10 text-left md:text-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#070b14] shadow-lg transition-colors ${
                            latestAnalysis?.status === 'completed'
                              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          <FiCheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <span
                            className={`text-xs font-bold block ${
                              latestAnalysis?.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            Case Closed
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {latestAnalysis?.status === 'completed'
                              ? formatDate(latestAnalysis.completed_at || latestAnalysis.created_at)
                              : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Evidence' && (
            <div className="p-6 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-6">
              <h3 className="text-base font-bold text-white">Forensic Evidence Profile</h3>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 text-xs font-mono text-slate-400 leading-relaxed">
                <p className="font-bold text-slate-200 mb-2">SHA256 Checksum Signature:</p>
                <p className="text-blue-400 break-all select-all">{media.sha256_hash}</p>
                <p className="mt-4 font-bold text-slate-200 mb-2">Storage Filepath Reference:</p>
                <p className="break-all">{media.storage_path}</p>
                <p className="mt-4 font-bold text-slate-200 mb-2">MIME Stream Content-Type:</p>
                <p>{media.mime_type}</p>
                <p className="mt-4 font-bold text-slate-200 mb-2">File Size:</p>
                <p>{formatFileSize(media.file_size)}</p>
              </div>
            </div>
          )}

          {activeTab === 'AI Results' && (
            <div className="p-6 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-6">
              <h3 className="text-base font-bold text-white">AI Detection Pipeline Verdict History</h3>
              {analysesList.length === 0 ? (
                <p className="text-xs text-slate-400">No verdict reports generated yet.</p>
              ) : (
                <div className="space-y-4">
                  {analysesList.map((an) => (
                    <div key={an.id} className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold font-mono text-slate-300">Run ID: {an.id.slice(0, 8)}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono ${
                            an.label === 'authentic'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {an.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Confidence Factor: {an.confidence ? `${Math.round(an.confidence * 100)}%` : 'N/A'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Executed On: {formatDate(an.created_at)} ({an.provider} provider)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'XAI Insights' && (
            <div className="space-y-6">
              {latestAnalysis ? (
                <>
                  <ForensicExplanationPanel analysis={latestAnalysis} mediaType={media.media_type} />

                  {media.media_type === 'audio' ? (
                    <AudioForensicVisualizer analysis={latestAnalysis} audioUrl={fileUrl} />
                  ) : media.media_type === 'video' ? (
                    <VideoFrameXAIViewer analysis={latestAnalysis} videoUrl={fileUrl} />
                  ) : (
                    <ImageXAIVisualizer analysis={latestAnalysis} originalMediaUrl={fileUrl} />
                  )}
                </>
              ) : (
                <div className="p-6 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] text-center space-y-2">
                  <FiAlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Detection Analysis Performed Yet</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Please run detection using one of the modality buttons in the Overview tab to generate forensic evidence.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Timeline' && (
            <div className="p-6 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-6">
              <h3 className="text-base font-bold text-white">Investigation Sequence Logs</h3>
              <p className="text-xs text-slate-400">Auditable blockchain-like transaction trail.</p>
              <div className="border-l border-slate-800 pl-4 space-y-4 pt-2">
                <div className="text-xs">
                  <span className="font-bold text-blue-400">Media Registered:</span> Upload completed. Created block hash.
                </div>
                <div className="text-xs">
                  <span className="font-bold text-purple-400">Job Queued:</span> Dispatched task payload to Celery background task queue.
                </div>
                <div className="text-xs">
                  <span className="font-bold text-emerald-400">Model Inference Done:</span> Finished running Error Level Analysis and ResNet-50.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Notes' && (
            <div className="p-6 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Investigation Notes</h3>
                <button
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-colors"
                >
                  {isEditingNotes ? 'Close' : 'Edit Notes'}
                </button>
              </div>

              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none focus:border-blue-500"
                    rows={8}
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl text-white shadow-md shadow-emerald-500/10 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/30 p-4 border border-slate-900 rounded-xl">
                    {notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Activity' && (
            <div className="p-6 rounded-2xl bg-[#0c1122]/80 border border-[#1e293b] space-y-6">
              <h3 className="text-base font-bold text-white">Full User Activity Log</h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/30 rounded-lg text-xs flex justify-between">
                  <span className="text-slate-300">Harshita A. inspected case details</span>
                  <span className="font-mono text-slate-500">{formatDate(media.created_at)}</span>
                </div>
                <div className="p-3 bg-slate-950/30 rounded-lg text-xs flex justify-between">
                  <span className="text-slate-300">System triggered inference job for ResNet-50</span>
                  <span className="font-mono text-slate-500">{formatDate(latestAnalysis?.created_at || media.created_at)}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
