import { createApiClient } from '@/shared/lib/api-client';
import type {
  Module,
  ModuleFormData,
  ModuleQueryParams,
  PaginatedModulesResponse,
  ModuleResponse,
  ModuleStatistics,
} from '../../types/module.types';

class ModuleService {
  /**
   * Get paginated list of modules with filters
   */
  async getModules(params: ModuleQueryParams = {}, tenantId?: string): Promise<PaginatedModulesResponse> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedModulesResponse>('/admin/modules', { params });
    return response.data;
  }

  /**
   * Get a single module by ID
   */
  async getModule(id: number, tenantId?: string): Promise<Module> {
    const client = createApiClient(tenantId);
    const response = await client.get<ModuleResponse>(`/admin/modules/${id}`);
    return response.data.data;
  }

  /**
   * Create a new module
   */
  async createModule(data: ModuleFormData, tenantId?: string): Promise<Module> {
    const client = createApiClient(tenantId);
    const response = await client.post<ModuleResponse>('/admin/modules', data);
    return response.data.data;
  }

  /**
   * Update an existing module
   */
  async updateModule(id: number, data: Partial<ModuleFormData>, tenantId?: string): Promise<Module> {
    const client = createApiClient(tenantId);
    const response = await client.put<ModuleResponse>(`/admin/modules/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a module (soft delete)
   */
  async deleteModule(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`/admin/modules/${id}`);
  }

  /**
   * Search modules (autocomplete)
   */
  async searchModules(query: string, tenantId?: string): Promise<Module[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: Module[] }>('/admin/modules/search', {
      params: { q: query },
    });
    return response.data.data;
  }

  /**
   * Get module statistics
   */
  async getStatistics(tenantId?: string): Promise<ModuleStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: ModuleStatistics }>('/admin/modules/statistics');
    return response.data.data;
  }
}

export const moduleService = new ModuleService();
