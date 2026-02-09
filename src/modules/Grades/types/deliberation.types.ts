/**
 * Deliberation Types
 * Types for jury deliberation sessions and decisions
 */

import type { GradeStudent } from './grade.types';

export type SessionType = 'regular' | 'rattrapage' | 'special';
export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type DecisionType = 'admitted' | 'admitted_with_compensation' | 'deferred' | 'excluded' | 'retake';

/**
 * Jury member
 */
export interface JuryMember {
  id: number;
  user_id: number;
  name: string;
  role: string;
  is_president: boolean;
}

/**
 * Deliberation session
 */
export interface DeliberationSession {
  id: number;
  semester_id: number;
  session_type: SessionType;
  status: SessionStatus;
  status_label?: string;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  location: string | null;
  notes: string | null;
  jury_members: JuryMember[];
  president?: JuryMember;
  total_students: number;
  deliberated_count: number;
  pending_count: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  semester?: {
    id: number;
    name: string;
  };
}

/**
 * Jury decision for a student
 */
export interface JuryDecision {
  id: number;
  session_id: number;
  student_id: number;
  decision: DecisionType;
  decision_label?: string;
  justification: string | null;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  is_exceptional: boolean;
  requires_review: boolean;
  reviewed_at: string | null;
  reviewed_by: number | null;
  review_status: 'pending' | 'approved' | 'rejected' | null;
  created_at: string;
  updated_at: string;
  student?: GradeStudent;
  semester_average?: number | null;
  semester_rank?: string | null;
}

/**
 * Create deliberation session request
 */
export interface CreateDeliberationRequest {
  semester_id: number;
  session_type: SessionType;
  scheduled_at?: string;
  location?: string;
  notes?: string;
  jury_member_ids?: number[];
  president_id?: number;
}

/**
 * Jury decision request
 */
export interface JuryDecisionRequest {
  student_id: number;
  decision: DecisionType;
  justification?: string;
  votes_for?: number;
  votes_against?: number;
  votes_abstain?: number;
  is_exceptional?: boolean;
}

/**
 * Bulk decision request
 */
export interface BulkDecisionRequest {
  decisions: JuryDecisionRequest[];
}

/**
 * Decision review request
 */
export interface DecisionReviewRequest {
  review_status: 'approved' | 'rejected';
  review_notes?: string;
}

/**
 * Pending student for deliberation
 */
export interface PendingStudent {
  student_id: number;
  student: GradeStudent;
  semester_average: number | null;
  semester_rank: string | null;
  global_status: string;
  suggested_decision?: DecisionType;
  notes?: string;
}

/**
 * Deliberation statistics
 */
export interface DeliberationStatistics {
  total_sessions: number;
  completed_sessions: number;
  in_progress_sessions: number;
  total_decisions: number;
  decision_distribution: Record<DecisionType, number>;
  exceptional_count: number;
  pending_review_count: number;
}
