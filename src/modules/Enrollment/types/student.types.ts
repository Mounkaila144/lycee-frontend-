/**
 * Enrollment Module - Student Types
 * Types for student management and enrollment
 */

/**
 * Student Status Enum
 */
export type StudentStatus = 'Actif' | 'Suspendu' | 'Exclu' | 'Diplômé' | 'Abandon' | 'Transféré';

/**
 * Status Transition Rules
 * Defines which status transitions are allowed
 */
export const STATUS_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  Actif: ['Suspendu', 'Exclu', 'Diplômé', 'Abandon', 'Transféré'],
  Suspendu: ['Actif', 'Exclu', 'Abandon'],
  Exclu: [],
  Diplômé: [],
  Abandon: [],
  Transféré: [],
};

/**
 * Student Status History Entry
 * Records all status changes for a student
 */
export interface StudentStatusHistory {
  id: number;
  student_id: number;
  old_status: StudentStatus;
  new_status: StudentStatus;
  reason: string;
  effective_date: string;
  changed_by: number;
  document_path?: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  changed_by_user?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}

/**
 * Status Change Request Data
 */
export interface StatusChangeRequest {
  status: StudentStatus;
  reason: string;
  effective_date: string;
  document?: File;
}

/**
 * Status Statistics Response
 */
export interface StatusStatistics {
  status: StudentStatus;
  count: number;
  percentage: number;
  average_duration_days?: number;
}

/**
 * Sex Enum
 */
export type Sex = 'M' | 'F' | 'O';

/**
 * Student Entity
 */
export interface Student {
  id: number;
  matricule: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  birthplace: string;
  sex: Sex;
  email: string;
  phone?: string | null;
  mobile: string;
  address?: string | null;
  city?: string | null;
  country: string;
  nationality: string;
  photo?: string | null;
  status: StudentStatus;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Relations (Note: programme n'est PAS dans Student, mais dans StudentEnrollment)
  documents?: StudentDocument[];
}

/**
 * Student Form Data
 */
export interface StudentFormData {
  firstname: string;
  lastname: string;
  birthdate: string;
  birthplace: string;
  sex: Sex;
  email: string;
  phone?: string;
  mobile: string;
  address?: string;
  city?: string;
  country: string;
  nationality: string;
  photo?: File | string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  programme_id: number;
}

/**
 * Student Document Types
 * Must match backend: Modules/Enrollment/Http/Requests/UploadDocumentRequest.php
 */
export type StudentDocumentType =
  | 'certificat_naissance'
  | 'releve_baccalaureat'
  | 'photo_identite'
  | 'cni_passeport'
  | 'autre';

/**
 * Student Document Entity
 */
export interface StudentDocument {
  id: number;
  student_id: number;
  document_type: StudentDocumentType;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

/**
 * Document Upload Form Data
 */
export interface DocumentUploadData {
  document_type: StudentDocumentType;
  file: File;
}

/**
 * Student Filters for Search
 */
export interface StudentFilters {
  search?: string;
  status?: StudentStatus;
  programme_id?: number;
  sex?: Sex;
  nationality?: string;
  year_enrolled?: number;
}

/**
 * Student Completeness Check Response
 */
export interface StudentCompleteness {
  student_id: number;
  completeness_percentage: number;
  missing_documents: StudentDocumentType[];
  total_documents: number;
  uploaded_documents: number;
}

/**
 * Student Duplicate Check Request
 */
export interface DuplicateCheckRequest {
  firstname: string;
  lastname: string;
  birthdate: string;
}

/**
 * Student Duplicate Check Response
 */
export interface DuplicateCheckResponse {
  has_duplicates: boolean;
  potential_duplicates: Student[];
  match_score: number;
}

/**
 * Student Statistics Summary
 */
export interface StudentStatistics {
  total_students: number;
  active_students: number;
  suspended_students: number;
  graduated_students: number;
  students_by_programme: Array<{
    programme_id: number;
    programme_name: string;
    count: number;
  }>;
  students_by_sex: Array<{
    sex: Sex;
    count: number;
  }>;
  recent_enrollments: number;
}

/**
 * Student Audit Log Entry
 * Matches backend: Modules/Enrollment/Entities/StudentAuditLog.php
 */
export interface StudentAuditLog {
  id: number;
  student_id: number;
  user_id: number;
  event: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  user?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}

// ============================================
// Import en Masse Types (Story 05)
// ============================================

/**
 * Import Mode Options
 */
export type ImportMode = 'complete' | 'strict' | 'update';

/**
 * Import Row Validation Status
 */
export type ImportRowStatus = 'valid' | 'warning' | 'error';

/**
 * CSV Column Mapping
 */
export interface ImportColumnMapping {
  csvColumn: string;
  fieldName: keyof StudentFormData | 'programme_code' | null;
  required: boolean;
}

/**
 * Import Preview Row
 */
export interface ImportPreviewRow {
  rowNumber: number;
  data: Record<string, string>;
  status: ImportRowStatus;
  errors: ImportRowError[];
  warnings: string[];
  isDuplicate: boolean;
  existingStudent?: Student;
}

/**
 * Import Row Error
 */
export interface ImportRowError {
  field: string;
  message: string;
}

/**
 * Import Preview Response
 */
export interface ImportPreviewResponse {
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  warning_rows: number;
  duplicate_rows: number;
  preview: ImportPreviewRow[];
  detected_encoding: string;
  column_headers: string[];
  suggested_mapping: ImportColumnMapping[];
}

/**
 * Import Execute Request
 */
export interface ImportExecuteRequest {
  file_path: string;
  mode: ImportMode;
  column_mapping: ImportColumnMapping[];
  generate_matricules: boolean;
  skip_duplicates: boolean;
}

/**
 * Import Result Row
 */
export interface ImportResultRow {
  row_number: number;
  status: 'created' | 'updated' | 'skipped' | 'error';
  matricule?: string;
  student_name?: string;
  message?: string;
  error?: string;
}

/**
 * Import Execute Response
 */
export interface ImportExecuteResponse {
  job_id?: string;
  is_async: boolean;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  results: ImportResultRow[];
  report_url?: string;
}

/**
 * Import Job Status
 */
export interface ImportJobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  processed: number;
  created: number;
  updated: number;
  errors: number;
  message?: string;
  completed_at?: string;
  report_url?: string;
}

/**
 * Import Template Info
 */
export interface ImportTemplateInfo {
  download_url: string;
  columns: Array<{
    name: string;
    required: boolean;
    description: string;
    example: string;
  }>;
}
