import type { Level } from './cycle.types'
import type { Series } from './series.types'
import type { Subject } from './subject.types'

export interface SubjectClassCoefficient {
  id: number
  subject_id: number
  level_id: number
  series_id: number | null
  coefficient: number
  hours_per_week: number | null
  created_at: string
  updated_at: string
  subject?: Subject
  level?: Level
  series?: Series
}

export interface CoefficientFormData {
  subject_id: number
  level_id: number
  series_id?: number | null
  coefficient: number
  hours_per_week?: number | null
}

export interface CoefficientTotals {
  total_coefficient: number
  total_hours: number
}

export interface CoefficientIndexResponse {
  data: SubjectClassCoefficient[]
  totals: CoefficientTotals
}

export interface CoefficientComparisonSubject {
  code: string
  name: string
  coefficients: Record<string, number | null>
}

export interface CoefficientComparisonResponse {
  subjects: CoefficientComparisonSubject[]
  totals: Record<string, number>
  series: string[]
}

export interface DuplicateCoefficientsData {
  source_level_id: number
  source_series_id?: number | null
  target_level_id: number
  target_series_id?: number | null
  strategy: 'replace' | 'merge'
}

export interface DuplicateReport {
  created_count: number
  skipped_count: number
  replaced_count: number
}
