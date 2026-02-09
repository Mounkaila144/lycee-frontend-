/**
 * Ranking Types
 * Types for promotion rankings, mentions, and palmares
 */

export type MentionLabel = 'Très Bien' | 'Bien' | 'Assez Bien' | 'Passable' | 'Ajourné';

export interface RankedStudent {
  student_id: number;
  matricule: string;
  full_name: string;
  average: number;
  rank: number;
  total_ranked: number;
  acquired_credits: number;
  total_credits: number;
  mention: MentionLabel;
}

export interface MentionDistribution {
  mention: MentionLabel;
  count: number;
  percentage: number;
  color: string;
}

export interface RankingFilters {
  semester_id?: number;
  program_id?: number;
  level_id?: number;
  search?: string;
}

export interface StudentPosition {
  rank: number;
  total_students: number;
  average: number;
  mention: MentionLabel;
  class_average: number;
  gap_from_average: number;
}

export interface RankingEvolution {
  semester_id: number;
  semester_name: string;
  rank: number;
  total_ranked: number;
  average: number;
}
