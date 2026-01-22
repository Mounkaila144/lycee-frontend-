import { createApiClient } from '@/shared/lib/api-client';
import type {
  ProgressionRule,
  ProgressionRuleFormData,
  ProgressionRulesResponse,
  ProgressionRuleResponse,
  EliminatoryModule,
  AddEliminatoryModuleRequest,
  EliminatoryModulesResponse,
  ProgressionResultResponse,
} from '../../types/progression.types';

class ProgressionService {
  /**
   * Get all progression rules
   */
  async getProgressionRules(tenantId?: string): Promise<ProgressionRule[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ProgressionRulesResponse>('/admin/progression-rules');
    return response.data.data;
  }

  /**
   * Create a new progression rule
   */
  async createProgressionRule(data: ProgressionRuleFormData, tenantId?: string): Promise<ProgressionRule> {
    const client = createApiClient(tenantId);
    const response = await client.post<ProgressionRuleResponse>('/admin/progression-rules', data);
    return response.data.data;
  }

  /**
   * Update an existing progression rule
   */
  async updateProgressionRule(
    id: number,
    data: Partial<ProgressionRuleFormData>,
    tenantId?: string
  ): Promise<ProgressionRule> {
    const client = createApiClient(tenantId);
    const response = await client.put<ProgressionRuleResponse>(`/admin/progression-rules/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a progression rule
   */
  async deleteProgressionRule(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`/admin/progression-rules/${id}`);
  }

  /**
   * Get eliminatory modules for a program
   */
  async getEliminatoryModules(programId: number, tenantId?: string): Promise<EliminatoryModule[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<EliminatoryModulesResponse>(
      `/admin/programmes/${programId}/eliminatory-modules`
    );
    return response.data.data;
  }

  /**
   * Add an eliminatory module to a program
   */
  async addEliminatoryModule(
    programId: number,
    data: AddEliminatoryModuleRequest,
    tenantId?: string
  ): Promise<EliminatoryModule> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ data: EliminatoryModule }>(
      `/admin/programmes/${programId}/eliminatory-modules`,
      data
    );
    return response.data.data;
  }

  /**
   * Remove an eliminatory module from a program
   */
  async removeEliminatoryModule(programId: number, moduleId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`/admin/programmes/${programId}/eliminatory-modules/${moduleId}`);
  }

  /**
   * Validate progression for a student
   */
  async validateStudentProgression(
    studentId: number,
    tenantId?: string
  ): Promise<ProgressionResultResponse['data']> {
    const client = createApiClient(tenantId);
    const response = await client.post<ProgressionResultResponse>(
      `/admin/students/${studentId}/validate-progression`
    );
    return response.data.data;
  }
}

export const progressionService = new ProgressionService();
