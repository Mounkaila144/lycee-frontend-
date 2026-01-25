/**
 * Enrollment Statistics Types
 * Types for enrollment statistics and reporting
 */

/**
 * Global KPIs for enrollment statistics
 * Matches the actual API response structure
 */
export interface EnrollmentKPIs {
  total_students: number;
  active_students: number;
  new_students: number;
  reenrollments: number;
  transfers?: number;
  pedagogical: {
    validated: number;
    pending: number;
    total: number;
  };
  rates: {
    conversion: number;
    validation: number;
  };
  academic_year?: {
    id: number;
    name: string;
  };
}

/**
 * Program statistics
 */
export interface ProgramStats {
  program: {
    id: number;
    name: string;
    code: string;
  };
  total: number;
  male: number;
  female: number;
  gender_ratio: number;
  capacity: number;
  fill_rate: number;
  growth_rate: number;
  by_level?: Record<string, number>;
  average_age?: number;
}

/**
 * Enrollment trends data point
 */
export interface TrendDataPoint {
  year: number;
  count: number;
  month?: number;
  label?: string;
}

/**
 * Monthly trend data
 */
export interface MonthlyTrend {
  month: string;
  count: number;
  cumulative?: number;
}

/**
 * Age distribution
 */
export interface AgeDistribution {
  range: string;
  count: number;
  percentage: number;
}

/**
 * Geographic distribution
 */
export interface GeographicDistribution {
  location: string;
  count: number;
  percentage: number;
}

/**
 * Gender distribution
 */
export interface GenderDistribution {
  gender: 'M' | 'F' | 'O';
  count: number;
  percentage: number;
}

/**
 * Origin bac distribution
 */
export interface BacDistribution {
  type: string;
  count: number;
  percentage: number;
}

/**
 * Demographic analysis
 */
export interface DemographicAnalysis {
  age_distribution: Record<string, number>;
  geographic_distribution: Record<string, number>;
  gender_distribution: Record<string, number>;
  origin_bac_distribution: Record<string, number>;
}

/**
 * Pedagogical statistics
 */
export interface PedagogicalStats {
  option_choice_rate: number;
  group_assignment_rate: number;
  popular_options: Array<{
    option_id: number;
    option_name: string;
    count: number;
  }>;
  modules_oversubscribed: number;
  modules_undersubscribed: number;
  special_situations: {
    transfers_accepted: number;
    transfers_rejected: number;
    exemptions_granted: number;
    repeaters: number;
    reorientations: number;
  };
}

/**
 * Status statistics
 */
export interface StatusStatistics {
  by_status: Record<string, number>;
  pending_rate: number;
  validation_rate: number;
  rejection_rate: number;
}

/**
 * Year comparison data
 */
export interface YearComparisonData {
  year: number;
  academic_year_label: string;
  total_enrollments: number;
  new_students: number;
  reenrollments: number;
  growth_vs_previous: number | null;
}

/**
 * Alert for enrollment statistics
 */
export interface EnrollmentAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  category: 'capacity' | 'deadline' | 'trend' | 'validation';
  message: string;
  program_id?: number;
  program_name?: string;
  threshold?: number;
  current_value?: number;
  created_at: string;
}

/**
 * Statistics filters
 */
export interface StatisticsFilters {
  academic_year_id?: number;
  programme_id?: number;
  type?: 'new' | 'reenrollment' | 'transfer';
  status?: string;
  from_date?: string;
  to_date?: string;
}

/**
 * Report generation request
 */
export interface ReportGenerationRequest {
  type: 'executive_summary' | 'dashboard' | 'detailed';
  academic_year_id?: number;
  filters?: StatisticsFilters;
  format?: 'pdf' | 'excel';
}

/**
 * Report download response
 */
export interface ReportDownloadResponse {
  path: string;
  filename: string;
  url?: string;
}

/**
 * Excel export filters
 */
export interface ExcelExportFilters extends StatisticsFilters {
  include_demographics?: boolean;
  include_pedagogical?: boolean;
}
