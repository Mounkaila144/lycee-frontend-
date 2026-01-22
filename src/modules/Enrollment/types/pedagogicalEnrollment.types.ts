/**
 * Enrollment Module - Pedagogical Enrollment Types
 * Types for module enrollment and pedagogical registration
 */

/**
 * Enrollment Status
 */
export type EnrollmentStatus = 'Pending' | 'Confirmed' | 'Cancelled';

/**
 * Module Type - Obligatoire vs Optionnel
 */
export type ModuleType = 'mandatory' | 'optional';

/**
 * Prerequisite Check Status
 */
export type PrerequisiteStatus = 'met' | 'not_met' | 'override';

/**
 * Available Module for Enrollment
 * Represents a module that can be selected for enrollment
 */
export interface AvailableModule {
  id: number;
  code: string;
  name: string;
  credits_ects: number;
  type: ModuleType;
  semester_id: number;
  semester_name?: string;
  capacity: number | null;
  enrolled_count: number;
  remaining_capacity: number | null;
  is_full: boolean;
  prerequisite_status: PrerequisiteStatus;
  prerequisite_message?: string;
  prerequisites?: ModulePrerequisite[];
  groups?: ModuleGroup[];
  description?: string;
  coefficient?: number;
}

/**
 * Module Prerequisite Information
 */
export interface ModulePrerequisite {
  id: number;
  module_id: number;
  prerequisite_module_id: number;
  prerequisite_module_code: string;
  prerequisite_module_name: string;
  min_grade?: number;
  is_strict: boolean;
  is_met: boolean;
  student_grade?: number;
}

/**
 * Module Group (TD/TP)
 */
export interface ModuleGroup {
  id: number;
  module_id: number;
  name: string;
  type: 'CM' | 'TD' | 'TP';
  capacity: number;
  enrolled_count: number;
  remaining_capacity: number;
  is_full: boolean;
  schedule_info?: string;
}

/**
 * Student Enrollment (Main enrollment record)
 */
export interface StudentEnrollment {
  id: number;
  student_id: number;
  program_id: number;
  level: string;
  semester_id: number;
  academic_year_id: number;
  enrollment_date: string;
  status: EnrollmentStatus;
  total_credits: number;
  modules_count: number;
  created_at: string;
  updated_at: string;

  // Relations
  student?: {
    id: number;
    matricule: string;
    firstname: string;
    lastname: string;
  };
  program?: {
    id: number;
    code: string;
    name: string;
  };
  semester?: {
    id: number;
    name: string;
    code: string;
  };
  module_enrollments?: StudentModuleEnrollment[];
}

/**
 * Student Module Enrollment (Individual module enrollment)
 */
export interface StudentModuleEnrollment {
  id: number;
  student_id: number;
  module_id: number;
  semester_id: number;
  enrollment_date: string;
  group_id?: number;
  status: EnrollmentStatus;
  override_reason?: string;
  created_at: string;
  updated_at: string;

  // Relations
  module?: {
    id: number;
    code: string;
    name: string;
    credits_ects: number;
  };
  group?: ModuleGroup;
}

/**
 * Module Selection (for form submission)
 */
export interface ModuleSelection {
  module_id: number;
  group_id?: number;
}

/**
 * Pedagogical Enrollment Request Data
 */
export interface PedagogicalEnrollmentRequest {
  student_id: number;
  program_id: number;
  level: string;
  semester_id: number;
  academic_year_id: number;
  module_selections: ModuleSelection[];
  override_prerequisites?: {
    module_id: number;
    reason: string;
  }[];
}

/**
 * Enrollment Result Response
 */
export interface EnrollmentResult {
  success: boolean;
  enrollment: StudentEnrollment;
  total_credits: number;
  modules_count: number;
  mandatory_modules: number;
  optional_modules: number;
  warnings?: string[];
  errors?: string[];
}

/**
 * Available Modules Response
 */
export interface AvailableModulesResponse {
  mandatory: AvailableModule[];
  optional: AvailableModule[];
  total_mandatory_credits: number;
  total_optional_credits: number;
  min_semester_credits: number;
  max_semester_credits: number;
}

/**
 * Capacity Status Response
 */
export interface ModuleCapacityStatus {
  module_id: number;
  module_code: string;
  module_name: string;
  capacity: number | null;
  enrolled: number;
  remaining: number | null;
  is_full: boolean;
  reservation_expires_at?: string;
}

/**
 * Credit Validation Result
 */
export interface CreditValidationResult {
  total_credits: number;
  mandatory_credits: number;
  optional_credits: number;
  min_required: number;
  max_allowed: number;
  is_valid: boolean;
  message?: string;
}

/**
 * Enrollment Sheet (PDF) Request
 */
export interface EnrollmentSheetRequest {
  student_id: number;
  enrollment_id: number;
  format?: 'pdf' | 'html';
}

/**
 * Enrollment Filters
 */
export interface EnrollmentFilters {
  student_id?: number;
  program_id?: number;
  level?: string;
  semester_id?: number;
  academic_year_id?: number;
  status?: EnrollmentStatus;
}

/**
 * Enrollment Query Params
 */
export interface EnrollmentQueryParams extends EnrollmentFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Paginated Enrollments Response
 */
export interface PaginatedEnrollmentsResponse {
  data: StudentEnrollment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Group Assignment Request
 */
export interface GroupAssignmentRequest {
  module_id: number;
  group_id: number;
}

/**
 * Prerequisite Override Request
 */
export interface PrerequisiteOverrideRequest {
  enrollment_id: number;
  module_id: number;
  student_id: number;
  reason: string;
  approved_by?: number;
}
