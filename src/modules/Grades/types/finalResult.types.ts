/**
 * Grades Module - Final Results Types
 * Types for final results after retake session (Story 20)
 */
import type { GradeStudent } from './grade.types';

export type FinalStatus = 'admitted' | 'admitted_with_debts' | 'deferred_final' | 'repeating';

export const FINAL_STATUS_LABELS: Record<FinalStatus, string> = {
  admitted: 'Admis',
  admitted_with_debts: 'Admis avec dettes',
  deferred_final: 'Ajourné définitif',
  repeating: 'Redoublement',
};

export const FINAL_STATUS_COLORS: Record<FinalStatus, 'success' | 'warning' | 'error' | 'default'> = {
  admitted: 'success',
  admitted_with_debts: 'warning',
  deferred_final: 'error',
  repeating: 'default',
};

export interface FinalResult {
  student_id: number;
  semester_id: number;
  average: number | null;
  final_status: FinalStatus | null;
  can_progress_next_year: boolean;
  total_credits: number;
  acquired_credits: number;
  missing_credits: number;
  success_rate: number;
  final_published_at: string | null;
  attestation_file_path: string | null;
  year_locked_at: string | null;
  retake_session_completed: boolean;
  student?: GradeStudent;
}

export interface FinalStatistics {
  total_students: number;
  admitted: number;
  admitted_with_debts: number;
  deferred_final: number;
  repeating: number;
  pass_rate: number;
  retake_impact: number;
  average_credits: number;
  credits_distribution: Array<{
    range: string;
    count: number;
  }>;
}

export interface PublishFinalResultsRequest {
  notify_students: boolean;
  generate_attestations: boolean;
}

export interface PublishFinalResultsResponse {
  message: string;
  stats: {
    admitted: number;
    admitted_with_debts: number;
    deferred_final: number;
    repeating: number;
  };
}

export interface LockYearResponse {
  message: string;
  locked_at: string;
}
