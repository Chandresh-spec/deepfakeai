import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Activity, ChevronDown } from 'lucide-react'
import type { AnalysisWithMedia } from '../types/analysis'

interface ForensicChartsProps {
  analyses: AnalysisWithMedia[]
}

export const ForensicCharts: React.FC<ForensicChartsProps> = ({ analyses }) => {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0e1526]/40 text-xs text-slate-400 font-mono">
        Upload files and run deepfake detection to populate interactive forensic analytics.
      </div>
    )
  }

  // 1. Calculate Verdict Distribution
  const verdictCounts: Record<string, number> = { authentic: 0, suspicious: 0, manipulated: 0 }
  analyses.forEach((a) => {
    const l = (a.label || 'suspicious').toLowerCase()
    if (l === 'authentic') verdictCounts.authentic += 1
    else if (l === 'manipulated') verdictCounts.manipulated += 1
    else verdictCounts.suspicious += 1
  })

  const totalRuns = analyses.length || 1
  const authPct = Math.round((verdictCounts.authentic / totalRuns) * 100)
  const suspPct = Math.round((verdictCounts.suspicious / totalRuns) * 100)
  const manipPct = Math.max(0, 100 - authPct - suspPct)

  const verdictData = [
    { name: 'AUTHENTIC', value: verdictCounts.authentic || (analyses.length === 0 ? 1 : 0), color: '#10b981' },
    { name: 'SUSPICIOUS', value: verdictCounts.suspicious, color: '#f59e0b' },
    { name: 'MANIPULATED', value: verdictCounts.manipulated, color: '#ef4444' },
  ].filter((d) => d.value > 0)

  // 2. Prepare Historical Confidence Data (Recent 7 Runs)
  const confidenceData = analyses
    .slice(0, 7)
    .reverse()
    .map((a, idx) => {
      const fn = a.media_filename || `Asset #${idx + 1}`
      const shortName = fn.length > 11 ? `${fn.slice(0, 9)}...` : fn
      return {
        index: `#${idx + 1}`,
        name: shortName,
        fullName: fn,
        confidence: Math.round((a.confidence || 0) * 100),
        verdict: (a.label || 'suspicious').toUpperCase(),
      }
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Verdict Distribution Donut Chart (5 cols) */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0e1526] border border-[#1e293b] flex flex-col justify-between shadow-xl">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 mb-0.5">
            AI Verdict Breakdown
          </h3>
        </div>

        <div className="flex items-center justify-between gap-4 my-4">
          {/* Donut graphic */}
          <div className="w-44 h-44 relative flex items-center justify-center shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verdictData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {verdictData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090e1a',
                    borderColor: '#1e293b',
                    borderRadius: '10px',
                    color: '#f1f5f9',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered total label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-white font-mono leading-none">
                {analyses.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-1">
                TOTAL
              </span>
            </div>
          </div>

          {/* Right vertical breakdown legend */}
          <div className="flex-1 space-y-3.5 pl-2 text-[13px] font-mono">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Authentic</span>
              </span>
              <span className="text-slate-300 font-semibold">
                {verdictCounts.authentic} ({authPct}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Suspicious</span>
              </span>
              <span className="text-slate-300 font-semibold">
                {verdictCounts.suspicious} ({suspPct}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Manipulated</span>
              </span>
              <span className="text-slate-300 font-semibold">
                {verdictCounts.manipulated} ({manipPct}%)
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>Multi-Model Consensus</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            Active
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </span>
        </div>
      </div>

      {/* Historical Detection Confidence Trend Bar Chart (7 cols) */}
      <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0e1526] border border-[#1e293b] flex flex-col justify-between shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Detection Confidence Scores (%)
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer hover:border-slate-700 transition-colors">
            <span>Recent {confidenceData.length || 7} Runs</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        <div className="h-52 w-full my-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090e1a',
                  borderColor: '#1e293b',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
                formatter={(val: any, _name: any, item: any) => [
                  `${val}% Confidence (${item.payload.verdict})`,
                  item.payload.fullName,
                ]}
              />
              <Bar
                dataKey="confidence"
                fill="#4338ca"
                radius={[6, 6, 0, 0]}
                className="hover:opacity-90 transition-opacity"
              >
                {confidenceData.map((_, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill="url(#blueBarGradient)"
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="blueBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5 text-blue-400">
            <Activity className="w-3.5 h-3.5" /> Model Accuracy Range
          </span>
          <span className="text-slate-400">Scale: 0% – 100% Normalized</span>
        </div>
      </div>
    </div>
  )
}
