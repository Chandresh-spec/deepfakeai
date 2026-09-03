import { api } from './api'
import type { MediaFile, MediaFileListItem } from '../types/media'

export const mediaService = {
  /**
   * Upload media file (Image, Video, Audio, Text)
   */
  uploadMedia: async (
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<MediaFile> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<MediaFile>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onUploadProgress(percentCompleted)
        }
      },
    })
    return response.data
  },

  /**
   * List all media files for authenticated user
   */
  listMedia: async (): Promise<MediaFileListItem[]> => {
    const response = await api.get<MediaFileListItem[]>('/media')
    return response.data
  },

  /**
   * Get specific media details and extracted metadata
   */
  getMediaDetails: async (mediaId: string): Promise<MediaFile> => {
    const response = await api.get<MediaFile>(`/media/${mediaId}`)
    return response.data
  },

  /**
   * Get deep Error Level Analysis (ELA) and FFT frequency forensic report
   */
  getDeepForensics: async (mediaId: string): Promise<Record<string, any>> => {
    const response = await api.get(`/media/${mediaId}/forensics`)
    return response.data
  },

  /**
   * Delete uploaded media file
   */
  deleteMedia: async (mediaId: string): Promise<void> => {
    await api.delete(`/media/${mediaId}`)
  },

  /**
   * Get direct streaming/preview URL for a stored media file asset
   */
  getMediaFileUrl: (mediaId: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api/v1'
    return `${baseUrl}/media/${mediaId}/file`
  },

  /**
   * Get direct streaming URL for ELA JPEG difference image
   */
  getElaImageUrl: (mediaId: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api/v1'
    return `${baseUrl}/media/${mediaId}/ela`
  },
}
