import { createApiClient } from '@/shared/lib/api-client';

import type {
  Advance,
  AdvanceFilters,
  ComponentFilters,
  CreateAdvanceRequest,
  CreatePayrollComponentRequest,
  CreateSalaryScaleRequest,
  DisburseAdvanceRequest,
  MessageResponse,
  PayrollComponent,
  SalaryScale,
} from '../../types';

/**
 * Grilles salariales, éléments de paie et avances (Epic 2).
 * Les listes sont renvoyées par le backend sous forme de tableau brut.
 */
class ComponentService {
  private baseUrl = '/admin/payroll';

  async getSalaryScales(tenantId?: string): Promise<SalaryScale[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<SalaryScale[]>(`${this.baseUrl}/salary-scales`);

    return response.data;
  }

  async createSalaryScale(data: CreateSalaryScaleRequest, tenantId?: string): Promise<SalaryScale> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<SalaryScale>>(`${this.baseUrl}/salary-scales`, data);

    return response.data.data;
  }

  async getComponents(filters?: ComponentFilters, tenantId?: string): Promise<PayrollComponent[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<PayrollComponent[]>(`${this.baseUrl}/components`, { params: filters });

    return response.data;
  }

  async createComponent(data: CreatePayrollComponentRequest, tenantId?: string): Promise<PayrollComponent> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<PayrollComponent>>(`${this.baseUrl}/components`, data);

    return response.data.data;
  }

  async getAdvances(filters?: AdvanceFilters, tenantId?: string): Promise<Advance[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<Advance[]>(`${this.baseUrl}/advances`, { params: filters });

    return response.data;
  }

  async requestAdvance(data: CreateAdvanceRequest, tenantId?: string): Promise<Advance> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<Advance>>(`${this.baseUrl}/advances`, data);

    return response.data.data;
  }

  async approveAdvance(advanceId: number, tenantId?: string): Promise<Advance> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<Advance>>(`${this.baseUrl}/advances/${advanceId}/approve`);

    return response.data.data;
  }

  async disburseAdvance(advanceId: number, data: DisburseAdvanceRequest, tenantId?: string): Promise<Advance> {
    const client = createApiClient(tenantId);

    const response = await client.post<MessageResponse<Advance>>(
      `${this.baseUrl}/advances/${advanceId}/disburse`,
      data,
    );

    return response.data.data;
  }
}

export const componentService = new ComponentService();
