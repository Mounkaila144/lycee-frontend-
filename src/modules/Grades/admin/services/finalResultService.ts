import { createApiClient } from '@/shared/lib/api-client';
import type {
  FinalResult,
  FinalStatistics,
  PublishFinalResultsRequest,
  PublishFinalResultsResponse,
  LockYearResponse,
} from '../../types/finalResult.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
}

/**
 * Admin Final Results Service (Story 20)
 * Handles final results publication, statistics, and year locking
 */
class FinalResultService {
  private transformPagination<T>(response: BackendPaginatedResponse<T> | PaginatedResponse<T>): PaginatedResponse<T> {
    if ('meta' in response) {
      return {
        data: response.data,
        current_page: response.meta.current_page,
        last_page: response.meta.last_page,
        per_page: response.meta.per_page,
        total: response.meta.total,
        from: response.meta.from ?? 0,
        to: response.meta.to ?? 0,
      };
    }

    return response;
  }

  /**
   * Publish final results for a semester
   * POST /api/admin/semesters/{semester}/publish-final-results
   */
  async publishFinalResults(
    semesterId: number,
    data: PublishFinalResultsRequest,
    tenantId?: string
  ): Promise<PublishFinalResultsResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<PublishFinalResultsResponse>(
      `/admin/semesters/${semesterId}/publish-final-results`,
      data
    );

    return response.data;
  }

  /**
   * Get final statistics for a semester
   * GET /api/admin/semesters/{semester}/final-statistics
   */
  async getStatistics(semesterId: number, tenantId?: string): Promise<FinalStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<FinalStatistics>>(
      `/admin/semesters/${semesterId}/final-statistics`
    );

    return response.data.data;
  }

  /**
   * Get final results list for a semester
   * GET /api/admin/semesters/{semester}/final-results
   */
  async getResults(
    semesterId: number,
    params?: { final_status?: string; page?: number; per_page?: number },
    tenantId?: string
  ): Promise<PaginatedResponse<FinalResult>> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `/admin/semesters/${semesterId}/final-results`,
      { params }
    );

    return this.transformPagination(response.data);
  }

  /**
   * Lock the academic year for a semester
   * POST /api/admin/semesters/{semester}/lock-year
   */
  async lockYear(semesterId: number, tenantId?: string): Promise<LockYearResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<LockYearResponse>(
      `/admin/semesters/${semesterId}/lock-year`
    );

    return response.data;
  }

  /**
   * Export final results as Excel
   * GET /api/admin/semesters/{semester}/final-results/export
   */
  async exportResults(semesterId: number, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `/admin/semesters/${semesterId}/final-results/export`,
      { responseType: 'blob' }
    );

    return response.data;
  }
}

export const finalResultService = new FinalResultService();
