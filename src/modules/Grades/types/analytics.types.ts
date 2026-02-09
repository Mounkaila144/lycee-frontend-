/**
 * Analytics Types
 * Types for performance analytics, KPIs, predictive analysis, and correlations
 */

export interface AnalyticsKPIs {
  success_rate: number;
  success_rate_trend: number;
  class_average: number;
  class_average_trend: number;
  absence_rate: number;
  critical_modules_count: number;
  dropout_rate: number;
  total_students: number;
}

export interface WeakModule {
  module_id: number;
  module_name: string;
  module_code: string;
  teacher_name: string;
  failure_rate: number;
  average: number;
  std_dev: number;
  total_students: number;
  is_critical: boolean;
  recommendation: string;
}

export interface CohortSegment {
  label: string;
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CohortAnalysis {
  excellent: CohortSegment;
  good: CohortSegment;
  average: CohortSegment;
  weak: CohortSegment;
  failing: CohortSegment;
}

export interface AtRiskStudent {
  student_id: number;
  matricule: string;
  full_name: string;
  risk_score: number;
  risk_factors: string[];
  cc_average: number | null;
  absence_rate: number;
  failing_modules_count: number;
}

export interface CorrelationEntry {
  module1_id: number;
  module1_name: string;
  module2_id: number;
  module2_name: string;
  correlation: number;
}

export interface HistoricalComparison {
  year: string;
  semester_name: string;
  success_rate: number;
  class_average: number;
  total_students: number;
  dropout_rate: number;
}

export interface AnalyticsFilters {
  semester_id?: number;
  program_id?: number;
  period?: 'semester' | 'year' | 'multi_year';
}
