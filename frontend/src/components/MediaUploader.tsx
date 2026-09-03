import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  FiUploadCloud,
  FiX,
  FiFileText,
  FiImage,
  FiVideo,
  FiMusic,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { mediaService } from '../services/mediaService'
import type { MediaFile } from '../types/media'

interface MediaUploaderProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (media: MediaFile) => void
}

const MAX_FILE_SIZE_MB = 100

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrorMsg(null)
    if (rejectedFiles && rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0]
      if (err?.code === 'file-too-large') {
        setErrorMsg(`File exceeds maximum size limit of ${MAX_FILE_SIZE_MB}MB`)
      } else {
        setErrorMsg(err?.message || 'Unsupported file format or invalid selection')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
  })

  if (!isOpen) return null

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setErrorMsg(null)

    try {
      const result = await mediaService.uploadMedia(selectedFile, (progress) => {
        setUploadProgress(progress)
      })

      toast.success(`Media "${result.filename}" uploaded successfully!`)
      onSuccess(result)
      handleClose()
    } catch (err: any) {
      const message =
        err.response?.data?.detail || err.message || 'Failed to upload media file'
      setErrorMsg(message)
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (isUploading) return
    setSelectedFile(null)
    setUploadProgress(0)
    setErrorMsg(null)
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith('image/')) return <FiImage className="w-8 h-8 text-blue-400" />
    if (type.startsWith('video/')) return <FiVideo className="w-8 h-8 text-purple-400" />
    if (type.startsWith('audio/')) return <FiMusic className="w-8 h-8 text-emerald-400" />
    return <FiFileText className="w-8 h-8 text-amber-400" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FiUploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload Media Asset</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Ingest multimedia file for forensic hashing and EXIF metadata extraction
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-[var(--color-text-muted)] hover:text-white transition-colors p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                  : 'border-[var(--color-border-accent)] bg-[var(--color-bg-secondary)]/40 hover:border-blue-400/50 hover:bg-[var(--color-bg-secondary)]'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
                <FiUploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                {isDragActive ? 'Drop the file here...' : 'Click to upload or drag & drop'}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto mb-4">
                Supports Image (JPG, PNG, WEBP), Video (MP4, MOV, AVI), Audio (MP3, WAV, M4A), and Text (TXT, PDF)
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--color-text-secondary)] bg-[var(--color-bg-card)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                Max file size: <span className="text-blue-400 font-semibold">{MAX_FILE_SIZE_MB}MB</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                    {getFileIcon(selectedFile)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs font-mono text-[var(--color-text-muted)]">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown Type'}
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded-md hover:bg-red-500/10 transition-colors"
                  >
                    Change File
                  </button>
                )}
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
                  <div className="flex justify-between text-xs font-mono text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <FiLoader className="w-3.5 h-3.5 animate-spin" />
                      Uploading & Extracting Metadata...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-bg-card)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-secondary)] hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isUploading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4" />
                Confirm & Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
