/**
 * Admin Coefficient Service
 * Handles coefficient and ECTS credits management
 * API routes: /api/admin/modules/{module}/coefficients, /api/admin/evaluations/{evaluation}/...
 */

import { createApiClient } from '@/shared/lib/api-client';

import type {
  ModuleCoefficients,
  UpdateCoefficientRequest,
  UpdateCoefficientResponse,
  UpdateCreditsRequest,
  UpdateCreditsResponse,
  CoefficientImpactSimulation,
  SimulateImpactRequest,
  CoefficientHistoryEntry,
  CreditsHistoryEntry,
  CoefficientTemplate,
  CreateTemplateRequest,
  ApplyTemplateRequest,
  ApplyTemplateResponse,
} from '../../types/coefficient.types';

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Admin Coefficient Service
 */
class AdminCoefficientService {
  private baseUrl = '/admin';

  /**
   * Get module coefficients configuration
   * Backend returns: { data: EvalArray[], total_coefficient: number }
   * We transform this into a ModuleCoefficients object
   */
  async getModuleCoefficients(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<ModuleCoefficients> {
    const client = createApiClient(tenantId);
    const response = await client.get<{
      data: Array<{
        id: number;
        name: string;
        type: string;
        coefficient: string | number;
        max_score: string | number;
        order: number;
        status: string;
      }>;
      total_coefficient: number;
    }>(
      `${this.baseUrl}/modules/${moduleId}/coefficients`,
      { params: { semester_id: semesterId } }
    );

    const rawEvals = response.data.data || [];
    const hasPublished = rawEvals.some((e) => e.status === 'Published');

    const evaluations: ModuleCoefficients['evaluations'] = rawEvals.map((e) => ({
      id: e.id,
      type: e.type as any,
      name: e.name,
      coefficient: parseFloat(String(e.coefficient)),
      max_score: parseFloat(String(e.max_score)),
      is_locked: e.status === 'Published',
      has_grades: e.status !== 'Empty',
      has_published_grades: e.status === 'Published',
      can_modify_coefficient: e.status !== 'Published',
      grades_count: 0,
    }));

    return {
      id: moduleId,
      code: '',
      name: '',
      credits_ects: 0,
      credits_locked: false,
      total_coefficients: response.data.total_coefficient ?? 0,
      evaluations,
      has_published_grades: hasPublished,
      can_modify: !hasPublished,
    };
  }

  /**
   * Update evaluation coefficient
   */
  async updateCoefficient(
    evaluationId: number,
    data: UpdateCoefficientRequest,
    tenantId?: string
  ): Promise<UpdateCoefficientResponse> {
    const client = createApiClient(tenantId);
    const response = await client.put<ApiResponse<UpdateCoefficientResponse>>(
      `${this.baseUrl}/evaluations/${evaluationId}/coefficient`,
      data
    );

    return response.data.data;
  }

  /**
   * Simulate coefficient change impact
   */
  async simulateImpact(
    evaluationId: number,
    data: SimulateImpactRequest,
    tenantId?: string
  ): Promise<CoefficientImpactSimulation> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<CoefficientImpactSimulation>>(
      `${this.baseUrl}/evaluations/${evaluationId}/simulate-impact`,
      data
    );

    return response.data.data;
  }

  /**
   * Get coefficient history for an evaluation
   */
  async getCoefficientHistory(
    evaluationId: number,
    tenantId?: string
  ): Promise<CoefficientHistoryEntry[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<CoefficientHistoryEntry[]>>(
      `${this.baseUrl}/evaluations/${evaluationId}/coefficient-history`
    );

    return response.data.data;
  }

  /**
   * Update module ECTS credits
   */
  async updateCredits(
    moduleId: number,
    data: UpdateCreditsRequest,
    tenantId?: string
  ): Promise<UpdateCreditsResponse> {
    const client = createApiClient(tenantId);
    const response = await client.put<ApiResponse<UpdateCreditsResponse>>(
      `${this.baseUrl}/modules/${moduleId}/coefficients/credits`,
      data
    );

    return response.data.data;
  }

  /**
   * Get credits history for a module
   */
  async getCreditsHistory(
    moduleId: number,
    tenantId?: string
  ): Promise<CreditsHistoryEntry[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<CreditsHistoryEntry[]>>(
      `${this.baseUrl}/modules/${moduleId}/coefficients/credits-history`
    );

    return response.data.data;
  }

  /**
   * Get all coefficient templates
   */
  async getTemplates(tenantId?: string): Promise<CoefficientTemplate[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<CoefficientTemplate[]>>(
      `${this.baseUrl}/coefficient-templates`
    );

    return response.data.data;
  }

  /**
   * Create a custom coefficient template
   */
  async createTemplate(
    data: CreateTemplateRequest,
    tenantId?: string
  ): Promise<CoefficientTemplate> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<CoefficientTemplate>>(
      `${this.baseUrl}/coefficient-templates`,
      data
    );

    return response.data.data;
  }

  /**
   * Apply a coefficient template to a module
   */
  async applyTemplate(
    moduleId: number,
    data: ApplyTemplateRequest,
    tenantId?: string
  ): Promise<ApplyTemplateResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<ApplyTemplateResponse>>(
      `${this.baseUrl}/modules/${moduleId}/coefficients/apply-template`,
      data
    );

    return response.data.data;
  }
}

export const adminCoefficientService = new AdminCoefficientService();
