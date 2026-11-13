import { createApiClient } from '@/shared/lib/api-client';

import type {
  DeclarationFilters,
  DeclarationPaymentRequest,
  MessageResponse,
  SocialDeclaration,
  SubmitDeclarationRequest,
} from '../../types';

export type GeneratedDeclarationType = 'cnss' | 'income-tax' | 'amo';

/**
 * Déclarations sociales (Epic 4).
 */
class DeclarationService {
  private baseUrl = '/admin/payroll/declarations';

  async getDeclarations(filters?: DeclarationFilters, tenantId?: string): Promise<SocialDeclaration[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<SocialDeclaration[]>(this.baseUrl, { params: filters });

    return response.data;
  }

  async getDeclaration(declarationId: number, tenantId?: string): Promise<SocialDeclaration> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: SocialDeclaration }>(`${this.baseUrl}/${declarationId}`);

    return response.data.data;
  }

  async generateDeclaration(
    periodId: number,
    type: GeneratedDeclarationType,
    tenantId?: string,
  ): Promise<SocialDeclaration> {
    const client = createApiClient(tenantId);

    const response = await client.post<MessageResponse<SocialDeclaration>>(
      `/admin/payroll/payroll-periods/${periodId}/declarations/${type}`,
    );

    return response.data.data;
  }

  async generateAnnualSummary(year: number, tenantId?: string): Promise<SocialDeclaration> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<SocialDeclaration>>(`${this.baseUrl}/annual-summary`, { year });

    return response.data.data;
  }

  async validateDeclaration(declarationId: number, tenantId?: string): Promise<SocialDeclaration> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<SocialDeclaration>>(`${this.baseUrl}/${declarationId}/validate`);

    return response.data.data;
  }

  async submitDeclaration(
    declarationId: number,
    data: SubmitDeclarationRequest,
    tenantId?: string,
  ): Promise<SocialDeclaration> {
    const client = createApiClient(tenantId);

    const response = await client.post<MessageResponse<SocialDeclaration>>(
      `${this.baseUrl}/${declarationId}/submit`,
      data,
    );

    return response.data.data;
  }

  async recordPayment(
    declarationId: number,
    data: DeclarationPaymentRequest,
    tenantId?: string,
  ): Promise<SocialDeclaration> {
    const client = createApiClient(tenantId);

    const response = await client.post<MessageResponse<SocialDeclaration>>(
      `${this.baseUrl}/${declarationId}/payment`,
      data,
    );

    return response.data.data;
  }
}

export const declarationService = new DeclarationService();
