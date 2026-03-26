import { createApiClient } from '@/shared/lib/api-client';

import type {
  Diploma,
  CreateDiplomaRequest,
  UpdateDiplomaRequest,
  DeliverDiplomaRequest,
  DiplomaFilters,
  DiplomaStatistics,
  PaginatedResponse,
} from '../../types';

class DiplomaService {
  private baseUrl = '/admin/documents/diplomas';

  async getDiplomas(
    filters?: DiplomaFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<Diploma>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Diploma>>(
      this.baseUrl,
      { params: filters },
    );

    return response.data;
  }

  async getDiploma(
    diplomaId: number,
    tenantId?: string,
  ): Promise<Diploma> {
    const client = createApiClient(tenantId);
    const response = await client.get<Diploma>(
      `${this.baseUrl}/${diplomaId}`,
    );

    return response.data;
  }

  async createDiploma(
    data: CreateDiplomaRequest,
    tenantId?: string,
  ): Promise<Diploma> {
    const client = createApiClient(tenantId);
    const response = await client.post<Diploma>(
      this.baseUrl,
      data,
    );

    return response.data;
  }

  async updateDiploma(
    diplomaId: number,
    data: UpdateDiplomaRequest,
    tenantId?: string,
  ): Promise<Diploma> {
    const client = createApiClient(tenantId);
    const response = await client.put<Diploma>(
      `${this.baseUrl}/${diplomaId}`,
      data,
    );

    return response.data;
  }

  async deleteDiploma(
    diplomaId: number,
    tenantId?: string,
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(
      `${this.baseUrl}/${diplomaId}`,
    );

    return response.data;
  }

  async duplicateDiploma(
    diplomaId: number,
    tenantId?: string,
  ): Promise<Diploma> {
    const client = createApiClient(tenantId);
    const response = await client.post<Diploma>(
      `${this.baseUrl}/${diplomaId}/duplicate`,
    );

    return response.data;
  }

  async generateSupplement(
    diplomaId: number,
    tenantId?: string,
  ): Promise<{ message: string; diploma: Diploma }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; diploma: Diploma }>(
      `${this.baseUrl}/${diplomaId}/supplement`,
    );

    return response.data;
  }

  async deliverDiploma(
    diplomaId: number,
    data: DeliverDiplomaRequest,
    tenantId?: string,
  ): Promise<{ message: string; diploma: Diploma }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; diploma: Diploma }>(
      `${this.baseUrl}/${diplomaId}/deliver`,
      data,
    );

    return response.data;
  }

  async downloadDiploma(
    diplomaId: number,
    tenantId?: string,
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.baseUrl}/${diplomaId}/download`,
      { responseType: 'blob' },
    );

    return response.data;
  }

  async getStatistics(
    tenantId?: string,
  ): Promise<DiplomaStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<DiplomaStatistics>(
      `${this.baseUrl}/statistics`,
    );

    return response.data;
  }
}

export const diplomaService = new DiplomaService();
