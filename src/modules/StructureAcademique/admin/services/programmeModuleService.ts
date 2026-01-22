/**
 * Service pour gérer l'association Programme ↔ Module
 */

import { createApiClient } from '@/shared/lib/api-client';
import type { Module } from '../../types/module.types';
import type { AssociateModulesData, ProgrammeModulesResponse } from '../../types/programmeModule.types';

class ProgrammeModuleService {
  /**
   * Récupérer les modules associés à un programme
   */
  async getModules(programmeId: number, tenantId?: string): Promise<Module[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ProgrammeModulesResponse>(
      `/admin/programmes/${programmeId}/modules`
    );
    return response.data.data;
  }

  /**
   * Associer plusieurs modules à un programme
   * Remplace les associations existantes
   */
  async associateModules(
    programmeId: number,
    data: AssociateModulesData,
    tenantId?: string
  ): Promise<Module[]> {
    const client = createApiClient(tenantId);
    const response = await client.post<ProgrammeModulesResponse>(
      `/admin/programmes/${programmeId}/modules`,
      data
    );
    return response.data.data;
  }

  /**
   * Dissocier un module d'un programme
   */
  async removeModule(
    programmeId: number,
    moduleId: number,
    tenantId?: string
  ): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`/admin/programmes/${programmeId}/modules/${moduleId}`);
  }

  /**
   * Récupérer tous les modules disponibles (pour sélection)
   */
  async getAvailableModules(tenantId?: string): Promise<Module[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: Module[] }>('/admin/modules', {
      params: { per_page: 1000 }, // Get all modules
    });
    return response.data.data;
  }
}

export const programmeModuleService = new ProgrammeModuleService();
