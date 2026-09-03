import React from 'react'
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiCpu,
  FiActivity,
  FiInfo,
  FiLayers,
} from 'react-icons/fi'
import { XAIVisualizer } from './XAIVisualizer'
import { mediaService } from '../services/mediaService'
import type { AnalysisResponse } from '../types/analysis'

interface AnalysisResultCardProps {
  analysis: AnalysisResponse
  mediaId?: string
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  analysis,
  mediaId,
}) => {
  const label = analysis.label || 'suspicious'
  const confidence = analysis.confidence ?? 0.5
  const confidencePct = Math.round(confidence * 100)

  const getVerdictBadge = () => {
    switch (label.toLowerCase()) {
      case 'authentic':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider">
            <FiCheckCircle className="w-4 h-4" /> Authentic Media
          </div>
        )
      case 'manipulated':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-extrabold uppercase tracking-wider">
            <FiXCircle className="w-4 h-4" /> Deepfake / Manipulated
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider">
            <FiAlertTriangle className="w-4 h-4" /> Suspicious Anomaly
          </div>
        )
    }
  }

  const getConfidenceBarColor = () => {
    switch (label.toLowerCase()) {
      case 'authentic':
        return 'from-emerald-500 to-green-400'
      case 'manipulated':
        return 'from-red-500 to-rose-400'
      default:
        return 'from-amber-500 to-yellow-400'
    }
  }

  const explanation = (analysis.explanation_json || {}) as Record<string, any>
  const factors = (explanation.factors || []) as any[]
  const modalityResults = analysis.modality_results_json || []

  const targetMediaId = mediaId || analysis.media_id
  const originalMediaUrl = targetMediaId ? mediaService.getMediaFileUrl(targetMediaId) : undefined

  return (
    <div className="p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-5 shadow-xl">
      {/* Header Verdict & Provider Pill */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          {getVerdictBadge()}
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Provider: {analysis.provider} {analysis.is_demo ? '(Demo)' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-secondary)]">
          <FiActivity className="w-4 h-4 text-cyan-400" />
          <span>Confidence: <strong className="text-white font-bold">{confidencePct}%</strong></span>
        </div>
      </div>

      {/* Confidence Meter Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-[var(--color-text-muted)]">
          <span>AI Detection Confidence Score</span>
          <span>{confidencePct}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden border border-[var(--color-border)]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getConfidenceBarColor()} transition-all duration-500`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Explanation Summary Box */}
      {explanation.summary && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5 leading-relaxed">
          <FiInfo className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>{explanation.summary}</div>
        </div>
      )}

      {/* Interactive Visual XAI Evidence Map */}
      <XAIVisualizer analysis={analysis} originalMediaUrl={originalMediaUrl} />

      {/* XAI Anomaly Factors Breakdown */}
      {factors.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-2">
            <FiCpu className="w-4 h-4 text-cyan-400" />
            Explainable AI (XAI) Forensic Factors
          </h4>

          <div className="grid grid-cols-1 gap-2.5">
            {factors.map((factor: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-col gap-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{factor.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      factor.impact === 'high'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : factor.impact === 'medium'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {factor.impact} impact
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modality Breakdown Pills */}
      {modalityResults.length > 0 && (
        <div className="pt-2 border-t border-[var(--color-border)] flex items-center gap-3 text-xs">
          <span className="text-[var(--color-text-muted)] font-mono flex items-center gap-1">
            <FiLayers className="w-3.5 h-3.5 text-blue-400" /> Modalities:
          </span>
          {modalityResults.map((mod: any, idx: number) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-white"
            >
              {mod.modality.toUpperCase()}: <strong className="text-cyan-400">{mod.label}</strong> ({Math.round(mod.confidence * 100)}%)
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
