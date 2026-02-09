/**
 * Eliminatory Grades Types
 * Types for managing eliminatory modules and thresholds
 */

/**
 * Eliminatory module configuration
 */
export interface EliminatoryModule {
  id: number;
  code: string;
  name: string;
  credits_ects: number;
  threshold: number;
}

/**
 * Student eliminatory status for a specific module
 */
export type EliminatoryStatus = 'not_eliminatory' | 'absent' | 'validated' | 'compensated' | 'to_retake';

/**
 * Student eliminatory status response
 */
export interface StudentEliminatoryStatus {
  status: EliminatoryStatus;
}

/**
 * Failed eliminatory module for a student
 */
export interface FailedEliminatoryModule {
  module_id: number;
  module_name: string;
  module_code: string;
  average: number | null;
  threshold: number;
  status: 'to_retake' | 'absent';
}

/**
 * Student blocked by eliminatory failures
 */
export interface BlockedStudent {
  student_id: number;
  student_name: string;
  student_matricule: string;
  semester_average: number | null;
  failed_modules: FailedEliminatoryModule[];
  failed_count: number;
}

/**
 * Eliminatory statistics for a semester
 */
export interface EliminatoryStatistics {
  eliminatory_modules_count: number;
  eliminatory_modules: EliminatoryModule[];
  blocked_students_count: number;
  total_students: number;
  blocked_percentage: number;
}

/**
 * Toggle eliminatory response
 */
export interface ToggleEliminatoryResponse {
  id: number;
  is_eliminatory: boolean;
}

/**
 * Update threshold response
 */
export interface UpdateThresholdResponse {
  id: number;
  eliminatory_threshold: number;
}

/**
 * Threshold constraints
 */
export const THRESHOLD_CONSTRAINTS = {
  MIN: 5,
  MAX: 20,
  DEFAULT: 10,
} as const;
