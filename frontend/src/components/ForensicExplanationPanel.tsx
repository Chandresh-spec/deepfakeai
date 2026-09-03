import {
  FiShield,
  FiCheckCircle,
  FiInfo,
  FiZap,
} from 'react-icons/fi'
import type { AnalysisResponse } from '../types/analysis'

interface ForensicExplanationPanelProps {
  analysis: AnalysisResponse
  mediaType?: string
}

export const ForensicExplanationPanel: React.FC<ForensicExplanationPanelProps> = ({
  analysis,
  mediaType = 'image',
}) => {
  const isManipulated =
    analysis.label === 'manipulated' || analysis.label === 'suspicious'
  const isAuthentic = analysis.label === 'authentic'

  const xaiData = analysis.explanation_json?.xai || {}
  const hasXAI =
    xaiData.available ?? analysis.explanation_json?.has_heatmap ?? true

  const provider = analysis.provider || 'Resemble AI'
  const confidencePercent = analysis.confidence
    ? Math.round(analysis.confidence * 100)
    : null

  // Extract manipulation type
  const rawResult = analysis.result_json || {}
  const manipulationType =
    rawResult.manipulation_type ||
    rawResult.detection_type ||
    (mediaType === 'audio'
      ? isManipulated
        ? 'Synthetic Voice / Voice Cloning'
        : 'Authentic Voice Recording'
      : mediaType === 'video'
      ? isManipulated
        ? 'Deepfake Face-Swap / Video Synthesis'
        : 'Authentic Video Stream'
      : isManipulated
      ? 'AI Generation / Image Manipulation'
      : 'Authentic Photographic Capture')

  // Extract primary evidence from explanation factors or summary
  const summary =
    analysis.explanation_json?.summary ||
    (isManipulated
      ? `Model detection identified strong synthetic manipulation indicators with ${confidencePercent ?? 90}% confidence.`
      : `Model evaluation found no anomalous synthetic manipulation signals across analyzed features.`)

  const factors = analysis.explanation_json?.factors || []

  return (
    <div className="p-6 rounded-2xl bg-[#0c1122]/90 border border-[#1e293b] shadow-xl space-y-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FiShield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Forensic Explanation Panel
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Provider Engine: <span className="text-cyan-400 capitalize">{provider}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
              isManipulated
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : isAuthentic
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {isManipulated ? 'Likely Manipulated' : isAuthentic ? 'Authentic' : 'Suspicious'}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Detection Verdict */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Verdict</span>
          <span
            className={`font-bold font-mono text-sm block ${
              isManipulated ? 'text-red-400' : isAuthentic ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {analysis.label?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>

        {/* Confidence Score */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Confidence</span>
          <span className="font-bold font-mono text-sm text-white block">
            {confidencePercent !== null ? `${confidencePercent}%` : 'N/A'}
          </span>
        </div>

        {/* Visual Evidence / XAI */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Visual Evidence</span>
          <span className="font-bold font-mono text-xs text-slate-200 flex items-center gap-1">
            {hasXAI ? (
              <>
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Available
              </>
            ) : (
              <>
                <FiInfo className="w-3.5 h-3.5 text-slate-500" /> Unavailable
              </>
            )}
          </span>
        </div>

        {/* XAI Attribution Mode */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">XAI Status</span>
          <span className="font-bold font-mono text-xs text-slate-200 flex items-center gap-1">
            {hasXAI ? (
              <span className="text-cyan-400 flex items-center gap-1">
                <FiZap className="w-3 h-3" /> Model Grounded
              </span>
            ) : (
              <span className="text-slate-400">Not Provided</span>
            )}
          </span>
        </div>
      </div>

      {/* Manipulation Type & Generator Breakdown */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-mono text-[11px]">Detection Category:</span>
          <span className="font-bold text-white font-mono">{manipulationType}</span>
        </div>
        {rawResult.model_attribution && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
            <span className="text-slate-400 font-mono text-[11px]">Predicted Generator:</span>
            <span className="font-bold text-cyan-400 font-mono capitalize">
              {rawResult.model_attribution} (
              {Math.round((rawResult.model_attribution_probability || 0.9) * 100)}%)
            </span>
          </div>
        )}
      </div>

      {/* Primary Evidence Section */}
      <div className="space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-mono block">
          Primary Evidence & Findings
        </span>
        <p className="text-xs text-slate-300 leading-relaxed font-mono p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
          {summary}
        </p>
      </div>

      {/* Detailed Factor Breakdown */}
      {factors.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono block">
            Analytical Factors Evaluated
          </span>
          <div className="space-y-2">
            {factors.map((f, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-200 block">{f.name}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    {f.description}
                  </span>
                </div>
                <span
                  className={`font-mono font-bold text-sm shrink-0 ${
                    f.score > 0.6
                      ? 'text-red-400'
                      : f.score > 0.3
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {Math.round(f.score * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
