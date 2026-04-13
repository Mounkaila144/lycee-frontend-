import type { Level } from './cycle.types'
import type { Series } from './series.types'

export interface Classe {
  id: number
  academic_year_id: number
  level_id: number
  series_id: number | null
  section: string
  name: string
  max_capacity: number
  head_teacher_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  level?: Level
  series?: Series
  academic_year?: { id: number; name: string }
  head_teacher?: { id: number; firstname: string; lastname: string }
  students_count?: number
}

export interface ClasseFormData {
  academic_year_id: number
  level_id: number
  series_id?: number | null
  section: string
  max_capacity: number
  head_teacher_id?: number | null
}

export interface ClasseQueryParams {
  academic_year_id?: number
  cycle_id?: number
  level_id?: number
  series_id?: number
  search?: string
}

export interface ClasseStats {
  total_classes: number
  total_capacity: number
  by_cycle: Record<string, number>
  by_level: Record<string, number>
}
