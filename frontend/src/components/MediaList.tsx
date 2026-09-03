import React, { useState, useMemo } from 'react'
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Search,
  Trash2,
  Clock,
  ArrowRight,
  Layers,
  Plus,
  Play,
} from 'lucide-react'
import { mediaService } from '../services/mediaService'
import type { MediaFileListItem, MediaFilterCategory } from '../types/media'

interface MediaListProps {
  items: MediaFileListItem[]
  onSelectMedia: (mediaId: string) => void
  onDeleteMedia: (mediaId: string) => void
  onAddMedia?: () => void
  isLoading?: boolean
}

export const MediaList: React.FC<MediaListProps> = ({
  items,
  onSelectMedia,
  onDeleteMedia,
  onAddMedia,
  isLoading = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<MediaFilterCategory>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const categories: { id: MediaFilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Files', icon: null },
    { id: 'image', label: 'Images', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'video', label: 'Videos', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'audio', label: 'Audio', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'text', label: 'Documents', icon: <FileText className="w-3.5 h-3.5" /> },
  ]

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.media_type === activeCategory
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.filename.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [items, activeCategory, searchQuery])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatRelativeDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'Sep 1, 2026'
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? items.length
                : items.filter((i) => i.media_type === cat.id).length
            const isActive = activeCategory === cat.id

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] font-mono ${isActive ? 'text-white' : 'text-slate-500'}`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right Search Input + Add Asset CTA */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {onAddMedia && (
            <button
              onClick={onAddMedia}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-blue-500/30 text-blue-400 hover:text-blue-300 font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Media Grid (2 Columns) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-72 rounded-2xl bg-[#0e1526]/60 border border-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0e1526]/40 space-y-2">
          <Layers className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-white">No files found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
            {searchQuery
              ? `No media assets match "${searchQuery}".`
              : 'Upload images, videos, audio, or text documents to start forensic inspection.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const previewUrl = mediaService.getMediaFileUrl(item.id)

            return (
              <div
                key={item.id}
                className="group rounded-2xl bg-[#0e1526] border border-[#1e293b] hover:border-blue-500/40 p-4 transition-all duration-200 shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Frame */}
                  <div className="h-44 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden mb-3 relative border border-slate-800/60">
                    {item.media_type === 'image' ? (
                      <img
                        src={previewUrl}
                        alt={item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : item.media_type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          src={previewUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : item.media_type === 'audio' ? (
                      <div className="flex flex-col items-center gap-1.5 text-emerald-400">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Music className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Audio Track
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-amber-400">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Document File
                        </span>
                      </div>
                    )}

                    {/* Modality Tag Badge (Top-Right) */}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/80 text-white backdrop-blur-md shadow-sm">
                      {item.media_type === 'image'
                        ? 'IMAGE'
                        : item.media_type === 'video'
                        ? 'VIDEO'
                        : item.media_type === 'audio'
                        ? 'AUDIO'
                        : 'DOC'}
                    </span>
                  </div>

                  {/* Title (Truncated cleanly) */}
                  <h4 className="text-sm font-bold text-white truncate mb-1" title={item.filename}>
                    {item.filename}
                  </h4>

                  {/* Size & Date Sub-row */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-3">
                    <span>{formatFileSize(item.file_size)}</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatRelativeDate(item.created_at)}
                    </span>
                  </div>
                </div>

                {/* Bottom Action: Inspect Case centered */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => onSelectMedia(item.id)}
                    className="flex-1 py-1.5 text-center text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center justify-center gap-1.5 hover:underline transition-colors"
                  >
                    <span>Inspect Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteMedia(item.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
