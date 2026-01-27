/**
 * Grades Module - Grade Types
 * Types for grade management and entry
 */

/**
 * Grade Entity
 * Matches backend: Modules/Grades/Entities/Grade.php
 */
export interface Grade {
  id: number;
  student_id: number;
  evaluation_id: number;
  score: number | null;
  is_absent: boolean;
  comment: string | null;
  entered_by: number;
  entered_at: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  student?: GradeStudent;
  evaluation?: Evaluation;
  entered_by_user?: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

/**
 * Student for grade entry (simplified)
 */
export interface GradeStudent {
  id: number;
  matricule: string;
  firstname: string;
  lastname: string;
  full_name?: string;
  photo?: string | null;
}

/**
 * Student with grade for grade entry table
 */
export interface StudentGradeEntry {
  student: GradeStudent;
  grade: Grade | null;
  score: number | null;
  is_absent: boolean;
  comment: string | null;
  is_modified: boolean;
}

/**
 * Grade Form Data for single entry
 */
export interface GradeFormData {
  student_id: number;
  evaluation_id: number;
  score: number | null;
  is_absent: boolean;
  comment?: string;
}

/**
 * Batch grade entry request
 */
export interface BatchGradeRequest {
  grades: GradeEntryItem[];
}

/**
 * Single grade entry item in batch
 */
export interface GradeEntryItem {
  evaluation_id: number;
  student_id: number;
  score: number | null;
  is_absent: boolean;
  comment?: string;
}

/**
 * Grade Statistics
 */
export interface GradeStatistics {
  count: number;
  average: number;
  min: number;
  max: number;
  median: number;
  pass_rate: number;
  distribution: GradeDistribution;
  absent_count: number;
  entered_count: number;
  missing_count: number;
}

/**
 * Grade Distribution for histogram
 */
export interface GradeDistribution {
  '0-5': number;
  '5-10': number;
  '10-15': number;
  '15-20': number;
}

/**
 * Evaluation Entity
 */
export interface Evaluation {
  id: number;
  module_id: number;
  name: string;
  code: string;
  type: EvaluationType;
  coefficient: number;
  max_score: number;
  date: string | null;
  is_published: boolean;
  published_at: string | null;
  semester_id: number;
  academic_year_id: number;
  created_at: string;
  updated_at: string;

  // Relations
  module?: EvaluationModule;
  grades_count?: number;
  students_count?: number;
}

/**
 * Evaluation Type
 */
export type EvaluationType = 'CC' | 'CC1' | 'CC2' | 'TP' | 'TD' | 'Examen' | 'Rattrapage' | 'Projet' | 'Oral' | 'Autre';

/**
 * Module for evaluation (simplified)
 */
export interface EvaluationModule {
  id: number;
  code: string;
  name: string;
  credits: number;
  semester_id: number;
  programme_level_id: number;
}

/**
 * Teacher Module Assignment
 * Matches API response from /api/frontend/teacher/my-modules
 */
export interface TeacherModule {
  id: number;
  code: string;
  name: string;
  credits: number;
  programme: {
    id: number;
    name: string | null;
  };
  semester: {
    id: number;
    name: string;
  };
  type: string;
  hours_allocated: number;
  evaluation_count: number;
  grades_entered: number;
}

/**
 * Publish grades request
 */
export interface PublishGradesRequest {
  evaluation_id: number;
  notify_students?: boolean;
}

/**
 * Publish grades response
 */
export interface PublishGradesResponse {
  success: boolean;
  message: string;
  published_count: number;
  published_at: string;
}

/**
 * Grade modification request (after publication)
 */
export interface GradeModificationRequest {
  grade_id: number;
  new_score: number | null;
  is_absent: boolean;
  reason: string;
}

/**
 * Grade modification response
 */
export interface GradeModificationResponse {
  success: boolean;
  message: string;
  requires_approval: boolean;
  modification_id?: number;
}

/**
 * Grade filters
 */
export interface GradeFilters {
  evaluation_id?: number;
  student_id?: number;
  is_published?: boolean;
  is_absent?: boolean;
  min_score?: number;
  max_score?: number;
}

/**
 * Export grades request
 */
export interface ExportGradesRequest {
  evaluation_id: number;
  format?: 'xlsx' | 'csv';
  include_absent?: boolean;
}

/**
 * Import grades preview row
 */
export interface ImportGradePreviewRow {
  row_number: number;
  matricule: string;
  student_name: string;
  score: number | null;
  is_absent: boolean;
  status: 'valid' | 'warning' | 'error';
  errors: string[];
  warnings: string[];
  student_found: boolean;
  student_id?: number;
}

/**
 * Import grades preview response
 */
export interface ImportGradesPreviewResponse {
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  warning_rows: number;
  preview: ImportGradePreviewRow[];
}

/**
 * Import grades execute request
 */
export interface ImportGradesExecuteRequest {
  evaluation_id: number;
  file_path: string;
  overwrite_existing?: boolean;
}

/**
 * Import grades result
 */
export interface ImportGradesResult {
  success: boolean;
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  error_details: Array<{
    row: number;
    matricule: string;
    error: string;
  }>;
}

/**
 * Auto-save status
 */
export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Grade entry state for a single cell
 */
export type GradeCellState = 'entered' | 'missing' | 'absent' | 'modified';
