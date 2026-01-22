// Types de périodes académiques (valeurs backend en français)
export type AcademicPeriodType = 'Jour férié' | 'Vacances' | 'Session examens' | 'Inscription pédagogique' | 'Rattrapage' | 'Autre'

export type AcademicYearStatus = 'Active' | 'Terminée' | 'Archivée'

export interface AcademicYear {
  id: number
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  status: AcademicYearStatus
  created_at: string
  updated_at: string
  // Relations
  semesters?: Semester[]
}

export interface AcademicYearFormInput {
  name: string
  start_date: string
  end_date: string
}

export interface Semester {
  id: number
  academic_year_id: number
  name: string // S1 or S2
  start_date: string
  end_date: string
  courses_start_date: string | null
  courses_end_date: string | null
  exams_start_date: string | null
  exams_end_date: string | null
  is_closed: boolean
  created_at: string
  updated_at: string
  // Relations
  academic_year?: AcademicYear
  periods?: AcademicPeriod[]
}

export interface SemesterFormInput {
  academic_year_id: number
  name: string
  start_date: string
  end_date: string
  courses_start_date?: string | null
  courses_end_date?: string | null
  exams_start_date?: string | null
  exams_end_date?: string | null
}

export interface AcademicPeriod {
  id: number
  semester_id: number
  name: string
  type: AcademicPeriodType
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  // Relations
  semester?: Semester
}

export interface AcademicPeriodFormInput {
  semester_id: number
  name: string
  type: AcademicPeriodType
  start_date: string
  end_date: string
}

export interface EvaluationPeriod {
  id: number
  semester_id: number
  name: string
  type: AcademicPeriodType
  start_date: string
  end_date: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  semester?: Semester
}

export interface EvaluationPeriodFormInput {
  semester_id: number
  name: string
  type: AcademicPeriodType
  start_date: string
  end_date: string
  description?: string
}

export interface CloseSemesterResponse {
  success: boolean
  message: string
  semester: Semester
}

// Helper functions
export const getAcademicYearStatusColor = (
  status: AcademicYearStatus
): 'success' | 'default' | 'warning' => {
  const colors: Record<AcademicYearStatus, 'success' | 'default' | 'warning'> = {
    Active: 'success',
    Terminée: 'default',
    Archivée: 'warning'
  }
  return colors[status]
}

export const getAcademicPeriodTypeLabel = (type: AcademicPeriodType): string => {
  // Les types sont déjà en français, on les retourne directement
  return type
}

export const getAcademicPeriodTypeColor = (
  type: AcademicPeriodType
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const colors: Record<
    AcademicPeriodType,
    'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  > = {
    'Jour férié': 'error',
    'Session examens': 'warning',
    'Inscription pédagogique': 'info',
    Rattrapage: 'error',
    Autre: 'secondary',
    Vacances: 'success'
  }
  return colors[type]
}

// Evaluation Period helpers (use same type as Academic Periods)
export const getEvaluationPeriodTypeLabel = (type: AcademicPeriodType): string => {
  // Les types sont déjà en français complet, on les retourne directement
  return type
}

export const getEvaluationPeriodTypeColor = (
  type: AcademicPeriodType
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  // Use same colors as academic periods
  return getAcademicPeriodTypeColor(type)
}
