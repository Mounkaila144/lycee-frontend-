/**
 * Procès-Verbal (PV) Types
 * Types for deliberation minutes generation, templates, and archiving
 */

export type PVType = 'session1' | 'rattrapage' | 'final';

export interface PVTemplate {
  id: number;
  name: string;
  type: PVType;
  institution_name: string;
  institution_address: string;
  header_logo_path: string | null;
  footer_text: string;
  signature_president_path: string | null;
  signature_secretary_path: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PVGenerationLog {
  id: number;
  deliberation_session_id: number;
  file_path: string;
  file_url: string;
  generated_by: number;
  generated_by_name: string;
  generated_at: string;
  session: {
    id: number;
    type: PVType;
    session_date: string;
    semester: {
      id: number;
      name: string;
      code: string;
      academic_year: string;
    };
    program_name?: string;
  };
}

export interface PVStats {
  total: number;
  admitted: number;
  retake: number;
  deferred: number;
  exceptional: number;
}

export interface PVSearchFilters {
  year?: string;
  semester_id?: number;
  type?: PVType;
  program_id?: number;
}

export interface PVTemplateFormData {
  name: string;
  type: PVType;
  institution_name: string;
  institution_address: string;
  footer_text: string;
  is_default: boolean;
}
