// Evaluation Configuration Types

export type EvaluationType = 'CC' | 'TP' | 'Projet' | 'Examen' | 'Rattrapage'

export type EvaluationStatus = 'Draft' | 'Published'

export interface EvaluationConfig {
  id: number
  module_id: number
  semester_id: number
  name: string
  type: EvaluationType
  coefficient: number
  max_score: number
  planned_date: string | null
  is_eliminatory: boolean
  elimination_threshold: number | null
  order: number
  status: EvaluationStatus
  created_at: string
  updated_at: string
  // Relations (conditionnelles)
  module?: {
    id: number
    code: string
    name: string
  }
  semester?: {
    id: number
    name: string
  }
}

export interface EvaluationConfigFormInput {
  name: string
  type: EvaluationType
  coefficient: number
  max_score?: number
  planned_date?: string | null
  is_eliminatory?: boolean
  elimination_threshold?: number | null
  order?: number
}

export interface EvaluationTemplate {
  id: number
  name: string
  description: string
  config_json: {
    evaluations: Array<{
      name: string
      type: EvaluationType
      coefficient: number
      max_score?: number
      is_eliminatory?: boolean
      elimination_threshold?: number
    }>
  }
  is_active: boolean
  created_at: string
  updated_at: string
  // Metadata
  total_coefficient?: number
  evaluations_count?: number
}

export interface ValidationResult {
  valid: boolean
  warnings: string[]
  errors: string[]
}

export interface PublishConfigResponse {
  success: boolean
  message: string
  published_count: number
}
