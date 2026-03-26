import { createApiClient } from '@/shared/lib/api-client';

import type {
  SalaryScale,
  PayrollComponent,
  Advance,
  CreateSalaryScaleRequest,
  CreatePayrollComponentRequest,
  CreateAdvanceRequest,
  AdvanceFilters,
  PaginatedResponse,
} from '../../types';

class ComponentService {
  private baseUrl = '/admin/payroll';

  async getSalaryScales(
    tenantId?: string,
  ): Promise<SalaryScale[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<SalaryScale[]>(
      `${this.baseUrl}/salary-scales`,
    );

    return response.data;
  }

  async createSalaryScale(
    data: CreateSalaryScaleRequest,
    tenantId?: string,
  ): Promise<SalaryScale> {
    const client = createApiClient(tenantId);
    const response = await client.post<SalaryScale>(
      `${this.baseUrl}/salary-scales`,
      data,
    );

    return response.data;
  }

  async updateSalaryScale(
    scaleId: number,
    data: Partial<CreateSalaryScaleRequest>,
    tenantId?: string,
  ): Promise<SalaryScale> {
    const client = createApiClient(tenantId);
    const response = await client.put<SalaryScale>(
      `${this.baseUrl}/salary-scales/${scaleId}`,
      data,
    );

    return response.data;
  }

  async deleteSalaryScale(
    scaleId: number,
    tenantId?: string,
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(
      `${this.baseUrl}/salary-scales/${scaleId}`,
    );

    return response.data;
  }

  async getComponents(
    tenantId?: string,
  ): Promise<PayrollComponent[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<PayrollComponent[]>(
      `${this.baseUrl}/components`,
    );

    return response.data;
  }

  async createComponent(
    data: CreatePayrollComponentRequest,
    tenantId?: string,
  ): Promise<PayrollComponent> {
    const client = createApiClient(tenantId);
    const response = await client.post<PayrollComponent>(
      `${this.baseUrl}/components`,
      data,
    );

    return response.data;
  }

  async updateComponent(
    componentId: number,
    data: Partial<CreatePayrollComponentRequest>,
    tenantId?: string,
  ): Promise<PayrollComponent> {
    const client = createApiClient(tenantId);
    const response = await client.put<PayrollComponent>(
      `${this.baseUrl}/components/${componentId}`,
      data,
    );

    return response.data;
  }

  async deleteComponent(
    componentId: number,
    tenantId?: string,
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(
      `${this.baseUrl}/components/${componentId}`,
    );

    return response.data;
  }

  async getAdvances(
    filters?: AdvanceFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<Advance>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Advance>>(
      `${this.baseUrl}/advances`,
      { params: filters },
    );

    return response.data;
  }

  async requestAdvance(
    data: CreateAdvanceRequest,
    tenantId?: string,
  ): Promise<Advance> {
    const client = createApiClient(tenantId);
    const response = await client.post<Advance>(
      `${this.baseUrl}/advances`,
      data,
    );

    return response.data;
  }

  async approveAdvance(
    advanceId: number,
    tenantId?: string,
  ): Promise<{ message: string; advance: Advance }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; advance: Advance }>(
      `${this.baseUrl}/advances/${advanceId}/approve`,
    );

    return response.data;
  }

  async disburseAdvance(
    advanceId: number,
    tenantId?: string,
  ): Promise<{ message: string; advance: Advance }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; advance: Advance }>(
      `${this.baseUrl}/advances/${advanceId}/disburse`,
    );

    return response.data;
  }
}

export const componentService = new ComponentService();
