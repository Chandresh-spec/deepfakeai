import React, { useState } from 'react'
import {
  FiEye,
  FiSliders,
  FiGrid,
  FiImage,
  FiZap,
  FiAlertCircle,
} from 'react-icons/fi'
import { analysisService } from '../services/analysisService'
import type { AnalysisResponse } from '../types/analysis'

interface ImageXAIVisualizerProps {
  analysis: AnalysisResponse
  originalMediaUrl?: string
}

type ViewMode = 'overlay' | 'original' | 'split' | 'heatmap'

export const ImageXAIVisualizer: React.FC<ImageXAIVisualizerProps> = ({
  analysis,
  originalMediaUrl,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overlay')
  const [opacity, setOpacity] = useState<number>(75)

  const xaiData = analysis.explanation_json?.xai || {}
  const isAvailable = xaiData.available ?? analysis.explanation_json?.has_heatmap ?? true
  const method = xaiData.method || 'Resemble AI Forensic Spatial Artifact & ELA Heatmap'
  const reason = xaiData.reason || 'Forensic heatmap analysis is active.'

  const overlayUrl = xaiData.overlay_url || analysisService.getHeatmapUrl(analysis.id)
  const rawHeatmapUrl = xaiData.heatmap_url || `${import.meta.env.VITE_API_URL || '/api/v1'}/analysis/${analysis.id}/xai/image-heatmap`

  if (!isAvailable) {
    return (
      <div className="p-5 rounded-2xl bg-[#0c1122]/90 border border-[#1e293b] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1e293b]">
          <FiZap className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Explainable AI (XAI) — Visual Model Attribution
          </h4>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-200">
              XAI visualization unavailable for this result.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              {reason}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-2xl bg-[#0c1122]/90 border border-[#1e293b] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FiZap className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Explainable AI (XAI) — Model Attribution Heatmap
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block">
            Method: <span className="text-cyan-300">{method}</span>
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'overlay'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiEye className="w-3.5 h-3.5" /> Overlay
          </button>

          {originalMediaUrl && (
            <>
              <button
                onClick={() => setViewMode('original')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'original'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FiImage className="w-3.5 h-3.5" /> Original
              </button>

              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FiGrid className="w-3.5 h-3.5" /> Split View
              </button>
            </>
          )}

          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiZap className="w-3.5 h-3.5" /> Raw Heatmap
          </button>
        </div>
      </div>

      {/* Opacity Control Slider (shown in Overlay mode) */}
      {viewMode === 'overlay' && originalMediaUrl && (
        <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <span className="text-slate-400 font-mono flex items-center gap-1.5">
            <FiSliders className="w-3.5 h-3.5 text-blue-400" /> Heatmap Intensity Blend:
          </span>
          <div className="flex items-center gap-3 min-w-[180px]">
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="font-mono font-bold text-white w-9 text-right">{opacity}%</span>
          </div>
        </div>
      )}

      {/* Visual Canvas Display */}
      <div className="h-64 sm:h-80 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center overflow-hidden relative p-2">
        {viewMode === 'overlay' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {originalMediaUrl && (
              <img
                src={originalMediaUrl}
                alt="Original Media"
                className="absolute max-h-full max-w-full object-contain rounded-lg"
              />
            )}
            <img
              src={overlayUrl}
              alt="XAI Model Attribution Overlay"
              className="max-h-full max-w-full object-contain rounded-lg transition-opacity duration-200"
              style={{ opacity: originalMediaUrl ? opacity / 100 : 1 }}
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>
        )}

        {viewMode === 'original' && originalMediaUrl && (
          <img
            src={originalMediaUrl}
            alt="Original Media Asset"
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        )}

        {viewMode === 'heatmap' && (
          <img
            src={rawHeatmapUrl}
            alt="Raw Model Attribution Heatmap"
            className="max-h-full max-w-full object-contain rounded-lg"
            onError={(e) => {
              // Fallback to overlay if raw heatmap subresource isn't supported
              ;(e.target as HTMLImageElement).src = overlayUrl
            }}
          />
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-2 gap-2 w-full h-full">
            <div className="relative border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-1 bg-slate-900/50">
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/70 text-white">
                Original Asset
              </span>
              <img
                src={originalMediaUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="relative border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-1 bg-slate-900/50">
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/70 text-cyan-400 border border-cyan-500/30">
                Model Attribution / Heatmap Overlay
              </span>
              <img
                src={overlayUrl}
                alt="XAI Attribution Overlay"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 gap-2">
        <span className="font-semibold text-slate-300">Legend:</span>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> RED → strongest indicated region
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> YELLOW → medium indicated region
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> BLUE → lower indicated region
          </span>
        </div>
      </div>
    </div>
  )
}
