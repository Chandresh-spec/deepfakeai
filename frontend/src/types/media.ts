export type MediaType = 'image' | 'video' | 'audio' | 'text'

export interface ImageMetadata {
  width?: number
  height?: number
  format?: string
  mode?: string
  aspect_ratio?: number
  has_exif?: boolean
  exif_keys_count?: number
  exif_tags?: Record<string, string | number | boolean>
  channels?: number
  error?: string
}

export interface VideoMetadata {
  width?: number
  height?: number
  resolution?: string
  fps?: number
  frame_count?: number
  duration_seconds?: number
  error?: string
}

export interface AudioMetadata {
  container_size_bytes?: number
  format?: string
  duration_seconds?: number
  error?: string
}

export interface TextMetadata {
  character_count?: number
  word_count?: number
  line_count?: number
  error?: string
}

export type ForensicMetadata = ImageMetadata & VideoMetadata & AudioMetadata & TextMetadata

export interface MediaFile {
  id: string
  user_id: string
  filename: string
  storage_path: string
  file_size: number
  mime_type: string
  media_type: MediaType
  sha256_hash: string
  metadata_json: ForensicMetadata
  created_at: string
}

export interface MediaFileListItem {
  id: string
  filename: string
  file_size: number
  mime_type: string
  media_type: MediaType
  sha256_hash: string
  created_at: string
}

export type MediaFilterCategory = 'all' | 'image' | 'video' | 'audio' | 'text'
