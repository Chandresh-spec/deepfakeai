import React, { useState, useEffect } from 'react'
import {
  FiX,
  FiTrash2,
  FiFileText,
  FiMusic,
  FiCalendar,
  FiHardDrive,
  FiExternalLink,
  FiAlertTriangle,
  FiCpu,
  FiLoader,
  FiShield,
  FiGrid,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { mediaService } from '../services/mediaService'
import { analysisService } from '../services/analysisService'
import { MetadataViewer } from './MetadataViewer'
import { AnalysisResultCard } from './AnalysisResultCard'
import { ELAInspector } from './ELAInspector'
import type { MediaFile } from '../types/media'
import type { AnalysisResponse } from '../types/analysis'

interface MediaDetailsModalProps {
  media: MediaFile | null
  isOpen: boolean
  onClose: () => void
  onDelete: (mediaId: string) => void
  onAnalysisComplete?: () => void
}

type TabType = 'metadata' | 'forensics'

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({
  media,
  isOpen,
  onClose,
  onDelete,
  onAnalysisComplete,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('metadata')
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false)

  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResponse | null>(null)
  const [forensicReport, setForensicReport] = useState<Record<string, any> | undefined>(undefined)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen && media) {
      // Fetch analysis history for this media asset
      analysisService
        .listMediaAnalyses(media.id)
        .then((analyses) => {
          if (analyses && analyses.length > 0) {
            setLatestAnalysis(analyses[0])
          } else {
            setLatestAnalysis(null)
          }
        })
        .catch(() => setLatestAnalysis(null))

      // Fetch deep forensics report
      mediaService
        .getDeepForensics(media.id)
        .then((rep) => setForensicReport(rep))
        .catch(() => setForensicReport(undefined))
    }
  }, [isOpen, media])

  if (!isOpen || !media) return null

  const fileUrl = mediaService.getMediaFileUrl(media.id)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const result = await analysisService.runAnalysis(media.id)
      setLatestAnalysis(result)
      toast.success(`AI Detection completed: Verdict is ${result.label?.toUpperCase()}`)
      if (onAnalysisComplete) onAnalysisComplete()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to execute detection analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(media.id)
      onClose()
    } finally {
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-secondary)]/50">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {media.media_type}
            </span>
            <h2 className="text-lg font-bold text-white truncate">{media.filename}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-white p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'metadata'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-secondary)]'
            }`}
          >
            <FiGrid className="w-4 h-4" /> Asset & Metadata Inspector
          </button>
          <button
            onClick={() => setActiveTab('forensics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'forensics'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-secondary)]'
            }`}
          >
            <FiShield className="w-4 h-4" /> Deep ELA & FFT Forensics
          </button>
        </div>

        {/* Modal Body: Split view grid or full ELA tab */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'metadata' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Media Preview & AI Detection Trigger */}
              <div className="space-y-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Asset Preview & AI Detection
                  </h3>

                  <button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Running AI Models...
                      </>
                    ) : (
                      <>
                        <FiCpu className="w-4 h-4" />
                        {latestAnalysis ? 'Re-Run AI Analysis' : 'Run AI Deepfake Analysis'}
                      </>
                    )}
                  </button>
                </div>

                <div className="min-h-[220px] max-h-[320px] bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] flex items-center justify-center overflow-hidden p-3 relative group">
                  {media.media_type === 'image' && (
                    <img
                      src={fileUrl}
                      alt={media.filename}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
                      onError={() => {
                        console.error('Failed to load image preview from:', fileUrl)
                      }}
                    />
                  )}

                  {media.media_type === 'video' && (
                    <video
                      src={fileUrl}
                      controls
                      className="max-h-full max-w-full rounded-lg shadow-lg"
                    />
                  )}

                  {media.media_type === 'audio' && (
                    <div className="w-full p-6 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                        <FiMusic className="w-8 h-8" />
                      </div>
                      <audio controls src={fileUrl} className="w-full" />
                    </div>
                  )}

                  {media.media_type === 'text' && (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center">
                      <FiFileText className="w-16 h-16 text-amber-400 mb-3" />
                      <p className="text-sm font-semibold text-white">{media.filename}</p>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
                      >
                        Open Document Raw View <FiExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Quick Meta Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center gap-3">
                    <FiHardDrive className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-[11px] text-[var(--color-text-muted)] block uppercase font-mono">Size</span>
                      <span className="font-semibold text-white font-mono">{formatFileSize(media.file_size)}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center gap-3">
                    <FiCalendar className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-[11px] text-[var(--color-text-muted)] block uppercase font-mono">Uploaded</span>
                      <span className="font-semibold text-white font-mono">{formatDate(media.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Latest AI Analysis Card */}
                {latestAnalysis && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Latest Detection Verdict
                    </h4>
                    <AnalysisResultCard analysis={latestAnalysis} mediaId={media.id} />
                  </div>
                )}
              </div>

              {/* Right Column: Forensic Metadata Breakdown */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Forensic Metadata Inspection
                </h3>
                <MetadataViewer media={media} />
              </div>
            </div>
          ) : (
            /* ELA Inspector Tab */
            <ELAInspector mediaId={media.id} forensicReport={forensicReport} />
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-400 flex items-center gap-1">
                  <FiAlertTriangle className="w-4 h-4" /> Are you sure?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  Yes, Delete Media
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-medium hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3.5 py-2 rounded-xl text-red-400 hover:bg-red-500/10 border border-red-500/20 font-medium text-xs flex items-center gap-2 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" /> Delete Asset
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-white text-sm font-semibold hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
