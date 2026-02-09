/**
 * Grades Module - Retake (Rattrapage) Types
 * Matches backend: Modules/NotesEvaluations/Entities/RetakeEnrollment.php & RetakeGrade.php
 */
import type { GradeStudent, EvaluationModule } from './grade.types';

// ===== Retake Enrollment =====

export type RetakeEnrollmentStatus = 'pending' | 'scheduled' | 'graded' | 'validated' | 'cancelled';

export interface RetakeEnrollment {
  id: number;
  student_id: number;
  module_id: number;
  semester_id: number;
  original_average: number | null;
  status: RetakeEnrollmentStatus;
  identified_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  student?: GradeStudent;
  module?: EvaluationModule;
  retake_grade?: RetakeGrade | null;

  // Computed
  status_label?: string;
  gap_to_validation?: number | null;
}

// ===== Retake Grade =====

export type RetakeGradeStatus = 'draft' | 'submitted' | 'validated' | 'published';

export interface RetakeGrade {
  id: number;
  retake_enrollment_id: number;
  score: number | null;
  is_absent: boolean;
  entered_by: number | null;
  entered_at: string | null;
  status: RetakeGradeStatus;
  submitted_at: string | null;
  validated_at: string | null;
  published_at: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  retake_enrollment?: RetakeEnrollment;
  entered_by_user?: {
    id: number;
    firstname: string;
    lastname: string;
  };

  // Computed
  effective_score?: number | null;
  new_average?: number | null;
  is_improved?: boolean;
  improvement_amount?: number | null;
}

// ===== Retake Student (combined view) =====

export interface RetakeStudentEntry {
  retake_enrollment_id: number;
  student: GradeStudent;
  module?: EvaluationModule;
  original_average: number | null;
  retake_score: number | null;
  is_absent: boolean;
  new_average: number | null;
  is_improved: boolean;
  improvement_amount: number | null;
  status: RetakeGradeStatus | 'pending_entry';
  comment: string | null;
}

// ===== Statistics =====

export interface RetakeStatistics {
  total_students: number;
  students_with_retakes: number;
  retake_rate: number;
  total_retakes: number;
  distribution: {
    '1_module': number;
    '2_modules': number;
    '3_plus_modules': number;
  };
  most_failed_modules: Array<{
    module_id: number;
    module_name: string;
    module_code: string;
    student_count: number;
    avg_original_grade: number;
  }>;
}

export interface RetakeGradeStatistics {
  total_students: number;
  graded: number;
  pending_entry: number;
  absent: number;
  improved: number;
  improvement_rate: number;
  passed_before_retake: number;
  passed_after_retake: number;
  new_passes: number;
  pass_rate: number;
  average_retake_score: number | null;
  min_retake_score: number | null;
  max_retake_score: number | null;
}

export interface RetakeModuleSummary {
  module_id: number;
  module_name: string;
  module_code: string;
  student_count: number;
  graded_count: number;
  avg_original_grade: number;
  teacher?: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

export interface RetakeStudentSummary {
  student: GradeStudent;
  retake_count: number;
  modules: Array<{
    module_id: number;
    module_name: string;
    original_average: number | null;
    status: RetakeEnrollmentStatus;
  }>;
}

// ===== API Requests =====

export interface StoreRetakeGradeRequest {
  retake_enrollment_id: number;
  score: number | null;
  is_absent: boolean;
  comment?: string;
}

export interface StoreRetakeGradesBatchRequest {
  grades: Array<{
    retake_enrollment_id: number;
    score: number | null;
    is_absent: boolean;
    comment?: string;
  }>;
}

export interface IdentifyRetakesResponse {
  message: string;
  students_impacted: number;
  total_retakes: number;
  unique_modules_affected: number;
}

export interface SubmitRetakeGradesResponse {
  message: string;
  submitted_count: number;
}

export interface ValidateRetakeGradesResponse {
  message: string;
  validated_count: number;
}

export interface PublishRetakeGradesResponse {
  message: string;
  published: number;
  errors: Array<{
    enrollment_id: number;
    error: string;
  }>;
}

// ===== Recalculation =====

export interface RecalculationLog {
  id: number;
  student_id: number;
  semester_id: number;
  trigger: string;
  changes: RecalculationChange[];
  recalculated_at: string;
  student?: GradeStudent;
}

export interface RecalculationChange {
  module_id: number;
  module_name: string;
  old_average: number;
  new_average: number;
  improved: boolean;
  old_status?: string;
  new_status?: string;
}

export interface RecalculateResponse {
  message: string;
  count: number;
  status?: 'queued' | null;
  results?: Array<{
    student_id: number;
    changes: RecalculationChange[];
  }>;
}

// ===== Teacher Retake Module =====

export interface TeacherRetakeModule {
  id: number;
  code: string;
  name: string;
  credits: number;
  semester: {
    id: number;
    name: string;
  };
  retake_student_count: number;
  graded_count: number;
  submitted: boolean;
}

// ===== Submission check =====

export interface RetakeSubmissionCheck {
  can_submit: boolean;
  total_students: number;
  grades_entered: number;
  submittable_count: number;
  missing_grades: number;
}
