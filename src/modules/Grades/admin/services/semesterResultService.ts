/**
 * Semester Result Service
 * Handles semester results, statistics, recalculation and publication
 * API routes: /api/admin/semesters/{semester}/results/*
 */

import { createApiClient } from '@/shared/lib/api-client';

import type { SemesterResult } from '../../types/grade.types';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface SemesterStatistics {
  count: number;
  average: number | null;
  min: number | null;
  max: number | null;
  median: number | null;
  validation_rate: number;
  status_distribution: {
    validated: number;
    partially_validated: number;
    to_retake: number;
    deferred: number;
  };
  progression_stats: {
    can_progress: number;
    cannot_progress: number;
    total: number;
  };
}

export interface SemesterResultFilters {
  search?: string;
  validated?: boolean;
  blocked_by_eliminatory?: boolean;
  global_status?: 'validated' | 'partially_validated' | 'to_retake' | 'deferred';
  can_progress?: boolean;
  sort_by?: 'rank' | 'average';
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

class SemesterResultService {
  private baseUrl = '/admin';

  /**
   * Get paginated semester results
   */
  async getSemesterResults(
    semesterId: number,
    filters?: SemesterResultFilters,
    page: number = 1,
    perPage: number = 999,
    tenantId?: string
  ): Promise<{ results: SemesterResult[]; total: number; lastPage: number }> {
    try {
      const client = createApiClient(tenantId);
      const params: Record<string, any> = { page, per_page: perPage };

      if (filters?.search) params.search = filters.search;
      if (filters?.validated !== undefined) params.validated = filters.validated;
      if (filters?.blocked_by_eliminatory !== undefined) params.blocked_by_eliminatory = filters.blocked_by_eliminatory;
      if (filters?.global_status) params.global_status = filters.global_status;
      if (filters?.can_progress !== undefined) params.can_progress = filters.can_progress;
      if (filters?.sort_by) params.sort_by = filters.sort_by;

      const response = await client.get<PaginatedResponse<any>>(
        `${this.baseUrl}/semesters/${semesterId}/results`,
        { params }
      );

      const results: SemesterResult[] = (response.data.data || []).map((item: any) => ({
      student_id: item.student_id,
      semester_id: item.semester_id,
      average: item.average !== null ? parseFloat(item.average) : null,
      is_final: item.is_final,
      is_validated: item.is_validated,
      global_status: item.global_status || 'to_retake',
      validated_modules_count: item.validated_modules_count || 0,
      compensated_modules_count: item.compensated_modules_count || 0,
      failed_modules_count: item.failed_modules_count || 0,
      total_credits: item.total_credits || 0,
      acquired_credits: item.acquired_credits || 0,
      missing_credits: item.missing_credits || 0,
      success_rate: item.success_rate !== null ? parseFloat(item.success_rate) : 0,
      rank: item.rank,
      total_ranked: item.total_ranked,
      validation_blocked_by_eliminatory: item.validation_blocked_by_eliminatory || false,
      blocking_reasons: item.blocking_reasons || [],
      can_progress_next_year: item.can_progress_next_year || false,
      missing_modules_count: item.missing_modules_count || 0,
      calculated_at: item.calculated_at,
      published_at: item.published_at,
      // Extra fields from resource
      status: item.status,
      passed: item.passed,
      mention: item.mention,
      global_status_label: item.global_status_label,
      rank_display: item.rank_display,
      student: item.student ? {
        id: item.student.id,
        matricule: item.student.matricule,
        firstname: item.student.full_name?.split(' ')[0] ?? '',
        lastname: item.student.full_name?.split(' ').slice(1).join(' ') ?? '',
        full_name: item.student.full_name,
      } : undefined,
    }));

      return {
        results,
        total: response.data.meta?.total ?? results.length,
        lastPage: response.data.meta?.last_page ?? 1,
      };
    } catch (err) {
      if (isNotFoundResponse(err)) {
        return { results: [], total: 0, lastPage: 1 };
      }

      throw err;
    }
  }

  /**
   * Get semester statistics
   */
  async getStatistics(
    semesterId: number,
    tenantId?: string
  ): Promise<SemesterStatistics | null> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<SemesterStatistics>>(
        `${this.baseUrl}/semesters/${semesterId}/results/statistics`
      );

      return response.data.data;
    } catch (err) {
      if (isNotFoundResponse(err)) {
        return null;
      }

      throw err;
    }
  }

  /**
   * Recalculate semester averages
   */
  async recalculate(
    semesterId: number,
    tenantId?: string
  ): Promise<{ message: string; count?: number }> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<{ message: string; count?: number }>>(
      `${this.baseUrl}/semesters/${semesterId}/results/recalculate`
    );

    return response.data.data || { message: response.data.message || 'Recalculation started' };
  }

  /**
   * Publish semester results
   */
  async publish(
    semesterId: number,
    tenantId?: string
  ): Promise<{ message: string; published_count?: number }> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<{ message: string; published_count?: number }>>(
      `${this.baseUrl}/semesters/${semesterId}/results/publish`
    );

    return response.data.data || { message: response.data.message || 'Published' };
  }
}

export const semesterResultService = new SemesterResultService();
