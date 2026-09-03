import React, { useState } from 'react'
import {
  FiEye,
  FiGrid,
  FiImage,
  FiShield,
  FiInfo,
  FiActivity,
} from 'react-icons/fi'
import { mediaService } from '../services/mediaService'

interface ELAInspectorProps {
  mediaId: string
  forensicReport?: Record<string, any>
}

type ViewMode = 'ela' | 'original' | 'split'

export const ELAInspector: React.FC<ELAInspectorProps> = ({
  mediaId,
  forensicReport,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('ela')

  const originalUrl = mediaService.getMediaFileUrl(mediaId)
  const elaUrl = mediaService.getElaImageUrl(mediaId)

  const elaData = forensicReport?.ela || {}
  const fftData = forensicReport?.fft || {}
  const riskLevel = forensicReport?.risk_level || 'Pending Forensic Audit'
  const seal = forensicReport?.forensic_seal || 'SEAL-PENDING'

  return (
    <div className="p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-4">
      {/* ELA Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <FiShield className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Error Level Analysis (ELA) & Compression Inspection
          </h4>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[var(--color-bg-secondary)] p-1 rounded-xl border border-[var(--color-border)]">
          <button
            onClick={() => setViewMode('ela')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'ela'
                ? 'bg-purple-600 text-white'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            }`}
          >
            <FiEye className="w-3.5 h-3.5" /> ELA Heatmap
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'original'
                ? 'bg-purple-600 text-white'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            }`}
          >
            <FiImage className="w-3.5 h-3.5" /> Original
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'split'
                ? 'bg-purple-600 text-white'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            }`}
          >
            <FiGrid className="w-3.5 h-3.5" /> Side-by-Side
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="h-64 sm:h-72 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden relative p-2">
        {viewMode === 'ela' && (
          <img
            src={elaUrl}
            alt="Error Level Analysis (ELA) Heatmap"
            className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        )}

        {viewMode === 'original' && (
          <img
            src={originalUrl}
            alt="Original Media Asset"
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-2 gap-2 w-full h-full">
            <div className="relative border border-[var(--color-border)] rounded-lg overflow-hidden flex items-center justify-center p-1 bg-[var(--color-bg-card)]">
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/70 text-white">
                Original Image
              </span>
              <img
                src={originalUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="relative border border-[var(--color-border)] rounded-lg overflow-hidden flex items-center justify-center p-1 bg-[var(--color-bg-card)]">
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/70 text-purple-400 border border-purple-500/30">
                ELA Tampering Map
              </span>
              <img
                src={elaUrl}
                alt="ELA Heatmap"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Forensic Report Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">ELA Tamper Score</span>
          <span className="font-bold text-white font-mono text-sm">
            {elaData.ela_score ? `${Math.round(elaData.ela_score * 100)}%` : 'N/A'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">ELA Mean Delta</span>
          <span className="font-bold text-white font-mono text-sm">{elaData.mean_diff ?? 'N/A'}</span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">FFT High-Freq Ratio</span>
          <span className="font-bold text-white font-mono text-sm">
            {fftData.high_freq_ratio ? `${Math.round(fftData.high_freq_ratio * 100)}%` : 'N/A'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">FFT Grid Anomaly</span>
          <span className={`font-bold font-mono text-sm ${fftData.grid_anomaly_detected ? 'text-red-400' : 'text-emerald-400'}`}>
            {fftData.grid_anomaly_detected ? 'DETECTED' : 'CLEAR'}
          </span>
        </div>
      </div>

      {/* Forensic Seal & Risk Level Banner */}
      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-300">
          <FiActivity className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="font-semibold">{riskLevel}</span>
        </div>
        <span className="font-mono text-[10px] bg-purple-500/20 text-purple-400 px-2.5 py-1 rounded-md border border-purple-500/30">
          {seal}
        </span>
      </div>

      {/* Explanatory Note */}
      <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-[11px] text-[var(--color-text-muted)] flex items-start gap-2 leading-relaxed">
        <FiInfo className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <span>
          Error Level Analysis (ELA) resaves image at 95% JPEG quality to measure error level differences across surface regions. Brighter pixel clusters highlight altered regions or deepfake synthesis splices.
        </span>
      </div>
    </div>
  )
}
