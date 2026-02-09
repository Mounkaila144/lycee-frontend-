/**
 * Compensation Types
 * Types for compensation rules and application
 */

import type { GradeStudent } from './grade.types';

/**
 * Compensation rules configuration
 */
export interface CompensationRules {
  id?: number;
  enabled: boolean;
  min_semester_average: number;
  min_compensable_grade: number;
  max_compensated_modules: number;
  allow_professional: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Compensation log entry
 */
export interface CompensationLog {
  id: number;
  student_id: number;
  module_id: number;
  semester_id: number;
  original_status: string;
  new_status: string;
  semester_average: number;
  module_average: number;
  applied_at: string;
  applied_by: number;
  removed_at: string | null;
  removed_by: number | null;
  student?: GradeStudent;
  module?: {
    id: number;
    code: string;
    name: string;
  };
}

/**
 * Compensable module for a student
 */
export interface CompensableModule {
  module_id: number;
  module_code: string;
  module_name: string;
  module_average: number | null;
  credits: number;
  is_compensated: boolean;
  can_compensate: boolean;
  reason?: string;
}

/**
 * Compensation simulation result for a single student
 */
export interface CompensationSimulationStudent {
  student_id: number;
  student_name: string;
  student_matricule: string;
  semester_average: number | null;
  compensable_modules: CompensableModule[];
  compensable_count: number;
  already_compensated_count: number;
}

/**
 * Compensation simulation result
 */
export interface CompensationSimulationResult {
  semester_id: number;
  total_students: number;
  eligible_students: number;
  total_compensable_modules: number;
  students: CompensationSimulationStudent[];
}

/**
 * Compensation statistics
 */
export interface CompensationStatistics {
  total_students: number;
  students_with_compensation: number;
  total_compensated_modules: number;
  average_compensated_per_student: number;
  compensation_rate: number;
}

/**
 * Apply compensation response
 */
export interface ApplyCompensationResponse {
  message: string;
  applied_count: number;
}

/**
 * Student compensation history entry
 */
export interface StudentCompensationHistory {
  student_id: number;
  logs: CompensationLog[];
  total_compensated: number;
}
