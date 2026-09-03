import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  ArrowRight,
  Sparkles,
  Cpu,
  Fingerprint,
  AudioLines,
  Layers,
  FileCheck,
  AlertTriangle,
  Lock,
  Eye,
  Sliders,
} from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../hooks/useAuth'

type DemoTab = 'image' | 'audio' | 'video' | 'provenance'

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<DemoTab>('image')
  const [showHeatmap, setShowHeatmap] = useState(true)

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-20 pb-16 overflow-hidden border-b border-slate-800/60">
          {/* Subtle ambient gradient mesh */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 text-center">
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium mb-8 shadow-xs hover:border-slate-700 transition-colors">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <span className="font-mono text-cyan-400 text-[11px] font-semibold">DeepForensics 2.4</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">Explainable Multi-Modal Forensic Engine</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              Deepfake Detection with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Transparent Forensic Evidence
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed mb-10 font-normal">
              Autonomous multi-modal forensic inspection across images, voice recordings, video frames,
              and metadata. Powered by multi-model AI ensembles and explainable Grad-CAM heatmaps.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 group"
              >
                <span>{isAuthenticated ? 'Open Forensic Workspace' : 'Start Forensic Analysis'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#demo"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Explore Live Inspector</span>
              </a>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 border-t border-slate-800/50">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">99.4%</div>
                <div className="text-xs text-slate-400 mt-0.5">Ensemble Benchmark</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">&lt; 450ms</div>
                <div className="text-xs text-slate-400 mt-0.5">Pipeline Latency</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-400">4 Modalities</div>
                <div className="text-xs text-slate-400 mt-0.5">Image, Audio, Video, Docs</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">SHA-256</div>
                <div className="text-xs text-slate-400 mt-0.5">Immutable Custody</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE FORENSIC SHOWCASE CONSOLE ================= */}
        <section id="demo" className="py-20 max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              INTERACTIVE FORENSIC CONSOLE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              See Explainable Detection in Action
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Toggle between media modalities to observe how our model ensemble extracts manipulation signatures with pixel-level precision.
            </p>
          </div>

          {/* Console Window */}
          <div className="rounded-2xl border border-slate-800 bg-[#0b101e] shadow-2xl overflow-hidden">
            {/* Window Header */}
            <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
              {/* Window Controls & Status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-700/80" />
                  <span className="w-3 h-3 rounded-full bg-slate-700/80" />
                  <span className="w-3 h-3 rounded-full bg-slate-700/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  inspector://deepforensics.core/session-preview
                </span>
              </div>

              {/* Modality Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
                <button
                  onClick={() => setActiveTab('image')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'image'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Image (Grad-CAM)
                </button>
                <button
                  onClick={() => setActiveTab('audio')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'audio'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Voice (FFT Spectra)
                </button>
                <button
                  onClick={() => setActiveTab('video')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'video'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Video (Temporal)
                </button>
                <button
                  onClick={() => setActiveTab('provenance')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'provenance'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Provenance Ledger
                </button>
              </div>
            </div>

            {/* Window Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Viewport (7 Cols) */}
              <div className="lg:col-span-7 bg-[#070b14] rounded-xl border border-slate-800/80 p-5 flex flex-col justify-between min-h-[340px]">
                {activeTab === 'image' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          SAMPLE_SYNTHETIC_FACE_08.PNG
                        </span>
                      </div>
                      <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          showHeatmap
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Sliders className="w-3 h-3" />
                        {showHeatmap ? 'Heatmap: Active' : 'Heatmap: Hidden'}
                      </button>
                    </div>

                    {/* Visualizer Simulation Box */}
                    <div className="relative h-56 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(#3b82f615_1px,transparent_1px)] bg-[size:16px_16px]" />
                      {showHeatmap && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 via-transparent to-amber-500/25 pointer-events-none" />
                      )}

                      {/* Simulated face landmark box */}
                      <div className="relative w-40 h-44 rounded-2xl border-2 border-dashed border-red-500/60 bg-red-500/5 flex flex-col items-center justify-center p-3 text-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-2">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-red-400 uppercase">
                          WARPED FACIAL BOUNDS
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-1">
                          Diff-Morph Error: +0.892
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                      <span>Resolution: 1024 x 1024</span>
                      <span className="text-red-400">Grad-CAM Activation: Layer 4</span>
                    </div>
                  </div>
                )}

                {activeTab === 'audio' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AudioLines className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          INTERVIEW_SPEECH_CLONE.WAV
                        </span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        Resemble Spectra FFT
                      </span>
                    </div>

                    {/* Spectrogram graphic simulation */}
                    <div className="h-56 rounded-lg bg-slate-950 border border-slate-800 p-4 flex flex-col justify-end space-y-2">
                      <div className="text-[11px] font-mono text-slate-500 flex justify-between">
                        <span>Frequency (kHz)</span>
                        <span>Time: 00:04.2s</span>
                      </div>
                      <div className="h-36 flex items-end gap-1 px-2">
                        {[50, 75, 90, 45, 80, 100, 65, 85, 95, 40, 60, 92, 70, 88, 55, 78, 98, 40, 85, 60].map(
                          (val, i) => (
                            <div
                              key={i}
                              style={{ height: `${val}%` }}
                              className={`flex-1 rounded-xs ${
                                i >= 8 && i <= 14
                                  ? 'bg-gradient-to-t from-red-500 to-amber-400 shadow-[0_0_6px_#ef4444]'
                                  : 'bg-cyan-500/40'
                              }`}
                            />
                          )
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-mono text-slate-400 flex justify-between pt-1">
                      <span>Sampling Rate: 48.0 kHz</span>
                      <span className="text-red-400">High-Freq Cutoff Artifact @ 3.4kHz</span>
                    </div>
                  </div>
                )}

                {activeTab === 'video' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          PRESS_CONFERENCE_RESTREAM.MP4
                        </span>
                      </div>
                      <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        Temporal Frame Stack
                      </span>
                    </div>

                    <div className="h-56 rounded-lg bg-slate-950 border border-slate-800 p-4 flex items-center justify-around gap-2">
                      {[14, 15, 16, 17].map((f) => (
                        <div
                          key={f}
                          className="flex-1 h-44 rounded-lg bg-slate-900 border border-slate-800 p-2 flex flex-col justify-between text-center"
                        >
                          <span className="text-[10px] font-mono text-slate-500">F_{f}</span>
                          <div className="w-full h-20 rounded bg-slate-950/80 border border-slate-800/80 flex items-center justify-center">
                            <span className="text-[9px] font-mono text-red-400">
                              {f === 16 ? 'JITTER' : 'STABLE'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-red-400">
                            {f === 16 ? '0.98' : '0.41'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs font-mono text-slate-400 flex justify-between pt-1">
                      <span>FPS: 29.97</span>
                      <span className="text-red-400">Lip-Sync Desynchronization: +120ms</span>
                    </div>
                  </div>
                )}

                {activeTab === 'provenance' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          C2PA_MANIFEST_LEDGER.JSON
                        </span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Tamper-Evident SHA-256
                      </span>
                    </div>

                    <div className="h-56 rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-2">
                      <div className="text-slate-500">// Cryptographic Evidence Signature</div>
                      <div>
                        <span className="text-blue-400">&quot;sha256&quot;</span>: &quot;3a8e9...bd82f1&quot;
                      </div>
                      <div>
                        <span className="text-blue-400">&quot;c2pa_assertion&quot;</span>: &quot;synthesized_facial_morph&quot;
                      </div>
                      <div>
                        <span className="text-blue-400">&quot;camera_serial&quot;</span>: <span className="text-red-400">null [METADATA STRIPPED]</span>
                      </div>
                      <div>
                        <span className="text-blue-400">&quot;compression_quantization&quot;</span>: &quot;double_jpeg_detected&quot;
                      </div>
                      <div>
                        <span className="text-blue-400">&quot;chain_of_custody&quot;</span>: &quot;VERIFIED_AUDITABLE&quot;
                      </div>
                    </div>

                    <div className="text-xs font-mono text-slate-400 flex justify-between pt-1">
                      <span>Standard: ISO 27037 Forensics</span>
                      <span className="text-emerald-400">Seal Status: VALID</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Diagnostic Telemetry (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                {/* AI Verdict Box */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400">Overall Verdict</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                      MANIPULATED
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Confidence Score</span>
                      <span className="font-mono font-bold text-red-400">98.6%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 w-[98.6%]" />
                    </div>
                  </div>
                </div>

                {/* Model Ensemble Breakdowns */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                  <span className="text-xs font-mono uppercase text-slate-400 block mb-2">
                    Ensemble Breakdown
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">SightEngine Face Model</span>
                      <span className="font-mono text-red-400 font-semibold">97.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">RealityDefender Multimodal</span>
                      <span className="font-mono text-red-400 font-semibold">99.1%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Spectral ELA Heuristic</span>
                      <span className="font-mono text-amber-400 font-semibold">88.4%</span>
                    </div>
                  </div>
                </div>

                {/* Quick Launch CTA */}
                <Link
                  to={isAuthenticated ? '/dashboard' : '/login'}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Test Your Own Media in Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MINIMALIST BENTO GRID ================= */}
        <section id="features" className="py-20 border-t border-slate-800/60 bg-[#080d19]/60">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider block mb-2">
                CORE CAPABILITIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Engineered for Forensic Accuracy & Compliance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1 */}
              <div className="p-7 rounded-2xl bg-[#0b101e] border border-slate-800 hover:border-slate-700 transition-all space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">01 / COMPUTER VISION</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  Pixel-Level ELA & Residual Analysis
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Extract Error Level Analysis (ELA), frequency domain discrete cosine transforms (DCT),
                  and compression artifacts to expose localized copy-move and diffusion generative patches.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    Grad-CAM
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    DCT Quantization
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    Noise Resampling
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-7 rounded-2xl bg-[#0b101e] border border-slate-800 hover:border-slate-700 transition-all space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <AudioLines className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">02 / ACOUSTIC FORENSICS</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Voice Cloning & Mel-Spectrogram Auditing
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Identify synthetic vocoder signatures, phase inconsistencies, and robotic cadence in
                  audio tracks. Pinpoint cloned voices from ElevenLabs, XTTS, and custom diffusion models.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    FFT Spectral Analysis
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    Pitch Track Discontinuity
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    Resemble API
                  </span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-7 rounded-2xl bg-[#0b101e] border border-slate-800 hover:border-slate-700 transition-all space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">03 / ENSEMBLE ORCHESTRATION</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Multi-Provider Consensus Scoring
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Prevent single-model bias by aggregating verdict confidence across specialized industrial
                  detectors (SightEngine, RealityDefender, and custom local heuristics).
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    Weighted Consensus
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    Zero Single Point of Bias
                  </span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-7 rounded-2xl bg-[#0b101e] border border-slate-800 hover:border-slate-700 transition-all space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">04 / LEGAL & CUSTODY</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Court-Admissible PDF Export & Hashes
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Generate timestamped cryptographic forensic reports including file hashes, model parameters,
                  XAI heatmaps, and formal academic/legal disclaimers for compliance and investigations.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    ISO 27037 Standard
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    PDF & JSON Export
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    Audit Logging
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ARCHITECTURE PIPELINE ================= */}
        <section id="pipeline" className="py-20 border-t border-slate-800/60">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider block mb-2">
                VERIFICATION PIPELINE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                How DeepForensics Audits Media
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-[#0b101e] border border-slate-800 space-y-3 relative">
                <div className="text-xs font-mono font-bold text-blue-400">STEP 01</div>
                <h4 className="text-base font-bold text-white">Cryptographic Ingest</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Files are validated, hashed via SHA-256, and indexed with EXIF metadata stripped or preserved based on custody policy.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-[#0b101e] border border-slate-800 space-y-3 relative">
                <div className="text-xs font-mono font-bold text-indigo-400">STEP 02</div>
                <h4 className="text-base font-bold text-white">Ensemble Deep Scan</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Asynchronous Celery workers distribute media across visual, acoustic, and heuristic neural networks simultaneously.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-[#0b101e] border border-slate-800 space-y-3 relative">
                <div className="text-xs font-mono font-bold text-emerald-400">STEP 03</div>
                <h4 className="text-base font-bold text-white">XAI Verdict & Export</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Results synthesize into an explainable audit card with Grad-CAM overlays, confidence percentages, and exportable PDF dossier.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= BOTTOM CTA BANNER ================= */}
        <section className="py-20 border-t border-slate-800/60 bg-gradient-to-b from-[#0b101e] to-[#070b14]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Deploy Professional Deepfake Forensics Today
            </h2>
            <p className="text-base text-slate-400 mb-8 max-w-xl mx-auto">
              Start inspecting media files with explainable AI models and courtroom-ready evidence logs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{isAuthenticated ? 'Open Analyst Studio' : 'Get Started Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-all"
              >
                Create Analyst Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= MINIMALIST FOOTER ================= */}
      <footer className="border-t border-slate-800/80 bg-[#060911] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-slate-400 font-semibold">DeepForensics Platform</span>
            <span>•</span>
            <span className="font-mono">Academic & Enterprise Forensic Edition</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#34d399]" />
              System Status: All Models Nominal
            </span>
            <span>© 2026 DeepForensics Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
