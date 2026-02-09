/**
 * Module Result Types
 * Types for module results generation and management
 */

import type { GradeStudent } from './grade.types';

export type MentionType = 'Très Bien' | 'Bien' | 'Assez Bien' | 'Passable' | 'Non admis';

export type ModuleResultStatus = 'validated' | 'compensated' | 'failed' | 'absent' | 'pending';

/**
 * Module student result (individual student result for a module)
 */
export interface ModuleStudentResult {
  student_id: number;
  module_id: number;
  semester_id: number;
  average: number | null;
  rank: number | null;
  total_ranked: number | null;
  rank_display?: string;
  mention: MentionType | null;
  status: ModuleResultStatus;
  status_label?: string;
  is_final: boolean;
  is_published: boolean;
  published_at: string | null;
  calculated_at: string | null;
  missing_evaluations_count: number;
  compensation_applied_at: string | null;
  student?: GradeStudent;
}

/**
 * Module result statistics
 */
export interface ModuleResultStatistics {
  total_students: number;
  calculated_count: number;
  published_count: number;
  class_average: number | null;
  min_average: number | null;
  max_average: number | null;
  pass_rate: number | null;
  status_distribution: {
    validated: number;
    compensated: number;
    failed: number;
    absent: number;
    pending: number;
  };
  mention_distribution: {
    'Très Bien': number;
    'Bien': number;
    'Assez Bien': number;
    'Passable': number;
    'Non admis': number;
  };
}

/**
 * Module result filters
 */
export interface ModuleResultFilters {
  search?: string;
  status?: ModuleResultStatus;
  mention?: MentionType;
  sort_by?: 'rank' | 'average' | 'name';
}

/**
 * Generate results response
 */
export interface GenerateResultsResponse {
  message: string;
  count: number;
  module_id: number;
  semester_id: number;
}

/**
 * Publish results response
 */
export interface PublishResultsResponse {
  message: string;
  published_count: number;
}

/**
 * Students by status response
 */
export interface StudentsByStatusResponse {
  status: ModuleResultStatus;
  students: ModuleStudentResult[];
  count: number;
}
