// Module-Semester Assignment Types

import type { Module } from './module.types'
import type { Semester } from './academicCalendar.types'

/**
 * Module-Semester Assignment
 * Represents the association between a module and a semester
 */
export interface ModuleSemesterAssignment {
  id: number
  module_id: number
  semester_id: number
  program_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  module?: Module
  semester?: Semester
}

/**
 * Form input for creating/updating module-semester assignment
 */
export interface ModuleSemesterAssignmentFormInput {
  module_id: number
  semester_id: number
  program_id?: number | null
  is_active?: boolean
}

/**
 * Response when attaching modules to a semester
 */
export interface AttachModulesResponse {
  success: boolean
  message: string
  assignments: ModuleSemesterAssignment[]
}

/**
 * Response when detaching a module from a semester
 */
export interface DetachModuleResponse {
  success: boolean
  message: string
}

/**
 * Filters for querying module-semester assignments
 */
export interface ModuleSemesterFilters {
  semester_id?: number
  module_id?: number
  program_id?: number
  is_active?: boolean
}
