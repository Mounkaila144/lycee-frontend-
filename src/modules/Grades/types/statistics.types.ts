/**
 * Statistics Types
 * Types for success rate statistics, grade distribution, and program comparisons
 */

export interface GlobalStatistics {
  total_students: number;
  success_rate: number;
  compensation_rate: number;
  retake_rate: number;
  failure_rate: number;
  dropout_rate: number;
  average_ects: number;
  class_average: number;
}

export interface ModuleStatistic {
  module_id: number;
  module_name: string;
  module_code: string;
  teacher_name: string;
  total_students: number;
  class_average: number;
  success_rate: number;
  failure_rate: number;
  min_grade: number | null;
  max_grade: number | null;
  std_dev: number;
}

export interface ProgramComparison {
  program_id: number;
  program_name: string;
  total_students: number;
  average: number;
  success_rate: number;
  avg_credits: number;
}

export interface StatisticsDistribution {
  '0-5': number;
  '5-10': number;
  '10-12': number;
  '12-14': number;
  '14-16': number;
  '16-20': number;
}

export interface SemesterEvolution {
  semester_id: number;
  semester_name: string;
  success_rate: number;
  class_average: number;
  total_students: number;
}

export interface StatisticsFilters {
  semester_id?: number;
  program_id?: number;
  level_id?: number;
  type?: 'initial' | 'after_retake' | 'final';
}
