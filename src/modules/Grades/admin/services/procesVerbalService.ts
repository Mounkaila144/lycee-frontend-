/**
 * Procès-Verbal Service
 * Handles PV generation, templates, archiving, and search
 */

import { createApiClient } from '@/shared/lib/api-client';

import type {
  PVTemplate,
  PVGenerationLog,
  PVSearchFilters,
  PVTemplateFormData,
} from '../../types/procesVerbal.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class ProcesVerbalService {
  private baseUrl = '/admin';

  async generatePV(
    sessionId: number,
    templateId?: number,
    tenantId?: string
  ): Promise<{ file_path: string; file_url: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<{ file_path: string; file_url: string }>>(
      `${this.baseUrl}/deliberation-sessions/${sessionId}/generate-pv`,
      templateId ? { template_id: templateId } : {}
    );

    return response.data.data;
  }

  async searchPVs(
    filters?: PVSearchFilters,
    tenantId?: string
  ): Promise<PVGenerationLog[]> {
    try {
      const client = createApiClient(tenantId);
      const params: Record<string, any> = {};

      if (filters?.year) params.year = filters.year;
      if (filters?.semester_id) params.semester_id = filters.semester_id;
      if (filters?.type) params.type = filters.type;
      if (filters?.program_id) params.program_id = filters.program_id;

      const response = await client.get<ApiResponse<PVGenerationLog[]>>(
        `${this.baseUrl}/pv/search`,
        { params }
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async downloadPV(
    pvId: number,
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `${this.baseUrl}/pv/${pvId}/download`,
      { responseType: 'blob' }
    );

    return response.data;
  }

  async getTemplates(
    tenantId?: string
  ): Promise<PVTemplate[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<PVTemplate[]>>(
        `${this.baseUrl}/pv-templates`
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async createTemplate(
    data: PVTemplateFormData,
    tenantId?: string
  ): Promise<PVTemplate> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<PVTemplate>>(
      `${this.baseUrl}/pv-templates`,
      data
    );

    return response.data.data;
  }

  async updateTemplate(
    templateId: number,
    data: Partial<PVTemplateFormData>,
    tenantId?: string
  ): Promise<PVTemplate> {
    const client = createApiClient(tenantId);
    const response = await client.put<ApiResponse<PVTemplate>>(
      `${this.baseUrl}/pv-templates/${templateId}`,
      data
    );

    return response.data.data;
  }

  async deleteTemplate(
    templateId: number,
    tenantId?: string
  ): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`${this.baseUrl}/pv-templates/${templateId}`);
  }
}

export const procesVerbalService = new ProcesVerbalService();
