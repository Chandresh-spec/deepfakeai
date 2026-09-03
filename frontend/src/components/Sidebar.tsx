import React from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  FileText,
  Search,
  FileSearch,
  Sparkles,
  BarChart3,
  Settings,
  LayoutDashboard,
} from 'lucide-react'

export interface SidebarProps {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  setMobileOpen,
}) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: Search, label: 'Analyze Media', path: '/dashboard' },
    { icon: FileSearch, label: 'Forensics', path: '/dashboard' },
    { icon: Sparkles, label: 'Explainable AI', path: '/dashboard' },
    { icon: FileText, label: 'Reports', path: '/dashboard' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard' },
    { icon: Settings, label: 'Settings', path: '/profile' },
  ]

  const sidebarContent = (
    <aside className="w-[220px] shrink-0 h-full flex flex-col bg-[#0b101e] border-r border-[#1e293b]">
      {/* Brand Header */}
      <div className="px-5 py-6 border-b border-[#1e293b]">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[15px] font-extrabold text-white leading-tight block">
              DeepForensics
            </span>
            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider leading-none block mt-0.5 font-mono">
              AI FORENSICS SUITE
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                item.active
                  ? 'bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 border border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${item.active ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: System Status + Engine Online */}
      <div className="px-3 pb-4 space-y-3">
        {/* System Status Card */}
        <div className="p-3.5 bg-[#0e1526] border border-[#1e293b] rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[12px] font-bold text-white">System Status</span>
          </div>
          <div className="text-[12px] text-slate-400 font-medium">
            All Systems Operational
          </div>

          {/* Sparkline mini-graph */}
          <div className="h-8 flex items-end gap-[3px] px-1 py-1 rounded bg-slate-950/60 border border-slate-800/50">
            {[40, 65, 45, 80, 55, 90, 70, 85, 50, 95, 60, 80, 100, 75, 85].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`flex-1 rounded-[1px] ${
                  i >= 13 ? 'bg-cyan-400 shadow-[0_0_4px_#22d3ee]' : 'bg-indigo-500/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Engine Online indicator */}
        <div className="p-3.5 bg-[#0e1526] border border-[#1e293b] rounded-2xl flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="space-y-0.5">
            <span className="text-[12px] font-bold text-white block leading-tight">Engine Online</span>
            <span className="text-[10px] text-slate-400 block font-mono">Security • Faster • Accurate</span>
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — drawer overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 z-50 lg:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}
