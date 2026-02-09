/**
 * Compensation Service
 * Handles compensation rules, simulation and application
 * API routes: /api/admin/compensation-rules, /api/admin/semesters/{semester}/compensation/*
 */

import { createApiClient } from '@/shared/lib/api-client';

import type {
  CompensationRules,
  CompensationSimulationResult,
  CompensationStatistics,
  CompensableModule,
  ApplyCompensationResponse,
  CompensationLog,
} from '../../types/compensation.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
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

class CompensationService {
  private baseUrl = '/admin';

  /**
   * Map backend compensation rules to frontend format
   */
  private mapRulesFromBackend(data: any): CompensationRules {
    return {
      id: data.id,
      enabled: data.compensation_enabled ?? data.enabled ?? false,
      min_semester_average: data.min_semester_average !== null ? parseFloat(data.min_semester_average) : 10,
      min_compensable_grade: data.min_compensable_grade !== null ? parseFloat(data.min_compensable_grade) : 7,
      max_compensated_modules: data.max_compensated_modules ?? 2,
      allow_professional: data.allow_professional_module_compensation ?? data.allow_professional ?? false,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Map frontend compensation rules to backend format
   */
  private mapRulesToBackend(rules: Partial<CompensationRules>): Record<string, any> {
    const mapped: Record<string, any> = {};

    if (rules.enabled !== undefined) mapped.compensation_enabled = rules.enabled;
    if (rules.min_semester_average !== undefined) mapped.min_semester_average = rules.min_semester_average;
    if (rules.min_compensable_grade !== undefined) mapped.min_compensable_grade = rules.min_compensable_grade;
    if (rules.max_compensated_modules !== undefined) mapped.max_compensated_modules = rules.max_compensated_modules;
    if (rules.allow_professional !== undefined) mapped.allow_professional_module_compensation = rules.allow_professional;

    return mapped;
  }

  /**
   * Get compensation rules
   */
  async getRules(tenantId?: string): Promise<CompensationRules> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<any>>(
        `${this.baseUrl}/compensation-rules`
      );

      return this.mapRulesFromBackend(response.data.data);
    } catch (err) {
      if (isNotFoundResponse(err)) {
        return {
          enabled: false,
          min_semester_average: 10,
          min_compensable_grade: 7,
          max_compensated_modules: 2,
          allow_professional: false,
        };
      }

      throw err;
    }
  }

  /**
   * Update compensation rules
   */
  async updateRules(
    rules: Partial<CompensationRules>,
    tenantId?: string
  ): Promise<CompensationRules> {
    const client = createApiClient(tenantId);
    const response = await client.put<ApiResponse<any>>(
      `${this.baseUrl}/compensation-rules`,
      this.mapRulesToBackend(rules)
    );

    return this.mapRulesFromBackend(response.data.data);
  }

  /**
   * Simulate compensation for a semester
   */
  async simulate(
    semesterId: number,
    tenantId?: string
  ): Promise<CompensationSimulationResult> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<CompensationSimulationResult>>(
      `${this.baseUrl}/semesters/${semesterId}/compensation/simulate`
    );

    return response.data.data;
  }

  /**
   * Apply compensation in bulk for a semester
   */
  async applyBulk(
    semesterId: number,
    tenantId?: string
  ): Promise<ApplyCompensationResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<ApplyCompensationResponse>>(
      `${this.baseUrl}/semesters/${semesterId}/compensation/apply`
    );

    return response.data.data || { message: response.data.message || 'Applied', applied_count: 0 };
  }

  /**
   * Get compensation statistics for a semester
   */
  async getStatistics(
    semesterId: number,
    tenantId?: string
  ): Promise<CompensationStatistics | null> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<CompensationStatistics>>(
        `${this.baseUrl}/semesters/${semesterId}/compensation/statistics`
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
   * Get compensable modules for a student in a semester
   */
  async getCompensableModules(
    studentId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<CompensableModule[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<CompensableModule[]>>(
      `${this.baseUrl}/students/${studentId}/semesters/${semesterId}/compensable-modules`
    );

    return response.data.data;
  }

  /**
   * Apply compensation for a specific student
   */
  async applyForStudent(
    studentId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<ApplyCompensationResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<ApplyCompensationResponse>>(
      `${this.baseUrl}/students/${studentId}/semesters/${semesterId}/compensation/apply`
    );

    return response.data.data || { message: response.data.message || 'Applied', applied_count: 0 };
  }

  /**
   * Remove compensation for a student's module
   */
  async removeCompensation(
    studentId: number,
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/students/${studentId}/modules/${moduleId}/semesters/${semesterId}/compensation`
    );

    return response.data.data || { message: response.data.message || 'Removed' };
  }

  /**
   * Get student compensation history
   */
  async getStudentHistory(
    studentId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<CompensationLog[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<CompensationLog[]>>(
      `${this.baseUrl}/students/${studentId}/compensation-history`,
      { params: { semester_id: semesterId } }
    );

    return response.data.data || [];
  }
}

export const compensationService = new CompensationService();
