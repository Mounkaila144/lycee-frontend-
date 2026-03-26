import { createApiClient } from '@/shared/lib/api-client';

import type {
  SocialDeclaration,
  AnnualSummary,
  CreateSocialDeclarationRequest,
  DeclarationFilters,
  PaginatedResponse,
} from '../../types';

class DeclarationService {
  private baseUrl = '/admin/payroll/declarations';

  async getDeclarations(
    filters?: DeclarationFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<SocialDeclaration>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<SocialDeclaration>>(
      this.baseUrl,
      { params: filters },
    );

    return response.data;
  }

  async getDeclaration(
    declarationId: number,
    tenantId?: string,
  ): Promise<SocialDeclaration> {
    const client = createApiClient(tenantId);
    const response = await client.get<SocialDeclaration>(
      `${this.baseUrl}/${declarationId}`,
    );

    return response.data;
  }

  async createDeclaration(
    data: CreateSocialDeclarationRequest,
    tenantId?: string,
  ): Promise<SocialDeclaration> {
    const client = createApiClient(tenantId);
    const response = await client.post<SocialDeclaration>(
      this.baseUrl,
      data,
    );

    return response.data;
  }

  async validateDeclaration(
    declarationId: number,
    tenantId?: string,
  ): Promise<{ message: string; declaration: SocialDeclaration }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; declaration: SocialDeclaration }>(
      `${this.baseUrl}/${declarationId}/validate`,
    );

    return response.data;
  }

  async submitDeclaration(
    declarationId: number,
    tenantId?: string,
  ): Promise<{ message: string; declaration: SocialDeclaration }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; declaration: SocialDeclaration }>(
      `${this.baseUrl}/${declarationId}/submit`,
    );

    return response.data;
  }

  async markDeclarationPaid(
    declarationId: number,
    tenantId?: string,
  ): Promise<{ message: string; declaration: SocialDeclaration }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; declaration: SocialDeclaration }>(
      `${this.baseUrl}/${declarationId}/payment`,
    );

    return response.data;
  }

  async getAnnualSummary(
    year: number,
    employeeId?: number,
    tenantId?: string,
  ): Promise<AnnualSummary[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<AnnualSummary[]>(
      `/admin/payroll/annual-summary`,
      { params: { year, employee_id: employeeId } },
    );

    return response.data;
  }
}

export const declarationService = new DeclarationService();
