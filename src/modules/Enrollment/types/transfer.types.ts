/**
 * Transfer Module Types
 * Types for transfer requests and equivalences management
 */

import type { Student } from './student.types';

// ============================================================================
// Transfer Status Types
// ============================================================================

export type TransferStatus =
  | 'Submitted'
  | 'Under_Review'
  | 'Equivalences_Proposed'
  | 'Validated'
  | 'Integrated'
  | 'Rejected';

export type EquivalenceType = 'Full' | 'Partial' | 'None' | 'Exemption';

export type EquivalenceStatus = 'Proposed' | 'Validated' | 'Rejected';

export type TransferDocumentType = 'transcript' | 'certificate' | 'attestation' | 'syllabus' | 'other';

// ============================================================================
// Related Entity Types
// ============================================================================

export interface Programme {
  id: number;
  name: string;
  code: string;
}

export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}

export interface Module {
  id: number;
  code: string;
  name: string;
  ects: number;
  hours: number;
  is_mandatory: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// ============================================================================
// Transfer Document Types
// ============================================================================

export interface TransferDocument {
  id: number;
  transfer_id: number;
  type: TransferDocumentType;
  type_label: string;
  original_name: string;
  path: string;
  mime_type: string;
  size: number;
  size_formatted: string;
  url: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Equivalence Types
// ============================================================================

export interface Equivalence {
  id: number;
  transfer_id: number;
  origin_module_code: string | null;
  origin_module_name: string;
  origin_ects: number;
  origin_hours: number;
  origin_grade: number | null;
  target_module_id: number | null;
  equivalence_type: EquivalenceType;
  equivalence_type_label: string;
  equivalence_percentage: number;
  granted_ects: number;
  granted_grade: number | null;
  notes: string | null;
  similarity_score: number;
  status: EquivalenceStatus;
  can_be_validated: boolean;
  is_full: boolean;
  is_partial: boolean;
  is_none: boolean;
  target_module?: Module;
  transfer?: Transfer;
  created_at: string;
  updated_at: string;
}

export interface EquivalenceFormData {
  origin_module_code?: string;
  origin_module_name: string;
  origin_ects?: number;
  origin_hours?: number;
  origin_grade?: number | null;
  target_module_id?: number | null;
  equivalence_type: EquivalenceType;
  equivalence_percentage?: number;
  granted_ects?: number;
  granted_grade?: number | null;
  notes?: string;
}

// ============================================================================
// Transfer Types
// ============================================================================

export interface EquivalenceStatistics {
  total: number;
  full: number;
  partial: number;
  none: number;
  exemption: number;
  validated: number;
  proposed: number;
}

export interface Transfer {
  id: number;
  transfer_number: string;
  student_id: number | null;
  firstname: string;
  lastname: string;
  full_name: string;
  birthdate: string;
  email: string;
  phone: string;
  mobile: string;
  origin_institution: string;
  origin_program: string;
  origin_level: string;
  target_program_id: number;
  target_level: string;
  academic_year_id: number;
  transfer_reason: string;
  total_ects_claimed: number;
  total_ects_granted: number;
  status: TransferStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  equivalence_certificate_path: string | null;

  // Computed permissions
  can_be_reviewed: boolean;
  can_be_validated: boolean;
  can_be_integrated: boolean;
  can_be_rejected: boolean;

  // Statistics
  equivalence_statistics?: EquivalenceStatistics;

  // Relations
  student?: Student;
  target_program?: Programme;
  academic_year?: AcademicYear;
  reviewer?: User;
  equivalences?: Equivalence[];
  documents?: TransferDocument[];

  // Counts
  equivalences_count?: number;
  documents_count?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface TransferFormData {
  firstname: string;
  lastname: string;
  birthdate: string;
  email: string;
  phone: string;
  mobile: string;
  origin_institution: string;
  origin_program: string;
  origin_level: string;
  target_program_id: number;
  target_level: string;
  academic_year_id: number;
  transfer_reason: string;
  total_ects_claimed?: number;
}

export interface TransferFilters {
  status?: TransferStatus;
  academic_year_id?: number;
  search?: string;
}

// ============================================================================
// Origin Module for Analysis
// ============================================================================

export interface OriginModule {
  code?: string;
  name: string;
  ects: number;
  hours: number;
  grade?: number | null;
}

export interface AnalyzeEquivalencesRequest {
  origin_modules: OriginModule[];
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface TransferStatistics {
  total: number;
  by_status: {
    submitted: number;
    under_review: number;
    equivalences_proposed: number;
    validated: number;
    integrated: number;
    rejected: number;
  };
  total_ects_granted: number;
  average_ects_per_transfer: number;
  average_processing_days: number;
  by_origin_institution: Record<string, number>;
}

// ============================================================================
// Batch Operations Types
// ============================================================================

export interface BatchValidateEquivalencesRequest {
  equivalence_ids: number[];
}

export interface BatchValidateEquivalencesResult {
  validated_count: number;
  errors: string[];
}
