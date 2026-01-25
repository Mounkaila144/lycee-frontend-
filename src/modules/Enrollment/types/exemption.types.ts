/**
 * Enrollment Module - Module Exemption Types
 * Types for module exemption (dispense) management
 */

import type { Student } from './student.types';

/**
 * Exemption Type Enum
 */
export type ExemptionType = 'Full' | 'Partial' | 'Exemption';

/**
 * Exemption Reason Category Enum
 */
export type ExemptionReasonCategory =
  | 'VAE'
  | 'Prior_Training'
  | 'Professional_Certification'
  | 'Special_Situation'
  | 'Double_Degree'
  | 'Other';

/**
 * Exemption Status Enum
 */
export type ExemptionStatus =
  | 'Pending'
  | 'Under_Review'
  | 'Approved'
  | 'Partially_Approved'
  | 'Rejected'
  | 'Revoked';

/**
 * Uploaded Document
 */
export interface ExemptionDocument {
  path: string;
  original_name: string;
  mime_type: string;
  size: number;
}

/**
 * Module Exemption Entity
 */
export interface ModuleExemption {
  id: number;
  exemption_number: string;
  student_id: number;
  module_id: number;
  academic_year_id: number;
  exemption_type: ExemptionType;
  exemption_type_label: string;
  reason_category: ExemptionReasonCategory;
  reason_category_label: string;
  reason_details: string;
  uploaded_documents: ExemptionDocument[] | null;
  status: ExemptionStatus;
  status_label: string;
  reviewed_by_teacher: number | null;
  teacher_opinion: string | null;
  teacher_reviewed_at: string | null;
  validated_by: number | null;
  validation_notes: string | null;
  validated_at: string | null;
  rejection_reason: string | null;
  grants_ects: boolean;
  ects_granted: number;
  grade_granted: number | null;
  certificate_path: string | null;
  revoked_at: string | null;
  revoked_by: number | null;
  revocation_reason: string | null;

  // Computed flags
  can_be_reviewed: boolean;
  can_be_validated: boolean;
  can_be_revoked: boolean;
  is_active: boolean;

  // Relations
  student?: Student;
  module?: {
    id: number;
    code: string;
    name: string;
    ects: number;
  };
  academic_year?: {
    id: number;
    year: string;
    is_current: boolean;
  };
  teacher_reviewer?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  validator?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  revoked_by_user?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Exemption Form Data (Create Request)
 */
export interface ExemptionFormData {
  student_id: number;
  module_id: number;
  academic_year_id: number;
  exemption_type: ExemptionType;
  reason_category: ExemptionReasonCategory;
  reason_details: string;
}

/**
 * Teacher Review Data
 */
export interface TeacherReviewData {
  opinion: string;
}

/**
 * Validation Data
 */
export interface ExemptionValidationData {
  decision: 'Approved' | 'Partially_Approved' | 'Rejected';
  notes?: string;
  grade?: number;
  rejection_reason?: string;
}

/**
 * Revoke Data
 */
export interface ExemptionRevokeData {
  reason: string;
}

/**
 * Exemption Filters
 */
export interface ExemptionFilters {
  search?: string;
  status?: ExemptionStatus;
  academic_year_id?: number;
  reason_category?: ExemptionReasonCategory;
  student_id?: number;
  module_id?: number;
}

/**
 * Exemption Statistics
 */
export interface ExemptionStatistics {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  partially_approved: number;
  rejected: number;
  revoked: number;
  by_reason: Array<{
    reason: ExemptionReasonCategory;
    count: number;
    percentage: number;
  }>;
  by_type: Array<{
    type: ExemptionType;
    count: number;
    percentage: number;
  }>;
  average_processing_days: number;
  overdue_count: number; // > 15 days
  acceptance_rate: number;
}

/**
 * Status color mapping for UI
 */
export const EXEMPTION_STATUS_COLORS: Record<ExemptionStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  Pending: 'warning',
  Under_Review: 'info',
  Approved: 'success',
  Partially_Approved: 'primary',
  Rejected: 'error',
  Revoked: 'default',
};

/**
 * Exemption type labels for UI
 */
export const EXEMPTION_TYPE_LABELS: Record<ExemptionType, string> = {
  Full: 'Dispense totale',
  Partial: 'Dispense partielle',
  Exemption: 'Exemption',
};

/**
 * Reason category labels for UI
 */
export const REASON_CATEGORY_LABELS: Record<ExemptionReasonCategory, string> = {
  VAE: "Validation des Acquis de l'Expérience",
  Prior_Training: 'Formation antérieure équivalente',
  Professional_Certification: 'Certification professionnelle',
  Special_Situation: 'Situation particulière',
  Double_Degree: 'Double cursus',
  Other: 'Autre',
};

/**
 * Status labels for UI
 */
export const EXEMPTION_STATUS_LABELS: Record<ExemptionStatus, string> = {
  Pending: 'En attente',
  Under_Review: "En cours d'examen",
  Approved: 'Approuvée',
  Partially_Approved: 'Partiellement approuvée',
  Rejected: 'Rejetée',
  Revoked: 'Révoquée',
};
