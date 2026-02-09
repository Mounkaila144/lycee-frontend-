/**
 * Grades Module - Validation Types
 * Types matching the backend GradeValidationResource and GradeValidationController
 */

/**
 * Grade Validation Status
 * Backend: Pending -> Approved/Rejected -> Published
 */
export type GradeValidationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Published';

/**
 * Grade Validation Entity
 * Matches backend GradeValidationResource exactly
 */
export interface GradeValidation {
  id: number;
  module_id: number;
  evaluation_id: number | null;
  academic_year_id: number | null;
  semester_id: number | null;
  status: GradeValidationStatus;
  submitted_at: string | null;
  validated_at: string | null;
  published_at: string | null;
  scheduled_publish_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  statistics: ValidationStatistics | null;
  anomalies: string[];
  has_anomalies: boolean;
  created_at: string;
  updated_at: string;

  // Relations (conditionally loaded via whenLoaded)
  module?: ValidationModule;
  evaluation?: ValidationEvaluation;
  submitter?: ValidationUser;
  validator?: ValidationUser | null;
  academic_year?: { id: number; name: string };
  semester?: { id: number; name: string };
}

/**
 * Module simplified for validation
 * Backend returns: { id, code, name }
 */
export interface ValidationModule {
  id: number;
  code: string;
  name: string;
}

/**
 * Evaluation simplified for validation
 * Backend returns: { id, name, type }
 */
export interface ValidationEvaluation {
  id: number;
  name: string;
  type: string;
}

/**
 * User simplified for validation
 * Backend returns: { id, name }
 */
export interface ValidationUser {
  id: number;
  name: string;
}

/**
 * Validation Statistics
 * Calculated by GradeStatisticsService::calculateStats()
 * Backend returns these exact fields
 */
export interface ValidationStatistics {
  count: number;
  average: number;
  min: number | null;
  max: number | null;
  median: number;
  std_dev: number;
  pass_rate: number;
  fail_rate: number;
  absent_count: number;
  distribution: Record<string, number>;
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
 * Validate (Approve) Grades Request
 * POST /api/admin/grade-validations/{id}/validate
 * Backend expects: { notes?: string }
 */
export interface ValidateGradesRequest {
  notes?: string;
}

/**
 * Reject Grades Request
 * POST /api/admin/grade-validations/{id}/reject
 * Backend expects: { reason: string }
 */
export interface RejectGradesRequest {
  reason: string;
}

/**
 * Validate/Reject Response
 * Backend returns: { message, data: GradeValidation }
 */
export interface ValidateGradesResponse {
  message: string;
  data: GradeValidation;
}

/**
 * Publish Grades Request
 * POST /api/admin/grade-validations/{id}/publish
 * Backend expects: { scheduled_at?: string }
 */
export interface PublishGradesRequest {
  scheduled_at?: string;
}

/**
 * Publish Grades Response
 */
export interface PublishGradesResponse {
  message: string;
  data: GradeValidation;
}

/**
 * Bulk Publish Request
 */
export interface BulkPublishRequest {
  validation_ids: number[];
}

/**
 * Bulk Publish Response
 */
export interface BulkPublishResponse {
  message: string;
  data: {
    published: number;
    errors: string[];
  };
}

/**
 * Grade Validation Filters
 */
export interface GradeValidationFilters {
  status?: GradeValidationStatus;
  module_id?: number;
  evaluation_id?: number;
  academic_year_id?: number;
  semester_id?: number;
  search?: string;
  per_page?: number;
}

/**
 * Validation Statistics Summary (for dashboard)
 * Matches backend GET /api/admin/grade-validations/statistics response
 */
export interface ValidationStatisticsSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
  average_validation_time: number;
  rejection_rate: number;
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
 * Matches backend: Modules/Grades/Entities/GradeCorrectionRequest.php
 */
export interface CorrectionRequest {
  id: number;
  grade_id: number;
  requested_by: number;
  current_value: number | null;
  proposed_value: number | null;
  old_score: number | null;
  new_score: number | null;
  old_is_absent: boolean;
  new_is_absent: boolean;
  reason: string;
  status: CorrectionRequestStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_comment: string | null;
  rejection_reason: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  grade?: GradeWithStudent;
  requester?: ValidationUser; // API returns this instead of requested_by_user
  requested_by_user?: ValidationUser; // Legacy, kept for backwards compatibility
  reviewer?: ValidationUser | null; // API returns this instead of reviewed_by_user
  reviewed_by_user?: ValidationUser | null; // Legacy, kept for backwards compatibility

  // Additional API fields
  change_display?: string;
  is_expired?: boolean;
  is_active?: boolean;
}

/**
 * Correction Request Status
 */
export type CorrectionRequestStatus = 'Pending' | 'Approved' | 'Rejected';

/**
 * Grade with student info for correction request display
 */
export interface GradeWithStudent {
  id: number;
  score: number | null;
  is_absent: boolean;
  status?: string;
  student?: {
    id: number;
    matricule: string;
    firstname?: string;
    lastname?: string;
    full_name?: string; // API returns full_name instead of firstname/lastname
  };
  evaluation?: {
    id: number;
    name: string;
    type?: string;
    module?: {
      id: number;
      code: string;
      name: string;
    };
  };
}

/**
 * Grade History Entry
 * Matches backend: Modules/Grades/Entities/GradeHistory.php
 * Note: Backend GradeHistoryResource returns changed_by as an object, not an ID
 */
export interface GradeHistory {
  id: number;
  grade_id: number;
  old_value: number | null;
  new_value: number | null;
  changed_by: ValidationUser | number; // Can be object (from resource) or ID
  changed_at: string;
  reason: string | null;
  change_type: GradeChangeType;
  ip_address: string | null;
  user_agent: string | null;
  created_at?: string;

  // Relations (legacy, kept for backwards compatibility)
  changed_by_user?: ValidationUser;
}

/**
 * Grade Change Type
 */
export type GradeChangeType = 'creation' | 'modification' | 'correction';

/**
 * Request Grade Correction (teacher sends this)
 * POST /api/frontend/teacher/grades/{id}/request-correction
 */
export interface RequestGradeCorrectionPayload {
  proposed_value: number;
  reason: string;
}

/**
 * Request Grade Correction Response
 */
export interface RequestGradeCorrectionResponse {
  success: boolean;
  message: string;
  correction_request: CorrectionRequest;
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
