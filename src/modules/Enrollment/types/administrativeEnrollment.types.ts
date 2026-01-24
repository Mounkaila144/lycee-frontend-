/**
 * Enrollment Module - Administrative Enrollment Types
 * Types for student administrative enrollment (StudentEnrollment)
 */

/**
 * Administrative Enrollment Status
 */
export type AdministrativeEnrollmentStatus = 'Actif' | 'Suspendu' | 'Annulé' | 'Terminé' | 'Validé' | 'Rejeté';

/**
 * Academic Level
 */
export type AcademicLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2';

/**
 * Administrative Enrollment - Main entity
 * Represents a student's enrollment in a programme for a specific semester
 */
export interface AdministrativeEnrollment {
  id: number;
  student_id: number;
  programme_id: number;
  academic_year_id: number;
  semester_id: number;
  level: AcademicLevel;
  group_id?: number | null;
  enrollment_date: string;
  status: AdministrativeEnrollmentStatus;
  is_active: boolean;
  notes?: string;
  enrolled_by?: number | null;
  created_at: string;
  updated_at: string;

  // Computed fields
  total_credits?: number;
  enrolled_modules_count?: number;
  module_enrollments_count?: number;

  // Relations
  student?: AdministrativeEnrollmentStudent;
  programme?: AdministrativeEnrollmentProgramme;
  academic_year?: AdministrativeEnrollmentAcademicYear;
  semester?: AdministrativeEnrollmentSemester;
  enrolled_by_user?: AdministrativeEnrollmentUser;
  module_enrollments?: AdministrativeModuleEnrollment[];
}

/**
 * Embedded Student in enrollment
 */
export interface AdministrativeEnrollmentStudent {
  id: number;
  matricule: string;
  firstname: string;
  lastname: string;
  email?: string;
  status?: string;
  full_name?: string;
}

/**
 * Embedded Programme in enrollment
 */
export interface AdministrativeEnrollmentProgramme {
  id: number;
  code: string;
  libelle: string;
  type?: string;
}

/**
 * Embedded Academic Year in enrollment
 */
export interface AdministrativeEnrollmentAcademicYear {
  id: number;
  name: string;
  is_active?: boolean;
}

/**
 * Embedded Semester in enrollment
 */
export interface AdministrativeEnrollmentSemester {
  id: number;
  name: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Embedded User in enrollment
 */
export interface AdministrativeEnrollmentUser {
  id: number;
  firstname: string;
  lastname: string;
}

/**
 * Module Enrollment within Administrative Enrollment
 */
export interface AdministrativeModuleEnrollment {
  id: number;
  student_enrollment_id: number;
  module_id: number;
  status: string;
  notes?: string;
  module?: {
    id: number;
    code: string;
    libelle: string;
    credits_ects: number;
    type: string;
  };
}

/**
 * Create Enrollment Request
 */
export interface CreateAdministrativeEnrollmentRequest {
  student_id: number;
  programme_id: number;
  semester_id: number;
  level: AcademicLevel;
  module_ids?: number[];
  group_id?: number;
  auto_enroll_obligatory?: boolean;
  notes?: string;
}

/**
 * Update Enrollment Request
 */
export interface UpdateAdministrativeEnrollmentRequest {
  level?: AcademicLevel;
  group_id?: number | null;
  status?: AdministrativeEnrollmentStatus;
  notes?: string;
}

/**
 * Enrollment Filters
 */
export interface AdministrativeEnrollmentFilters {
  student_id?: number;
  programme_id?: number;
  semester_id?: number;
  academic_year_id?: number;
  level?: AcademicLevel;
  status?: AdministrativeEnrollmentStatus;
  search?: string;
}

/**
 * Query Params (extends Filters with pagination)
 */
export interface AdministrativeEnrollmentQueryParams extends AdministrativeEnrollmentFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Paginated Response
 */
export interface PaginatedAdministrativeEnrollmentsResponse {
  data: AdministrativeEnrollment[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Single Enrollment Response
 */
export interface AdministrativeEnrollmentResponse {
  data: AdministrativeEnrollment;
  message?: string;
}

/**
 * Create Enrollment Response
 */
export interface CreateAdministrativeEnrollmentResponse {
  message: string;
  data: {
    enrollment: AdministrativeEnrollment;
    modules_enrolled_count: number;
  };
}

/**
 * Available Module for Enrollment
 */
export interface AvailableModuleForEnrollment {
  id: number;
  code: string;
  libelle: string;
  credits_ects: number;
  type: 'Obligatoire' | 'Optionnel';
  already_enrolled?: boolean;
  has_conflicts?: boolean;
  capacity?: number | null;
  enrolled_count?: number;
}

/**
 * Available Modules Response
 */
export interface AvailableModulesForEnrollmentResponse {
  data: AvailableModuleForEnrollment[];
  meta: {
    total_modules: number;
    obligatory_modules: number;
    optional_modules: number;
    obligatory_credits: number;
    optional_credits: number;
    total_credits: number;
  };
}

/**
 * Add Modules Request
 */
export interface AddModulesToEnrollmentRequest {
  module_ids: number[];
}

/**
 * Add Modules Response
 */
export interface AddModulesToEnrollmentResponse {
  message: string;
  data: {
    added_modules: AdministrativeModuleEnrollment[];
    total_credits: number;
  };
}

/**
 * Remove Modules Request
 */
export interface RemoveModulesFromEnrollmentRequest {
  module_ids: number[];
}

/**
 * Remove Modules Response
 */
export interface RemoveModulesFromEnrollmentResponse {
  message: string;
  data: {
    removed_count: number;
    errors: string[];
    total_credits: number;
  };
}

/**
 * Enrollment Statistics
 */
export interface AdministrativeEnrollmentStatistics {
  total_enrollments: number;
  active_enrollments: number;
  by_level: Record<AcademicLevel, number>;
  by_status: Record<AdministrativeEnrollmentStatus, number>;
  total_credits_enrolled: number;
  average_credits_per_student: number;
}
