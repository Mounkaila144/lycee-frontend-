/**
 * Reenrollment Module Types
 * Types for reenrollment campaigns and reenrollment requests
 */

import type { Student } from './student.types';
import type { PedagogicalEnrollment } from './pedagogicalEnrollment.types';

// ============================================================================
// Reenrollment Campaign Types
// ============================================================================

export type ReenrollmentCampaignStatus = 'Draft' | 'Active' | 'Closed';

export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}

export interface ReenrollmentCampaign {
  id: number;
  name: string;
  from_academic_year_id: number;
  to_academic_year_id: number;
  start_date: string;
  end_date: string;
  eligible_programs: number[] | null;
  eligible_levels: string[] | null;
  required_documents: string[] | null;
  fees_config: Record<string, number> | null;
  min_ects_required: number;
  check_financial_clearance: boolean;
  status: ReenrollmentCampaignStatus;
  description: string | null;
  is_open: boolean;
  from_academic_year?: AcademicYear;
  to_academic_year?: AcademicYear;
  reenrollments_count?: number;
  statistics?: CampaignStatistics;
  created_at: string;
  updated_at: string;
}

export interface ReenrollmentCampaignFormData {
  name: string;
  from_academic_year_id: number;
  to_academic_year_id: number;
  start_date: string;
  end_date: string;
  eligible_programs?: number[];
  eligible_levels?: string[];
  required_documents?: string[];
  fees_config?: Record<string, number>;
  min_ects_required: number;
  check_financial_clearance: boolean;
  description?: string;
}

export interface ReenrollmentCampaignFilters {
  status?: ReenrollmentCampaignStatus;
  academic_year_id?: number;
  search?: string;
}

// ============================================================================
// Reenrollment Types
// ============================================================================

export type ReenrollmentStatus = 'Draft' | 'Submitted' | 'Validated' | 'Rejected';
export type EligibilityStatus = 'Eligible' | 'Not_Eligible' | 'Pending';

export interface Reenrollment {
  id: number;
  campaign_id: number;
  student_id: number;
  previous_enrollment_id: number | null;
  previous_level: string;
  target_level: string;
  target_level_label: string;
  target_program_id: number;
  is_redoing: boolean;
  is_reorientation: boolean;
  personal_data_updates: Record<string, string> | null;
  uploaded_documents: string[] | null;
  has_accepted_rules: boolean;
  eligibility_status: EligibilityStatus;
  eligibility_notes: string | null;
  status: ReenrollmentStatus;
  validated_by: number | null;
  submitted_at: string | null;
  validated_at: string | null;
  rejection_reason: string | null;
  confirmation_pdf_path: string | null;
  new_enrollment_id: number | null;
  can_be_submitted: boolean;
  can_be_validated: boolean;
  can_be_rejected: boolean;
  campaign?: ReenrollmentCampaign;
  student?: Student;
  target_program?: {
    id: number;
    name: string;
    code: string;
  };
  validator?: {
    id: number;
    name: string;
  };
  previous_enrollment?: PedagogicalEnrollment;
  new_enrollment?: PedagogicalEnrollment;
  created_at: string;
  updated_at: string;
}

export interface ReenrollmentFormData {
  campaign_id: number;
  student_id: number;
  target_program_id?: number;
  is_redoing?: boolean;
  is_reorientation?: boolean;
  personal_data_updates?: Record<string, string>;
  uploaded_documents?: string[];
  has_accepted_rules?: boolean;
}

export interface ReenrollmentUpdateData {
  target_program_id?: number;
  is_redoing?: boolean;
  personal_data_updates?: Record<string, string>;
  uploaded_documents?: string[];
  has_accepted_rules?: boolean;
}

export interface ReenrollmentFilters {
  campaign_id?: number;
  status?: ReenrollmentStatus;
  eligibility_status?: EligibilityStatus;
  is_redoing?: boolean;
  is_reorientation?: boolean;
  search?: string;
}

// ============================================================================
// Eligibility Check Types
// ============================================================================

export interface EligibilityCheck {
  is_active: boolean;
  has_previous_enrollment: boolean;
  has_min_ects: boolean;
  validated_ects: number;
  required_ects: number;
  financial_clearance: boolean;
  no_disciplinary_exclusion: boolean;
  program_eligible: boolean;
  level_eligible: boolean;
  is_eligible: boolean;
  previous_enrollment?: PedagogicalEnrollment;
}

export interface EligibilityCheckRequest {
  student_id: number;
  campaign_id: number;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface CampaignStatistics {
  total: number;
  by_status: {
    draft: number;
    submitted: number;
    validated: number;
    rejected: number;
  };
  by_eligibility: {
    eligible: number;
    not_eligible: number;
    pending: number;
  };
  special_cases: {
    redoing: number;
    reorientation: number;
  };
  by_target_level: Record<string, number>;
  validation_rate: number;
}

export interface GlobalStatistics {
  total: number;
  by_status: {
    draft: number;
    submitted: number;
    validated: number;
    rejected: number;
  };
}

// ============================================================================
// Eligible Students Types
// ============================================================================

export interface EligibleStudentInfo {
  student: Student;
  eligibility: EligibilityCheck;
}

export interface EligibleStudentsResult {
  eligible: EligibleStudentInfo[];
  not_eligible: EligibleStudentInfo[];
  total_eligible: number;
  total_not_eligible: number;
}

// ============================================================================
// Batch Operations Types
// ============================================================================

export interface BatchValidateRequest {
  reenrollment_ids: number[];
}

export interface BatchValidateResult {
  validated: number[];
  errors: string[];
}
