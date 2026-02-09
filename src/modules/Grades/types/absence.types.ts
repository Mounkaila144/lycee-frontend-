/**
 * Grades Module - Absence Management Types
 * Types for absence tracking, justifications, and replacement evaluations
 */

/**
 * Absence type classification
 */
export type AbsenceType = 'unjustified' | 'pending' | 'justified';

/**
 * Justification review status
 */
export type JustificationStatus = 'pending' | 'approved' | 'rejected';

/**
 * Replacement evaluation type
 */
export type ReplacementType = 'same' | 'alternative';

/**
 * Absence policy configuration (per tenant/module)
 */
export interface AbsencePolicy {
  unjustified_grade_is_zero: boolean;
  justified_allows_replacement: boolean;
  justification_deadline_days: number;
}

/**
 * Absence record attached to a grade
 */
export interface AbsenceRecord {
  id: number;
  grade_id: number;
  absence_type: AbsenceType;
  justification_id: number | null;
  applies_zero_grade: boolean;
  notification_sent_at: string | null;
  justification_deadline: string;
  created_at: string;
  updated_at: string;

  // Relations
  justification?: AbsenceJustification | null;
  replacement?: ReplacementEvaluation | null;
}

/**
 * Absence justification (document upload)
 */
export interface AbsenceJustification {
  id: number;
  student_id: number;
  evaluation_id: number;
  file_path: string;
  file_name?: string;
  submitted_at: string;
  status: JustificationStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  admin_comment: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  reviewer?: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

/**
 * Replacement evaluation scheduling
 */
export interface ReplacementEvaluation {
  id: number;
  original_evaluation_id: number;
  student_id: number;
  scheduled_at: string;
  location: string;
  type: ReplacementType;
  convocation_sent_at: string | null;
  grade_id: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Request to update absence type
 */
export interface UpdateAbsenceTypeRequest {
  absence_type: AbsenceType;
  comment?: string;
}

/**
 * Request to upload justification
 */
export interface UploadJustificationRequest {
  file: File;
  comment?: string;
}

/**
 * Request to schedule replacement evaluation
 */
export interface ScheduleReplacementRequest {
  scheduled_at: string;
  location: string;
  type: ReplacementType;
  comment?: string;
}

/**
 * Bulk mark absent request
 */
export interface BulkMarkAbsentRequest {
  student_ids: number[];
  absence_type: AbsenceType;
}

/**
 * Absence summary for an evaluation
 */
export interface AbsenceSummary {
  total_absent: number;
  unjustified: number;
  pending: number;
  justified: number;
  with_replacement: number;
  zero_grade_count: number;
  excluded_count: number;
}

/**
 * Student absence entry (for absence list views)
 */
export interface StudentAbsenceEntry {
  student_id: number;
  student_name: string;
  matricule: string;
  grade_id: number;
  absence: AbsenceRecord;
  evaluation_name: string;
}
