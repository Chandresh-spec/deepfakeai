import { api } from './api'
import type { AnalysisResponse, AnalysisWithMedia } from '../types/analysis'

export const analysisService = {
  /**
   * Run AI detection analysis on a media file synchronously
   * @param mediaId - The media file ID
   * @param mediaType - Optional modality override: 'image' | 'video' | 'audio' | 'text'
   * @param options - Optional analysis options
   */
  runAnalysis: async (mediaId: string, mediaType?: string, options?: Record<string, any>): Promise<AnalysisResponse> => {
    const response = await api.post<AnalysisResponse>('/analysis/run', {
      media_id: mediaId,
      media_type: mediaType || undefined,
      options,
    })
    return response.data
  },

  /**
   * Queue background AI detection analysis asynchronously via Celery
   */
  runAsyncAnalysis: async (
    mediaId: string,
    options?: Record<string, any>
  ): Promise<{ status: string; analysis_id: string; task_id: string }> => {
    const response = await api.post('/analysis/run-async', {
      media_id: mediaId,
      options,
    })
    return response.data
  },

  /**
   * Poll status of Celery background detection job
   */
  getTaskStatus: async (taskId: string): Promise<{ task_id: string; status: string; result?: any }> => {
    const response = await api.get(`/analysis/task/${taskId}/status`)
    return response.data
  },

  /**
   * Get direct streaming URL for XAI Grad-CAM heatmap overlay image
   */
  getHeatmapUrl: (analysisId: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api/v1'
    return `${baseUrl}/analysis/${analysisId}/heatmap`
  },

  /**
   * Get analysis details by ID
   */
  getAnalysisDetails: async (analysisId: string): Promise<AnalysisResponse> => {
    const response = await api.get<AnalysisResponse>(`/analysis/${analysisId}`)
    return response.data
  },

  /**
   * List all user analysis runs
   */
  listUserAnalyses: async (): Promise<AnalysisWithMedia[]> => {
    const response = await api.get<AnalysisWithMedia[]>('/analysis')
    return response.data
  },

  /**
   * List analysis history for a specific media file
   */
  listMediaAnalyses: async (mediaId: string): Promise<AnalysisResponse[]> => {
    const response = await api.get<AnalysisResponse[]>(`/analysis/media/${mediaId}`)
    return response.data
  },
}
