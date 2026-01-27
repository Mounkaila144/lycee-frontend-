/**
 * Grades Module - Validation Types
 * Types for grade validation and publication workflow
 */

/**
 * Grade Validation Status
 * Matches backend: Draft -> Submitted -> Validated/Rejected -> Published
 */
export type GradeValidationStatus = 'Draft' | 'Submitted' | 'Pending' | 'Approved' | 'Rejected' | 'Published';

/**
 * Grade Validation Entity
 * Matches backend: GradeValidation model
 */
export interface GradeValidation {
  id: number;
  module_id: number;
  evaluation_id: number | null;
  academic_year_id: number;
  submitted_by: number;
  status: GradeValidationStatus;
  validated_by: number | null;
  submitted_at: string;
  validated_at: string | null;
  published_at: string | null;
  rejection_reason: string | null;
  statistics: ValidationStatistics | null;
  anomalies: string[] | null;
  created_at: string;
  updated_at: string;

  // Relations
  module?: ValidationModule;
  evaluation?: ValidationEvaluation;
  submitted_by_user?: ValidationUser;
  validated_by_user?: ValidationUser | null;
}

/**
 * Module simplified for validation
 */
export interface ValidationModule {
  id: number;
  code: string;
  name: string;
  credits: number;
  semester_id: number;
  academic_year_id: number;
}

/**
 * Evaluation simplified for validation
 */
export interface ValidationEvaluation {
  id: number;
  name: string;
  code: string;
  type: string;
  coefficient: number;
  max_score: number;
  date: string | null;
}

/**
 * User simplified for validation
 */
export interface ValidationUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

/**
 * Validation Statistics
 * Calculated when submitting grades for validation
 */
export interface ValidationStatistics {
  count: number;
  average: number;
  std_dev: number;
  min: number;
  max: number;
  median: number;
  pass_rate: number;
  distribution?: {
    '0-5': number;
    '5-10': number;
    '10-15': number;
    '15-20': number;
  };
  absent_count?: number;
  present_count?: number;
}

/**
 * Anomaly Detection Result
 */
export interface ValidationAnomaly {
  type: 'low_average' | 'high_average' | 'low_variance' | 'high_variance' | 'low_pass_rate' | 'high_fail_rate';
  message: string;
  severity: 'warning' | 'critical';
  value: number;
  threshold: number;
}

/**
 * Pre-submission Check Result
 */
export interface PreSubmissionCheck {
  can_submit: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    all_grades_entered: boolean;
    valid_grade_range: boolean;
    statistics_calculated: boolean;
    no_invalid_grades: boolean;
  };
}

/**
 * Submit Grades Request
 */
export interface SubmitGradesRequest {
  module_id: number;
  evaluation_id?: number;
  academic_year_id: number;
}

/**
 * Submit Grades Response
 */
export interface SubmitGradesResponse {
  success: boolean;
  message: string;
  validation_id: number;
  statistics: ValidationStatistics;
  anomalies: string[];
}

/**
 * Validate Grades Request (Admin)
 */
export interface ValidateGradesRequest {
  decision: 'Approved' | 'Rejected';
  notes?: string;
}

/**
 * Validate Grades Response
 */
export interface ValidateGradesResponse {
  success: boolean;
  message: string;
  validation: GradeValidation;
}

/**
 * Publish Grades Request
 */
export interface PublishGradesRequest {
  validation_id: number;
  publish_at?: string; // ISO date string for scheduled publication
  notify_students?: boolean;
}

/**
 * Publish Grades Response
 */
export interface PublishGradesResponse {
  success: boolean;
  message: string;
  published_count: number;
  published_at: string;
  is_scheduled: boolean;
}

/**
 * Bulk Publish Request
 */
export interface BulkPublishRequest {
  validation_ids: number[];
  notify_students?: boolean;
}

/**
 * Bulk Publish Response
 */
export interface BulkPublishResponse {
  success: boolean;
  message: string;
  published_count: number;
  failed_count: number;
  results: Array<{
    validation_id: number;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Grade Validation Filters
 */
export interface GradeValidationFilters {
  status?: GradeValidationStatus | GradeValidationStatus[];
  module_id?: number;
  evaluation_id?: number;
  academic_year_id?: number;
  submitted_by?: number;
  semester_id?: number;
  date_from?: string;
  date_to?: string;
  has_anomalies?: boolean;
  search?: string;
}

/**
 * Validation Statistics Summary (for dashboard)
 */
export interface ValidationStatisticsSummary {
  total_validations: number;
  pending_validations: number;
  approved_validations: number;
  rejected_validations: number;
  published_validations: number;
  average_validation_time: number; // in hours
  rejection_rate: number; // percentage
  modules_with_anomalies: number;
}

/**
 * Submission Status (for teacher)
 */
export interface SubmissionStatus {
  module_id: number;
  evaluation_id: number | null;
  status: GradeValidationStatus;
  submitted_at: string | null;
  validated_at: string | null;
  can_edit: boolean;
  can_submit: boolean;
  validation_id: number | null;
  pre_check?: PreSubmissionCheck;
}

/**
 * Grade Modification Request (post-publication)
 */
export interface GradeModificationRequest {
  grade_id: number;
  new_score: number | null;
  is_absent: boolean;
  reason: string;
}

/**
 * Grade Modification Response
 */
export interface GradeModificationResponse {
  success: boolean;
  message: string;
  requires_approval: boolean;
  modification_request_id?: number;
}

/**
 * Correction Request Entity
 */
export interface CorrectionRequest {
  id: number;
  grade_id: number;
  requested_by: number;
  old_score: number | null;
  new_score: number | null;
  old_is_absent: boolean;
  new_is_absent: boolean;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  grade?: any; // Full grade object
  requested_by_user?: ValidationUser;
  reviewed_by_user?: ValidationUser | null;
}

/**
 * Correction Request Filters
 */
export interface CorrectionRequestFilters {
  status?: 'Pending' | 'Approved' | 'Rejected';
  module_id?: number;
  evaluation_id?: number;
  requested_by?: number;
  date_from?: string;
  date_to?: string;
}

/**
 * Approve/Reject Correction Request
 */
export interface ReviewCorrectionRequest {
  decision: 'Approved' | 'Rejected';
  notes?: string;
}

/**
 * Audit Trail Entry
 */
export interface AuditTrailEntry {
  id: number;
  entity_type: 'grade' | 'validation' | 'publication';
  entity_id: number;
  action: string;
  old_value: any;
  new_value: any;
  performed_by: number;
  performed_at: string;
  ip_address: string | null;
  user_agent: string | null;

  // Relations
  user?: ValidationUser;
}

/**
 * Validation Timeline Item
 */
export interface ValidationTimelineItem {
  id: number;
  type: 'submitted' | 'validated' | 'rejected' | 'published' | 'correction_requested' | 'correction_approved';
  message: string;
  user: ValidationUser | null;
  timestamp: string;
  metadata?: Record<string, any>;
}
