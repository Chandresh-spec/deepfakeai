export type AnalysisVerdictLabel = 'authentic' | 'suspicious' | 'manipulated'

export interface ExplanationFactor {
  name: string
  description: string
  impact: 'high' | 'medium' | 'low'
  score: number
}

export interface ExplanationResult {
  summary: string
  factors: ExplanationFactor[]
  has_heatmap?: boolean
  heatmap_path?: string
  overlay_path?: string
  frames?: any[]
  xai?: Record<string, any>
}

export interface ModalityResult {
  modality: string
  label: AnalysisVerdictLabel
  confidence: number
}

export interface AnalysisResponse {
  id: string
  media_id: string
  user_id: string
  provider: string
  is_demo: boolean
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'unsupported'
  job_id?: string
  label?: AnalysisVerdictLabel
  confidence?: number
  raw_score?: number
  result_json?: Record<string, any>
  explanation_json?: ExplanationResult
  modality_results_json?: ModalityResult[]
  error_message?: string
  created_at: string
  completed_at?: string
}

export interface AnalysisWithMedia extends AnalysisResponse {
  media_filename?: string
  media_type?: string
}
