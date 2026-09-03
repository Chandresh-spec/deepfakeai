import React, { useState } from 'react'
import {
  FiEye,
  FiSliders,
  FiGrid,
  FiImage,
  FiZap,
} from 'react-icons/fi'
import { analysisService } from '../services/analysisService'
import type { AnalysisResponse } from '../types/analysis'

interface XAIVisualizerProps {
  analysis: AnalysisResponse
  originalMediaUrl?: string
}

type ViewMode = 'heatmap' | 'original' | 'split'

export const XAIVisualizer: React.FC<XAIVisualizerProps> = ({
  analysis,
  originalMediaUrl,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap')
  const [opacity, setOpacity] = useState<number>(75)

  const heatmapUrl = analysisService.getHeatmapUrl(analysis.id)
  const hasHeatmap = analysis.explanation_json?.has_heatmap ?? true

  if (!hasHeatmap) {
    return (
      <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] text-center font-mono">
        Visual Grad-CAM heatmap overlays are generated for Image and Video media formats.
      </div>
    )
  }

  return (
    <div className="p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-4">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <FiZap className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Visual XAI Evidence & Attention Map
          </h4>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[var(--color-bg-secondary)] p-1 rounded-xl border border-[var(--color-border)]">
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-blue-600 text-white'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            }`}
          >
            <FiEye className="w-3.5 h-3.5" /> Heatmap
          </button>

          {originalMediaUrl && (
            <>
              <button
                onClick={() => setViewMode('original')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'original'
                    ? 'bg-blue-600 text-white'
                    : 'text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                <FiImage className="w-3.5 h-3.5" /> Original
              </button>

              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                <FiGrid className="w-3.5 h-3.5" /> Split View
              </button>
            </>
          )}
        </div>
      </div>

      {/* Opacity Control Slider (shown in Heatmap mode) */}
      {viewMode === 'heatmap' && originalMediaUrl && (
        <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs">
          <span className="text-[var(--color-text-secondary)] font-mono flex items-center gap-1.5">
            <FiSliders className="w-3.5 h-3.5 text-blue-400" /> Heatmap Intensity Blend:
          </span>
          <div className="flex items-center gap-3 min-w-[180px]">
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--color-bg-card)] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="font-mono font-bold text-white w-9 text-right">{opacity}%</span>
          </div>
        </div>
      )}

      {/* Visual Canvas Display */}
      <div className="h-64 sm:h-72 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden relative p-2">
        {viewMode === 'heatmap' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {originalMediaUrl && (
              <img
                src={originalMediaUrl}
                alt="Original Media"
                className="absolute max-h-full max-w-full object-contain rounded-lg"
              />
            )}
            <img
              src={heatmapUrl}
              alt="XAI Attention Heatmap"
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

        {viewMode === 'split' && (
          <div className="grid grid-cols-2 gap-2 w-full h-full">
            <div className="relative border border-[var(--color-border)] rounded-lg overflow-hidden flex items-center justify-center p-1 bg-[var(--color-bg-card)]">
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/70 text-white">
                Original Asset
              </span>
              <img
                src={originalMediaUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="relative border border-[var(--color-border)] rounded-lg overflow-hidden flex items-center justify-center p-1 bg-[var(--color-bg-card)]">
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/70 text-cyan-400 border border-cyan-500/30">
                Heatmap Overlay
              </span>
              <img
                src={heatmapUrl}
                alt="Heatmap"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] font-mono bg-[var(--color-bg-secondary)] p-2.5 rounded-xl border border-[var(--color-border)]">
        <span>Colormap Spectrum Legend:</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Red/Yellow: Anomaly Peak
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Blue/Cyan: Authentic Baseline
          </span>
        </div>
      </div>
    </div>
  )
}
