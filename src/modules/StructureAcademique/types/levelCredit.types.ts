/**
 * Types pour la configuration des crédits ECTS par niveau
 */

export type AcademicLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2';

export interface LevelCreditConfiguration {
  id: number;
  program_id: number | null;
  level: AcademicLevel;
  semester_1_credits: number;
  semester_2_credits: number;
  total_credits: number;
  created_at: string;
  updated_at: string;
}

export interface LevelCreditFormData {
  level: AcademicLevel;
  semester_1_credits: number;
  semester_2_credits: number;
}

export interface CreditValidationResult {
  level: AcademicLevel;
  configured_credits: number;
  modules_credits: number;
  status: 'OK' | 'KO';
  gap: number;
}

export interface CreditValidationReport {
  [key: string]: CreditValidationResult;
}

export interface LevelCreditResponse {
  data: LevelCreditConfiguration;
  message?: string;
}

export interface LevelCreditsListResponse {
  data: LevelCreditConfiguration[];
}

export interface CreditValidationResponse {
  data: CreditValidationReport;
}
