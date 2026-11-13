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

export interface ClasseStudentEnrollment {
  id: number
  classe_id: number
  academic_year_id: number
  assignment_type: string
  status: string
  enrolled_at: string | null
  final_decision: string | null
}

export interface ClasseStudent {
  id: number
  matricule: string
  firstname: string
  lastname: string
  full_name?: string
  birthdate?: string | null
  sex?: string | null
  phone?: string | null
  status: string
  class_enrollment?: ClasseStudentEnrollment
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
  per_page?: number
}

export interface ClasseStudentsQueryParams {
  search?: string
  per_page?: number
}

export interface ClasseStatsGroup {
  id: number
  code: string
  name: string
  count: number
}

export interface ClasseStats {
  total_classes: number
  total_capacity: number
  classes_by_cycle: ClasseStatsGroup[]
  classes_by_level: ClasseStatsGroup[]
}

export interface HeadTeacherOption {
  id: number
  firstname: string
  lastname: string | null
  name: string
  email: string | null
}
