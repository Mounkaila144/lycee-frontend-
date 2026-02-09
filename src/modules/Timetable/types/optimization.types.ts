// optimization.types.ts

import type { TimetableSlot, Conflict } from './timetable.types';

export type GenerationStrategy = 'fast' | 'balanced' | 'optimal';

export interface HardConstraints {
  no_conflicts: boolean;
  room_capacity: boolean;
  teacher_availability: boolean;
}

export interface SoftConstraints {
  max_hours_per_day_teacher: number;
  max_consecutive_hours_students: number;
  respect_teacher_preferences: boolean;
  minimize_room_changes: boolean;
}

export interface GenerationConfig {
  semester_id: number;
  group_id: number;
  strategy: GenerationStrategy;
  hard_constraints: HardConstraints;
  soft_constraints: SoftConstraints;
}

export interface GenerationResult {
  success: boolean;
  slots: TimetableSlot[];
  score: number;
  conflicts: Conflict[];
  statistics: GenerationStatistics;
  message?: string;
  impossible_constraints?: string[];
}

export interface GenerationStatistics {
  total_sessions: number;
  sessions_per_day: Record<string, number>;
  teacher_hours: Record<string, number>;
  room_utilization: Record<string, number>;
  gaps_detected: number;
  preferences_respected: number;
  preferences_total: number;
}

export interface GenerationProgress {
  phase: 'analysis' | 'generation' | 'optimization' | 'verification';
  progress: number;
  message: string;
}

export interface GenerationStatusResponse {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: GenerationProgress;
  result?: GenerationResult;
  error?: string;
}

export interface TeacherPreference {
  id: number;
  teacher_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_preferred: boolean;
  teacher?: {
    id: number;
    name: string;
  };
}

export interface TeacherPreferenceRequest {
  teacher_id: number;
  preferences: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_preferred: boolean;
  }>;
}

export const STRATEGY_LABELS: Record<GenerationStrategy, { label: string; description: string }> = {
  fast: {
    label: 'Rapide',
    description: 'Heuristique simple, résultat rapide mais pas optimal',
  },
  balanced: {
    label: 'Équilibrée',
    description: 'Bon compromis entre qualité et temps de génération',
  },
  optimal: {
    label: 'Optimale',
    description: 'Recherche exhaustive CSP, meilleur résultat possible',
  },
};
