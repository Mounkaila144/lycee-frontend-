import { createApiClient } from '@/shared/lib/api-client';
import type {
  EnrollmentKPIs,
  ProgramStats,
  TrendDataPoint,
  MonthlyTrend,
  DemographicAnalysis,
  PedagogicalStats,
  StatusStatistics,
  YearComparisonData,
  EnrollmentAlert,
  StatisticsFilters,
  ReportGenerationRequest,
  ReportDownloadResponse,
  ExcelExportFilters,
} from '../../types/statistics.types';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Enrollment Statistics Service
 * Handles all API communication for enrollment statistics and reports
 */
class EnrollmentStatisticsService {
  private baseUrl = '/admin/enrollment/statistics';
  private reportsUrl = '/admin/enrollment/reports';

  /**
   * Fetch global KPIs
   */
  async getKPIs(
    tenantId?: string,
    academicYearId?: number
  ): Promise<EnrollmentKPIs> {
    try {
      const client = createApiClient(tenantId);
      const params = academicYearId ? { academic_year_id: academicYearId } : {};
      const response = await client.get<ApiResponse<EnrollmentKPIs>>(
        `${this.baseUrl}/kpis`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching enrollment KPIs:', error);
      throw error;
    }
  }

  /**
   * Fetch statistics by program
   */
  async getByProgram(
    tenantId?: string,
    filters?: StatisticsFilters
  ): Promise<ProgramStats[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<ProgramStats[]>>(
        `${this.baseUrl}/by-program`,
        { params: filters }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching program statistics:', error);
      throw error;
    }
  }

  /**
   * Fetch enrollment trends (historical data)
   */
  async getTrends(
    tenantId?: string,
    programId?: number,
    years: number = 5
  ): Promise<TrendDataPoint[]> {
    try {
      const client = createApiClient(tenantId);
      const params: Record<string, any> = { years };
      if (programId) params.programme_id = programId;

      const response = await client.get<ApiResponse<TrendDataPoint[]>>(
        `${this.baseUrl}/trends`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching enrollment trends:', error);
      throw error;
    }
  }

  /**
   * Fetch monthly trends for current academic year
   */
  async getMonthlyTrends(
    tenantId?: string,
    academicYearId?: number
  ): Promise<MonthlyTrend[]> {
    try {
      const client = createApiClient(tenantId);
      const params = academicYearId ? { academic_year_id: academicYearId } : {};
      const response = await client.get<ApiResponse<MonthlyTrend[]>>(
        `${this.baseUrl}/monthly-trends`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      throw error;
    }
  }

  /**
   * Fetch demographic analysis
   */
  async getDemographics(
    tenantId?: string,
    academicYearId?: number
  ): Promise<DemographicAnalysis> {
    try {
      const client = createApiClient(tenantId);
      const params = academicYearId ? { academic_year_id: academicYearId } : {};
      const response = await client.get<ApiResponse<DemographicAnalysis>>(
        `${this.baseUrl}/demographics`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching demographics:', error);
      throw error;
    }
  }

  /**
   * Fetch pedagogical statistics
   */
  async getPedagogical(
    tenantId?: string,
    academicYearId?: number
  ): Promise<PedagogicalStats> {
    try {
      const client = createApiClient(tenantId);
      const params = academicYearId ? { academic_year_id: academicYearId } : {};
      const response = await client.get<ApiResponse<PedagogicalStats>>(
        `${this.baseUrl}/pedagogical`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching pedagogical statistics:', error);
      throw error;
    }
  }

  /**
   * Fetch status statistics
   */
  async getStatusStatistics(
    tenantId?: string,
    academicYearId?: number
  ): Promise<StatusStatistics> {
    try {
      const client = createApiClient(tenantId);
      const params = academicYearId ? { academic_year_id: academicYearId } : {};
      const response = await client.get<ApiResponse<StatusStatistics>>(
        `${this.baseUrl}/status`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching status statistics:', error);
      throw error;
    }
  }

  /**
   * Fetch year comparison data
   */
  async getComparison(
    tenantId?: string,
    years: number[] = []
  ): Promise<YearComparisonData[]> {
    try {
      const client = createApiClient(tenantId);
      const params = years.length > 0 ? { years: years.join(',') } : {};
      const response = await client.get<ApiResponse<YearComparisonData[]>>(
        `${this.baseUrl}/comparison`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching year comparison:', error);
      throw error;
    }
  }

  /**
   * Fetch alerts
   */
  async getAlerts(tenantId?: string): Promise<EnrollmentAlert[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<EnrollmentAlert[]>>(
        `${this.baseUrl}/alerts`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Clear statistics cache
   */
  async clearCache(tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.post(`${this.baseUrl}/clear-cache`);
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Generate executive summary PDF
   */
  async generateExecutiveSummary(
    tenantId?: string,
    request?: ReportGenerationRequest
  ): Promise<ReportDownloadResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<ReportDownloadResponse>>(
        `${this.reportsUrl}/executive-summary`,
        request || {}
      );

      return response.data.data;
    } catch (error) {
      console.error('Error generating executive summary:', error);
      throw error;
    }
  }

  /**
   * Generate dashboard PDF
   */
  async generateDashboard(
    tenantId?: string,
    request?: ReportGenerationRequest
  ): Promise<ReportDownloadResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<ReportDownloadResponse>>(
        `${this.reportsUrl}/dashboard`,
        request || {}
      );

      return response.data.data;
    } catch (error) {
      console.error('Error generating dashboard report:', error);
      throw error;
    }
  }

  /**
   * Export to Excel
   */
  async exportToExcel(
    tenantId?: string,
    filters?: ExcelExportFilters
  ): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.reportsUrl}/export/excel`, {
        params: filters,
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }

  /**
   * Download generated report
   */
  async downloadReport(path: string, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.reportsUrl}/download`, {
        params: { path },
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const enrollmentStatisticsService = new EnrollmentStatisticsService();
