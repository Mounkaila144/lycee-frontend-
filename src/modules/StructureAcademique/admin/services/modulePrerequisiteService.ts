import { createApiClient } from '@/shared/lib/api-client';
import type {
  ModulePrerequisite,
  AddPrerequisiteRequest,
  PrerequisiteResponse,
  DependencyGraphResponse,
  EnrollmentEligibilityResponse,
} from '../../types/modulePrerequisite.types';

class ModulePrerequisiteService {
  /**
   * Get prerequisites for a module
   */
  async getPrerequisites(moduleId: number, tenantId?: string): Promise<ModulePrerequisite[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<PrerequisiteResponse>(`/admin/modules/${moduleId}/prerequisites`);
    return response.data.data;
  }

  /**
   * Add a prerequisite to a module
   */
  async addPrerequisite(
    moduleId: number,
    data: AddPrerequisiteRequest,
    tenantId?: string
  ): Promise<ModulePrerequisite> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ data: ModulePrerequisite }>(
      `/admin/modules/${moduleId}/prerequisites`,
      data
    );
    return response.data.data;
  }

  /**
   * Remove a prerequisite from a module
   */
  async removePrerequisite(moduleId: number, prerequisiteId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`/admin/modules/${moduleId}/prerequisites/${prerequisiteId}`);
  }

  /**
   * Get dependency graph for a module
   */
  async getDependencyGraph(moduleId: number, tenantId?: string): Promise<DependencyGraphResponse['data']> {
    const client = createApiClient(tenantId);
    const response = await client.get<DependencyGraphResponse>(`/admin/modules/${moduleId}/dependency-graph`);
    return response.data.data;
  }

  /**
   * Check if a student can enroll in a module (check prerequisites)
   */
  async checkEnrollmentEligibility(
    studentId: number,
    moduleId: number,
    tenantId?: string
  ): Promise<EnrollmentEligibilityResponse['data']> {
    const client = createApiClient(tenantId);
    const response = await client.post<EnrollmentEligibilityResponse>(
      `/admin/students/${studentId}/check-prerequisites/${moduleId}`
    );
    return response.data.data;
  }
}

export const modulePrerequisiteService = new ModulePrerequisiteService();
