// Types for Specialization Management

export type SpecializationType = 'Obligatoire' | 'Optionnelle'
export type SelectionMode = 'Exclusive' | 'Multiple'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'waitlist' | 'cancelled'
export type AcademicLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2'

export interface Specialization {
  id: number
  code: string
  name: string
  description: string | null
  programme_id: number
  available_from_level: AcademicLevel
  capacity: number | null
  responsable_id: number | null
  min_average_required: number | null
  application_start_date: string | null
  application_end_date: string | null
  type: SpecializationType
  selection_mode: SelectionMode
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  
  // Relations
  programme?: {
    id: number
    code: string
    name: string
  }
  responsable?: {
    id: number
    username: string
    email: string
  }
  candidates_count?: number
  accepted_count?: number
  available_places?: number
}

export interface SpecializationFormInput {
  code: string
  name: string
  description?: string
  programme_id: number
  available_from_level: AcademicLevel
  capacity?: number
  responsable_id?: number
  min_average_required?: number
  application_start_date?: string
  application_end_date?: string
  type: SpecializationType
  selection_mode: SelectionMode
  is_active: boolean
}

export interface StudentSpecialization {
  id: number
  student_id: number
  specialization_id: number
  application_date: string
  status: ApplicationStatus
  average_at_application: number | null
  preference_order: number
  assigned_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  
  // Relations
  student?: {
    id: number
    username: string
    email: string
    first_name?: string
    last_name?: string
  }
  specialization?: Specialization
}

export interface SpecializationApplication {
  specialization_id: number
  preference_order: number
  average_at_application?: number
}

export interface AssignmentCriteria {
  min_average?: number
  prioritize_by?: 'average' | 'application_date' | 'preference'
  auto_waitlist?: boolean
}

export interface AssignmentResult {
  assigned: number[]
  rejected: number[]
  waitlisted: number[]
  message: string
}
