import React, { useState } from 'react'
import { FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiShield, FiCpu, FiFileText } from 'react-icons/fi'
import toast from 'react-hot-toast'
import type { MediaFile } from '../types/media'

interface MetadataViewerProps {
  media: MediaFile
}

export const MetadataViewer: React.FC<MetadataViewerProps> = ({ media }) => {
  const [copiedHash, setCopiedHash] = useState<boolean>(false)
  const [showExifDetails, setShowExifDetails] = useState<boolean>(false)

  const handleCopyHash = () => {
    navigator.clipboard.writeText(media.sha256_hash)
    setCopiedHash(true)
    toast.success('SHA-256 Hash copied to clipboard!')
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const meta = media.metadata_json || {}
  const hasExifTags = meta.exif_tags && Object.keys(meta.exif_tags).length > 0

  return (
    <div className="space-y-4 text-sm">
      {/* Cryptographic SHA-256 Hash */}
      <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <FiShield className="w-4 h-4" />
            Cryptographic SHA-256 Checksum
          </div>
          <button
            onClick={handleCopyHash}
            className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-white bg-[var(--color-bg-card)] px-2.5 py-1 rounded-md border border-[var(--color-border)] transition-colors"
          >
            {copiedHash ? (
              <>
                <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <FiCopy className="w-3.5 h-3.5" />
                <span>Copy Hash</span>
              </>
            )}
          </button>
        </div>
        <div className="font-mono text-xs text-[var(--color-text-primary)] break-all bg-[var(--color-bg-card)] p-2.5 rounded-lg border border-[var(--color-border)]">
          {media.sha256_hash}
        </div>
      </div>

      {/* Primary Extracted Parameters */}
      <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-2">
          <FiCpu className="w-4 h-4 text-cyan-400" />
          Extracted Forensic Properties
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {media.media_type === 'image' && (
            <>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Dimensions</span>
                <span className="font-semibold text-white font-mono">
                  {meta.width && meta.height ? `${meta.width} × ${meta.height}` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Aspect Ratio</span>
                <span className="font-semibold text-white font-mono">{meta.aspect_ratio ?? 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Color Mode</span>
                <span className="font-semibold text-white font-mono">{meta.mode ?? 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Channels</span>
                <span className="font-semibold text-white font-mono">{meta.channels ?? 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">EXIF Header</span>
                <span className={`font-semibold font-mono ${meta.has_exif ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {meta.has_exif ? `Present (${meta.exif_keys_count} tags)` : 'Stripped / None'}
                </span>
              </div>
            </>
          )}

          {media.media_type === 'video' && (
            <>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Resolution</span>
                <span className="font-semibold text-white font-mono">{meta.resolution ?? 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Frame Rate</span>
                <span className="font-semibold text-white font-mono">{meta.fps ? `${meta.fps} FPS` : 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Total Frames</span>
                <span className="font-semibold text-white font-mono">{meta.frame_count ?? 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Duration</span>
                <span className="font-semibold text-white font-mono">
                  {meta.duration_seconds ? `${meta.duration_seconds} sec` : 'N/A'}
                </span>
              </div>
            </>
          )}

          {media.media_type === 'audio' && (
            <>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Audio Format</span>
                <span className="font-semibold text-white font-mono">{meta.format?.toUpperCase() ?? 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Container Size</span>
                <span className="font-semibold text-white font-mono">
                  {meta.container_size_bytes
                    ? `${(meta.container_size_bytes / (1024 * 1024)).toFixed(2)} MB`
                    : 'N/A'}
                </span>
              </div>
            </>
          )}

          {media.media_type === 'text' && (
            <>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Word Count</span>
                <span className="font-semibold text-white font-mono">{meta.word_count ?? 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Character Count</span>
                <span className="font-semibold text-white font-mono">{meta.character_count ?? 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-muted)] uppercase block font-mono">Line Count</span>
                <span className="font-semibold text-white font-mono">{meta.line_count ?? 'N/A'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* EXIF Metadata Detailed Breakdown Accordion */}
      {hasExifTags && (
        <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden">
          <button
            onClick={() => setShowExifDetails(!showExifDetails)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-card)]/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-purple-400" />
              Detailed EXIF Tags ({Object.keys(meta.exif_tags!).length})
            </span>
            {showExifDetails ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
          </button>

          {showExifDetails && (
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-card)]/50 max-h-60 overflow-y-auto space-y-2 font-mono text-xs">
              {Object.entries(meta.exif_tags!).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1 border-b border-[var(--color-border)]/40 last:border-none">
                  <span className="text-blue-400">{key}</span>
                  <span className="text-[var(--color-text-primary)] truncate max-w-[220px]">{String(val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
