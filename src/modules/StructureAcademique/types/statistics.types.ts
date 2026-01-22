/**
 * Types pour les statistiques de la structure académique
 */

export interface ProgramStats {
  total: number;
  active: number;
  draft: number;
  inactive: number;
  archived: number;
  by_type: Record<string, number>;
  by_duration: Record<string, number>;
}

export interface ModuleStats {
  total: number;
  by_level: Record<string, number>;
  by_type: Record<string, number>;
  by_semester: Record<string, number>;
  eliminatory_count: number;
  total_credits: number;
  avg_credits: number;
}

export interface TeacherStats {
  total_assigned: number;
  average_workload: number;
  total_assignments: number;
}

export interface GlobalStats {
  programs: ProgramStats;
  modules: ModuleStats;
  teachers: TeacherStats;
  coverage_rate: number;
}

export interface VolumeData {
  hours: number;
  percentage: number;
}

export interface VolumeDistribution {
  CM: VolumeData;
  TD: VolumeData;
  TP: VolumeData;
  total: number;
}

export interface ProgramVolumeStats {
  id: number;
  code: string;
  libelle: string;
  type: string;
  hours_cm: number;
  hours_td: number;
  hours_tp: number;
  total_hours: number;
  total_credits: number;
  modules_count: number;
}

export interface ProgramLevelStats {
  level: string;
  modules_count: number;
  total_credits: number;
  hours_cm: number;
  hours_td: number;
  hours_tp: number;
  total_hours: number;
  obligatory_count: number;
  optional_count: number;
}

export interface ProgramDetailStats {
  programme: {
    id: number;
    code: string;
    libelle: string;
    type: string;
    statut: string;
  };
  summary: {
    levels_count: number;
    modules_count: number;
    total_credits: number;
    total_hours: number;
    coverage_rate: number;
  };
  by_level: ProgramLevelStats[];
  by_type: Record<string, number>;
}

export interface CreditsByLevel {
  [level: string]: number;
}

export interface StatsResponse<T> {
  data: T;
}
