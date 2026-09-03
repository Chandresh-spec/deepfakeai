import React, { useState, useRef } from 'react'
import {
  FiActivity,
  FiPlay,
  FiPause,
  FiClock,
  FiAlertTriangle,
  FiLayers,
  FiInfo,
} from 'react-icons/fi'
import type { AnalysisResponse } from '../types/analysis'

interface AudioForensicVisualizerProps {
  analysis: AnalysisResponse
  audioUrl?: string
}

type AudioViewTab = 'waveform' | 'spectrogram' | 'both'

export const AudioForensicVisualizer: React.FC<AudioForensicVisualizerProps> = ({
  analysis,
  audioUrl,
}) => {
  const [activeTab, setActiveTab] = useState<AudioViewTab>('both')
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const xaiData = analysis.explanation_json?.xai || {}
  const segments = xaiData.segments || []
  const sampleRate = xaiData.sample_rate || 16000

  const waveformUrl = `${import.meta.env.VITE_API_URL || '/api/v1'}/analysis/${analysis.id}/forensics/waveform`
  const spectrogramUrl = `${import.meta.env.VITE_API_URL || '/api/v1'}/analysis/${analysis.id}/forensics/spectrogram`

  const handlePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeekToSegment = (startTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className="p-5 rounded-2xl bg-[#0c1122]/90 border border-[#1e293b] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FiActivity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Audio Forensic Analysis & Acoustic Visualization
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block">
            Acoustic Signal Processing • Sampling: <span className="text-emerald-300">{sampleRate} Hz</span>
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('waveform')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'waveform'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiActivity className="w-3.5 h-3.5" /> Waveform
          </button>

          <button
            onClick={() => setActiveTab('spectrogram')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'spectrogram'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiLayers className="w-3.5 h-3.5" /> Acoustic Spectrogram
          </button>

          <button
            onClick={() => setActiveTab('both')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'both'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dual View
          </button>
        </div>
      </div>

      {/* Model-level Audio Attribution Notice */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs">
        <FiInfo className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-slate-300 font-mono text-[11px]">
          <p className="font-semibold text-slate-200">Explainability Notice:</p>
          <p className="text-slate-400">
            Model-level audio attribution is not available for this result. Displaying digital signal processing (DSP) acoustic spectrogram and waveform visualizations.
          </p>
        </div>
      </div>

      {/* Embedded Audio Player */}
      {audioUrl && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md transition-colors"
            >
              {isPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Audio Evidence Stream</span>
              <span className="text-[11px] font-mono text-slate-400">
                {currentTime.toFixed(2)}s / {duration ? duration.toFixed(2) : '0.00'}s
              </span>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex-1 max-w-md min-w-[200px]">
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.01"
              value={currentTime}
              onChange={(e) => {
                const newT = Number(e.target.value)
                setCurrentTime(newT)
                if (audioRef.current) audioRef.current.currentTime = newT
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Forensic Visual Canvas */}
      <div className="space-y-4">
        {(activeTab === 'waveform' || activeTab === 'both') && (
          <div className="rounded-xl bg-slate-950/90 border border-slate-800/80 p-2 overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/60 mb-2">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <FiActivity className="w-3 h-3" /> Acoustic Waveform & Forensic Intervals
              </span>
              <span>Amplitude (Normalized)</span>
            </div>
            <img
              src={waveformUrl}
              alt="Audio Waveform Forensic Plot"
              className="w-full max-h-56 object-contain rounded-lg"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>
        )}

        {(activeTab === 'spectrogram' || activeTab === 'both') && (
          <div className="rounded-xl bg-slate-950/90 border border-slate-800/80 p-2 overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/60 mb-2">
              <span className="flex items-center gap-1.5 text-amber-300">
                <FiLayers className="w-3 h-3" /> Acoustic Visualization — STFT Mel-Spectrogram (0 - 8000 Hz)
              </span>
              <span>Spectral Power (dB)</span>
            </div>
            <img
              src={spectrogramUrl}
              alt="Audio STFT Mel-Spectrogram Plot"
              className="w-full max-h-64 object-contain rounded-lg"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Acoustic Forensic Anomaly Segments Timeline & Jump-to-Seek */}
      {segments && segments.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FiAlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                Acoustic Forensic Analysis — Detected Anomalous Intervals ({segments.length})
              </h5>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Click any interval to seek playback
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {segments.map((seg: any, idx: number) => (
              <div
                key={idx}
                onClick={() => handleSeekToSegment(seg.start)}
                className="p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Segment #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                      <FiClock className="w-3 h-3 text-slate-400" /> {seg.start}s – {seg.end}s
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {seg.description || 'High-frequency spectral flux anomaly'}
                  </p>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-xs font-extrabold font-mono text-amber-400">
                    {Math.round(seg.importance * 100)}%
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
                    Seek →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
