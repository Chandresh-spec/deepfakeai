import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  ArrowRight,
  Cpu,
  Fingerprint,
  AudioLines,
  FileCheck,
  AlertTriangle,
  Lock,
  Eye,
  Sliders,
} from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../hooks/useAuth'

/**
 * Fonts used by this design — add once, globally (e.g. in index.html <head> or via @font-face):
 *   Zilla Slab (600, 700)   — headlines, case-file voice
 *   IBM Plex Sans (400, 500, 600) — UI text
 *   IBM Plex Mono (400, 500) — forensic readouts only (hashes, scores, timestamps)
 *
 * <link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
 */

const slab = { fontFamily: '"Zilla Slab", Georgia, serif' }
const sans = { fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif' }
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' }

type DemoTab = 'image' | 'audio' | 'video' | 'provenance'

const TABS: { id: DemoTab; label: string; exhibit: string }[] = [
  { id: 'image', label: 'Image', exhibit: 'A' },
  { id: 'audio', label: 'Voice', exhibit: 'B' },
  { id: 'video', label: 'Video', exhibit: 'C' },
  { id: 'provenance', label: 'Ledger', exhibit: 'D' },
]

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<DemoTab>('image')
  const [showHeatmap, setShowHeatmap] = useState(true)

  return (
    <div className="min-h-screen flex flex-col bg-[#15130F] text-[#EDE7DA] selection:bg-[#C97A2E]/30" style={sans}>
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO ================= */}
        <section className="relative pt-16 pb-24 border-b border-[#2C2820] overflow-hidden">
          {/* faint room texture, not a glow */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[repeating-linear-gradient(180deg,#EDE7DA_0px,#EDE7DA_1px,transparent_1px,transparent_3px)]" />

          <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-6 text-[#C97A2E]">
                <Fingerprint className="w-4 h-4" />
                <span className="text-xs tracking-wide" style={mono}>DeepForensics 2.4 · Multi-modal engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F5F1E6] leading-[1.08] mb-6" style={slab}>
                Every manipulated frame leaves a mark. We show you where.
              </h1>

              <p className="max-w-lg text-base sm:text-lg text-[#B8AF9C] leading-relaxed mb-9">
                Autonomous forensic inspection across images, voice, and video — with the underlying
                evidence laid bare, not just a score. Built for analysts who have to explain their findings.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3.5 mb-14">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/login'}
                  className="px-6 py-3 rounded bg-[#C97A2E] hover:bg-[#E2924A] text-[#15130F] font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>{isAuthenticated ? 'Open Forensic Workspace' : 'Start Forensic Analysis'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#demo"
                  className="px-6 py-3 rounded border border-[#3A352A] hover:border-[#C97A2E]/60 text-[#D8D0BE] hover:text-[#F5F1E6] font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open the live inspector</span>
                </a>
              </div>

              {/* Ledger-style metrics, not centered stat tiles */}
              <div className="border-t border-[#2C2820] pt-5 max-w-lg">
                {[
                  ['Ensemble benchmark', '99.4%'],
                  ['Pipeline latency', '< 450ms'],
                  ['Modalities covered', 'Image · Audio · Video · Docs'],
                  ['Custody record', 'SHA-256, tamper-evident'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between py-1.5 text-sm border-b border-[#211E17] last:border-0">
                    <span className="text-[#8B8272]">{label}</span>
                    <span className="text-[#F5F1E6]" style={mono}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: a single exhibit card, tilted, pinned — the hero's one bold element */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative -rotate-2 w-full max-w-sm">
                <div className="absolute -top-3 left-10 w-10 h-3 bg-[#8B8272]/50 rotate-6 rounded-xs" />
                <div className="bg-[#EDE6D3] text-[#201B12] rounded-sm p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]">
                  <div className="flex items-center justify-between border-b border-[#C9BFA4] pb-3 mb-4">
                    <span className="text-[11px] tracking-wide text-[#6B6250]" style={mono}>EXHIBIT A-08</span>
                    <span className="text-[11px] px-2 py-0.5 border border-[#B5493A] text-[#B5493A] rotate-2 inline-block" style={mono}>
                      MANIPULATED
                    </span>
                  </div>
                  <div className="relative h-48 rounded-sm bg-[#DCD2B8] border border-[#C9BFA4] overflow-hidden flex items-center justify-center mb-4">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#B5493A]/25 via-transparent to-[#C97A2E]/20" />
                    <div className="relative w-28 h-32 border-2 border-dashed border-[#B5493A] rounded flex flex-col items-center justify-center text-center px-2">
                      <AlertTriangle className="w-4 h-4 text-[#B5493A] mb-1" />
                      <span className="text-[9px] font-semibold text-[#B5493A]" style={mono}>WARPED BOUNDS</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[#6B6250]">Confidence</span>
                    <span className="font-semibold text-[#B5493A]" style={mono}>98.6%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE CONSOLE ================= */}
        <section id="demo" className="py-24 max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F1E6] mb-3" style={slab}>
              Step onto the light table
            </h2>
            <p className="text-sm text-[#B8AF9C] leading-relaxed">
              Switch between modalities to see how the ensemble surfaces manipulation signatures —
              the same view an analyst works from, not a marketing mockup of one.
            </p>
          </div>

          {/* Folder tabs */}
          <div className="flex items-end gap-1 px-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-t text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#EDE6D3] text-[#201B12]'
                    : 'bg-[#1D1A14] text-[#8B8272] hover:text-[#D8D0BE] border border-b-0 border-[#2C2820]'
                }`}
              >
                <span className="mr-1.5" style={mono}>{tab.exhibit}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Paper console body */}
          <div className="bg-[#EDE6D3] text-[#201B12] rounded-b rounded-tr p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left viewport */}
            <div className="lg:col-span-7 min-h-[340px]">
              {activeTab === 'image' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B6250]" style={mono}>sample_synthetic_face_08.png</span>
                    <button
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        showHeatmap
                          ? 'bg-[#B5493A]/10 text-[#B5493A] border-[#B5493A]/40'
                          : 'bg-white/40 text-[#6B6250] border-[#C9BFA4]'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      {showHeatmap ? 'Heatmap on' : 'Heatmap off'}
                    </button>
                  </div>

                  <div className="relative h-56 rounded bg-[#DCD2B8] border border-[#C9BFA4] overflow-hidden flex items-center justify-center">
                    {showHeatmap && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#B5493A]/20 via-transparent to-[#C97A2E]/25 pointer-events-none" />
                    )}
                    <div className="relative w-40 h-44 rounded border-2 border-dashed border-[#B5493A] flex flex-col items-center justify-center p-3 text-center">
                      <AlertTriangle className="w-4 h-4 text-[#B5493A] mb-2" />
                      <span className="text-[11px] font-semibold text-[#B5493A]" style={mono}>WARPED FACIAL BOUNDS</span>
                      <span className="text-[10px] text-[#6B6250] mt-1" style={mono}>Diff-morph error +0.892</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6B6250]" style={mono}>
                    <span>1024 × 1024</span>
                    <span className="text-[#B5493A]">Grad-CAM · layer 4</span>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B6250]" style={mono}>interview_speech_clone.wav</span>
                    <span className="text-xs text-[#6B6250]" style={mono}>FFT spectra</span>
                  </div>

                  <div className="h-56 rounded bg-[#DCD2B8] border border-[#C9BFA4] p-4 flex flex-col justify-end space-y-2">
                    <div className="text-[11px] text-[#6B6250] flex justify-between" style={mono}>
                      <span>Frequency (kHz)</span>
                      <span>00:04.2s</span>
                    </div>
                    <div className="h-36 flex items-end gap-1 px-2">
                      {[50, 75, 90, 45, 80, 100, 65, 85, 95, 40, 60, 92, 70, 88, 55, 78, 98, 40, 85, 60].map((val, i) => (
                        <div
                          key={i}
                          style={{ height: `${val}%` }}
                          className={`flex-1 rounded-xs ${
                            i >= 8 && i <= 14 ? 'bg-[#B5493A]' : 'bg-[#8B8272]/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-[#6B6250] flex justify-between" style={mono}>
                    <span>48.0 kHz</span>
                    <span className="text-[#B5493A]">High-freq cutoff artifact @ 3.4kHz</span>
                  </div>
                </div>
              )}

              {activeTab === 'video' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B6250]" style={mono}>press_conference_restream.mp4</span>
                    <span className="text-xs text-[#6B6250]" style={mono}>Temporal frame stack</span>
                  </div>

                  <div className="h-56 rounded bg-[#DCD2B8] border border-[#C9BFA4] p-4 flex items-center justify-around gap-2">
                    {[14, 15, 16, 17].map((f) => (
                      <div key={f} className="flex-1 h-44 rounded bg-white/40 border border-[#C9BFA4] p-2 flex flex-col justify-between text-center">
                        <span className="text-[10px] text-[#8B8272]" style={mono}>F_{f}</span>
                        <div className="w-full h-20 rounded bg-[#DCD2B8] border border-[#C9BFA4] flex items-center justify-center">
                          <span className="text-[9px] text-[#B5493A]" style={mono}>{f === 16 ? 'JITTER' : 'STABLE'}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#B5493A]" style={mono}>{f === 16 ? '0.98' : '0.41'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-[#6B6250] flex justify-between" style={mono}>
                    <span>29.97 fps</span>
                    <span className="text-[#B5493A]">Lip-sync desync +120ms</span>
                  </div>
                </div>
              )}

              {activeTab === 'provenance' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B6250]" style={mono}>c2pa_manifest_ledger.json</span>
                    <span className="text-xs text-[#6B8F6A]" style={mono}>Tamper-evident · SHA-256</span>
                  </div>

                  <div className="h-56 rounded bg-[#1D1A14] text-[#D8D0BE] border border-[#2C2820] p-4 text-xs overflow-y-auto space-y-2" style={mono}>
                    <div className="text-[#6B6250]">// Cryptographic evidence signature</div>
                    <div><span className="text-[#C97A2E]">sha256</span>: 3a8e9...bd82f1</div>
                    <div><span className="text-[#C97A2E]">c2pa_assertion</span>: synthesized_facial_morph</div>
                    <div><span className="text-[#C97A2E]">camera_serial</span>: <span className="text-[#B5493A]">null [stripped]</span></div>
                    <div><span className="text-[#C97A2E]">compression_quantization</span>: double_jpeg_detected</div>
                    <div><span className="text-[#C97A2E]">chain_of_custody</span>: verified_auditable</div>
                  </div>

                  <div className="text-xs text-[#6B6250] flex justify-between" style={mono}>
                    <span>ISO 27037</span>
                    <span className="text-[#6B8F6A]">Seal valid</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right telemetry */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="p-4 rounded border border-[#C9BFA4] bg-white/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B6250]">Overall verdict</span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold border border-[#B5493A] text-[#B5493A]" style={mono}>
                    MANIPULATED
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#4A4436]">Confidence score</span>
                    <span className="font-semibold text-[#B5493A]" style={mono}>98.6%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#C9BFA4]/60 overflow-hidden">
                    <div className="h-full bg-[#B5493A] w-[98.6%]" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded border border-[#C9BFA4] bg-white/30 space-y-2.5">
                <span className="text-xs text-[#6B6250] block mb-1">Ensemble breakdown</span>
                {[
                  ['SightEngine face model', '97.2%'],
                  ['RealityDefender multimodal', '99.1%'],
                  ['Spectral ELA heuristic', '88.4%'],
                ].map(([name, score]) => (
                  <div key={name} className="flex justify-between items-center text-xs">
                    <span className="text-[#4A4436]">{name}</span>
                    <span className="font-semibold text-[#B5493A]" style={mono}>{score}</span>
                  </div>
                ))}
              </div>

              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="w-full py-2.5 rounded bg-[#201B12] hover:bg-[#332C1F] text-[#EDE6D3] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Test your own media</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================= CAPABILITIES ================= */}
        <section id="features" className="py-24 border-t border-[#2C2820] bg-[#100E0A]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-xl mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F1E6] mb-3" style={slab}>
                What the ensemble actually checks
              </h2>
              <p className="text-sm text-[#B8AF9C] leading-relaxed">
                Four independent lines of evidence, cross-referenced rather than trusted alone.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  icon: Fingerprint,
                  exhibit: 'A',
                  title: 'Pixel-level ELA & residual analysis',
                  copy: 'Error level analysis, DCT frequency artifacts, and compression residue expose localized copy-move and diffusion-generated patches.',
                  tags: ['Grad-CAM', 'DCT quantization', 'Noise resampling'],
                },
                {
                  icon: AudioLines,
                  exhibit: 'B',
                  title: 'Voice cloning & spectrogram audit',
                  copy: 'Synthetic vocoder signatures, phase inconsistencies, and cadence drift pinpoint cloned voices from major TTS and diffusion models.',
                  tags: ['FFT spectral analysis', 'Pitch discontinuity', 'Resemble API'],
                },
                {
                  icon: Cpu,
                  exhibit: 'C',
                  title: 'Multi-provider consensus scoring',
                  copy: 'Verdicts are aggregated across specialized detectors so no single model\u2019s blind spot becomes your finding.',
                  tags: ['Weighted consensus', 'No single point of bias'],
                },
                {
                  icon: Lock,
                  exhibit: 'D',
                  title: 'Court-admissible export & hashes',
                  copy: 'Timestamped reports carry file hashes, model parameters, heatmaps, and the disclaimers your legal team will ask for.',
                  tags: ['ISO 27037', 'PDF & JSON export', 'Audit log'],
                },
              ].map(({ icon: Icon, exhibit, title, copy, tags }) => (
                <div key={exhibit} className="relative p-7 rounded bg-[#1D1A14] border border-[#2C2820] hover:border-[#3A352A] transition-colors">
                  <span className="absolute -top-3 left-6 px-2 py-0.5 text-[11px] bg-[#100E0A] border border-[#2C2820] text-[#8B8272]" style={mono}>
                    Exhibit {exhibit}
                  </span>
                  <Icon className="w-5 h-5 text-[#C97A2E] mb-4 mt-2" />
                  <h3 className="text-lg font-bold text-[#F5F1E6] mb-2" style={slab}>{title}</h3>
                  <p className="text-sm text-[#B8AF9C] leading-relaxed mb-4">{copy}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-sm bg-[#100E0A] border border-[#2C2820] text-[11px] text-[#B8AF9C]" style={mono}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PIPELINE ================= */}
        <section id="pipeline" className="py-24 border-t border-[#2C2820]">
          <div className="max-w-4xl mx-auto px-6">
            <div className="max-w-xl mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F1E6] mb-3" style={slab}>
                How a file moves through the lab
              </h2>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="hidden md:block absolute top-4 left-0 right-0 h-px bg-[repeating-linear-gradient(90deg,#C97A2E_0,#C97A2E_6px,transparent_6px,transparent_12px)]" />

              {[
                { n: '1', title: 'Cryptographic intake', copy: 'Files are validated, hashed with SHA-256, and indexed — metadata stripped or preserved per custody policy.' },
                { n: '2', title: 'Ensemble deep scan', copy: 'Workers distribute the media across visual, acoustic, and heuristic models in parallel.' },
                { n: '3', title: 'Verdict & export', copy: 'Findings become an explainable evidence card — heatmaps, confidence, exportable dossier.' },
              ].map(({ n, title, copy }) => (
                <div key={n} className="relative">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-[#15130F] border-2 border-[#C97A2E] text-[#C97A2E] flex items-center justify-center text-sm font-semibold mb-4" style={mono}>
                    {n}
                  </div>
                  <h4 className="text-base font-bold text-[#F5F1E6] mb-2" style={slab}>{title}</h4>
                  <p className="text-xs text-[#B8AF9C] leading-relaxed">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CLOSING CTA ================= */}
        <section className="py-24 border-t border-[#2C2820] bg-[#100E0A]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F1E6] mb-4" style={slab}>
              Open the file. See the evidence.
            </h2>
            <p className="text-base text-[#B8AF9C] mb-8 max-w-md mx-auto">
              Inspect your first piece of media with explainable models and a courtroom-ready record.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="px-8 py-3.5 rounded bg-[#C97A2E] hover:bg-[#E2924A] text-[#15130F] font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>{isAuthenticated ? 'Open Analyst Studio' : 'Get started now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="px-8 py-3.5 rounded border border-[#3A352A] hover:border-[#C97A2E]/60 text-[#D8D0BE] hover:text-[#F5F1E6] font-medium text-sm transition-colors"
              >
                Create analyst account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#2C2820] bg-[#100E0A] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B8272]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C97A2E]" />
            <span className="text-[#D8D0BE] font-semibold">DeepForensics</span>
            <span className="text-[#4A4436]">·</span>
            <span>Academic & enterprise forensic edition</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#6B8F6A]">
              <FileCheck className="w-3.5 h-3.5" />
              All models nominal
            </span>
            <span>© 2026 DeepForensics Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage