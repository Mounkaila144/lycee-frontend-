/**
 * Enrollment Module - Validation Types
 * Types for pedagogical enrollment validation
 */

/**
 * Pedagogical Enrollment Status
 */
export type PedagogicalEnrollmentStatus =
  | 'Draft'
  | 'Complete'
  | 'Pending'
  | 'Validated'
  | 'Rejected'
  | 'Cancelled';

/**
 * Pedagogical Enrollment Entity
 */
export interface PedagogicalEnrollment {
  id: number;
  student_id: number;
  program_id: number;
  level: string;
  academic_year_id: number;
  semester_id: number | null;
  status: PedagogicalEnrollmentStatus;
  total_modules: number;
  total_ects: number;
  modules_check: boolean;
  groups_check: boolean;
  options_check: boolean;
  prerequisites_check: boolean;
  validated_by: number | null;
  validated_at: string | null;
  rejection_reason: string | null;
  contract_pdf_path: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Relations
  student?: {
    id: number;
    matricule: string;
    firstname: string;
    lastname: string;
    email: string;
    photo?: string;
    status: string;
  };
  program?: {
    id: number;
    code: string;
    name: string;
  };
  academic_year?: {
    id: number;
    year: string;
    name: string;
  };
  semester?: {
    id: number;
    code: string;
    name: string;
  };
  validator?: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

/**
 * Validation Checklist
 */
export interface ValidationChecklist {
  administrative: boolean;
  modules_check: boolean;
  ects_check: boolean;
  groups_check: boolean;
  options_check: boolean;
  prerequisites_check: boolean;
  is_complete: boolean;
  details: {
    administrative_status?: string;
    enrolled_modules_count?: number;
    required_modules_count?: number;
    missing_modules?: string[];
    total_ects?: number;
    required_ects?: number;
    group_assignments_count?: number;
    required_group_assignments?: number;
    has_option?: boolean;
    requires_option?: boolean;
    prerequisites_issues?: string[];
  };
}

/**
 * Validate Enrollment Request
 */
export interface ValidateEnrollmentRequest {
  enrollment_id: number;
  validation_notes?: string;
}

/**
 * Reject Enrollment Request
 */
export interface RejectEnrollmentRequest {
  enrollment_id: number;
  rejection_reason: string;
}

/**
 * Batch Validation Request
 */
export interface BatchValidationRequest {
  enrollment_ids: number[];
  validation_notes?: string;
}

/**
 * Batch Validation Result
 */
export interface BatchValidationResult {
  success: number;
  failed: number;
  errors: {
    enrollment_id: number;
    student_name: string;
    error: string;
  }[];
}

/**
 * Enrollment Validation Filters
 */
export interface EnrollmentValidationFilters {
  status?: PedagogicalEnrollmentStatus;
  program_id?: number;
  level?: string;
  academic_year_id?: number;
  semester_id?: number;
  search?: string;
}

/**
 * Enrollment Validation Query Params
 */
export interface EnrollmentValidationQueryParams extends EnrollmentValidationFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Paginated Enrollments Response
 */
export interface PaginatedEnrollmentsValidationResponse {
  data: PedagogicalEnrollment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Enrollment Statistics
 */
export interface EnrollmentValidationStatistics {
  total: number;
  by_status: {
    draft: number;
    complete: number;
    pending: number;
    validated: number;
    rejected: number;
    cancelled: number;
  };
  by_program: {
    program_id: number;
    program_name: string;
    count: number;
  }[];
  validation_rate: number;
  rejection_rate: number;
  average_validation_time_hours: number;
}

/**
 * My Enrollment Status (Frontend student)
 */
export interface MyEnrollmentStatus {
  enrollment: PedagogicalEnrollment | null;
  checklist: ValidationChecklist | null;
  can_submit: boolean;
  status_message: string;
  history: {
    status: PedagogicalEnrollmentStatus;
    changed_at: string;
    changed_by?: string;
    reason?: string;
  }[];
}

/**
 * Contract Download Response
 */
export interface ContractDownloadResponse {
  url: string;
  filename: string;
  generated_at: string;
}
