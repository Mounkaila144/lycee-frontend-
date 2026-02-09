/**
 * Module Result Service
 * Handles module results generation, publication and retrieval
 * API routes: /api/admin/modules/{module}/semesters/{semester}/results/*
 */

import { createApiClient } from '@/shared/lib/api-client';

import type {
  ModuleStudentResult,
  ModuleResultStatistics,
  ModuleResultFilters,
  GenerateResultsResponse,
  PublishResultsResponse,
  StudentsByStatusResponse,
  ModuleResultStatus,
} from '../../types/moduleResult.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Check if an error is a 404 "no data" response from the backend
 */
function isNotFoundResponse(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    (err as any).response?.status === 404
  );
}

class ModuleResultService {
  private baseUrl = '/admin';

  /**
   * Get module results for a semester
   */
  async getResults(
    moduleId: number,
    semesterId: number,
    filters?: ModuleResultFilters,
    tenantId?: string
  ): Promise<{ results: ModuleStudentResult[]; total: number }> {
    try {
      const client = createApiClient(tenantId);
      const params: Record<string, any> = {};

      if (filters?.search) params.search = filters.search;
      if (filters?.status) params.status = filters.status;
      if (filters?.mention) params.mention = filters.mention;
      if (filters?.sort_by) params.sort_by = filters.sort_by;

      const response = await client.get<PaginatedResponse<any> | ApiResponse<any>>(
        `${this.baseUrl}/modules/${moduleId}/semesters/${semesterId}/results`,
        { params }
      );

      const data = response.data;

      // Handle both paginated and non-paginated responses
      const items = Array.isArray(data.data) ? data.data : [];

      const results: ModuleStudentResult[] = items.map((item: any) => ({
        student_id: item.student_id,
        module_id: item.module_id ?? moduleId,
        semester_id: item.semester_id ?? semesterId,
        average: item.average !== null && item.average !== undefined ? parseFloat(item.average) : null,
        rank: item.rank,
        total_ranked: item.total_ranked,
        rank_display: item.rank_display,
        mention: item.mention || null,
        status: item.status || 'pending',
        status_label: item.status_label,
        is_final: item.is_final ?? false,
        is_published: item.is_published ?? false,
        published_at: item.published_at,
        calculated_at: item.calculated_at,
        missing_evaluations_count: item.missing_evaluations_count ?? 0,
        compensation_applied_at: item.compensation_applied_at,
        student: item.student ? {
          id: item.student.id,
          matricule: item.student.matricule,
          firstname: item.student.full_name?.split(' ')[0] ?? item.student.firstname ?? '',
          lastname: item.student.full_name?.split(' ').slice(1).join(' ') ?? item.student.lastname ?? '',
          full_name: item.student.full_name,
        } : undefined,
      }));

      return {
        results,
        total: (data as any).meta?.total ?? results.length,
      };
    } catch (err) {
      if (isNotFoundResponse(err)) {
        return { results: [], total: 0 };
      }

      throw err;
    }
  }

  /**
   * Generate module results
   */
  async generate(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<GenerateResultsResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<GenerateResultsResponse>>(
      `${this.baseUrl}/modules/${moduleId}/semesters/${semesterId}/results/generate`
    );

    return response.data.data || { message: response.data.message || 'Generated', count: 0, module_id: moduleId, semester_id: semesterId };
  }

  /**
   * Publish module results
   */
  async publish(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<PublishResultsResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<PublishResultsResponse>>(
      `${this.baseUrl}/modules/${moduleId}/semesters/${semesterId}/results/publish`
    );

    return response.data.data || { message: response.data.message || 'Published', published_count: 0 };
  }

  /**
   * Get students by status
   */
  async getStudentsByStatus(
    moduleId: number,
    semesterId: number,
    status?: ModuleResultStatus,
    tenantId?: string
  ): Promise<StudentsByStatusResponse> {
    const client = createApiClient(tenantId);
    const params: Record<string, any> = {};

    if (status) params.status = status;

    const response = await client.get<ApiResponse<StudentsByStatusResponse>>(
      `${this.baseUrl}/modules/${moduleId}/semesters/${semesterId}/results/students-by-status`,
      { params }
    );

    return response.data.data;
  }

  /**
   * Export module results
   */
  async exportResults(
    moduleId: number,
    semesterId: number,
    format: 'xlsx' | 'csv' = 'xlsx',
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `${this.baseUrl}/modules/${moduleId}/semesters/${semesterId}/results/export`,
      { params: { format }, responseType: 'blob' }
    );

    return response.data;
  }
}

export const moduleResultService = new ModuleResultService();
