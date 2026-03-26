import { createApiClient } from '@/shared/lib/api-client';

import type {
  PayrollPeriod,
  Payslip,
  BankTransfer,
  CreatePayrollPeriodRequest,
  PayrollPeriodFilters,
  PaginatedResponse,
} from '../../types';

class PayrollService {
  private baseUrl = '/admin/payroll/payroll-periods';

  async getPeriods(
    filters?: PayrollPeriodFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<PayrollPeriod>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<PayrollPeriod>>(
      this.baseUrl,
      { params: filters },
    );

    return response.data;
  }

  async getPeriod(
    periodId: number,
    tenantId?: string,
  ): Promise<PayrollPeriod> {
    const client = createApiClient(tenantId);
    const response = await client.get<PayrollPeriod>(
      `${this.baseUrl}/${periodId}`,
    );

    return response.data;
  }

  async createPeriod(
    data: CreatePayrollPeriodRequest,
    tenantId?: string,
  ): Promise<PayrollPeriod> {
    const client = createApiClient(tenantId);
    const response = await client.post<PayrollPeriod>(
      this.baseUrl,
      data,
    );

    return response.data;
  }

  async updatePeriod(
    periodId: number,
    data: Partial<CreatePayrollPeriodRequest>,
    tenantId?: string,
  ): Promise<PayrollPeriod> {
    const client = createApiClient(tenantId);
    const response = await client.put<PayrollPeriod>(
      `${this.baseUrl}/${periodId}`,
      data,
    );

    return response.data;
  }

  async deletePeriod(
    periodId: number,
    tenantId?: string,
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(
      `${this.baseUrl}/${periodId}`,
    );

    return response.data;
  }

  async calculatePeriod(
    periodId: number,
    tenantId?: string,
  ): Promise<{ message: string; period: PayrollPeriod }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; period: PayrollPeriod }>(
      `${this.baseUrl}/${periodId}/calculate`,
    );

    return response.data;
  }

  async validatePeriod(
    periodId: number,
    tenantId?: string,
  ): Promise<{ message: string; period: PayrollPeriod }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; period: PayrollPeriod }>(
      `${this.baseUrl}/${periodId}/validate`,
    );

    return response.data;
  }

  async generatePayslips(
    periodId: number,
    tenantId?: string,
  ): Promise<{ message: string; count: number }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; count: number }>(
      `${this.baseUrl}/${periodId}/generate-payslips`,
    );

    return response.data;
  }

  async getPayslips(
    periodId: number,
    tenantId?: string,
  ): Promise<Payslip[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<Payslip[]>(
      `${this.baseUrl}/${periodId}/payslips`,
    );

    return response.data;
  }

  async generateBankTransfers(
    periodId: number,
    tenantId?: string,
  ): Promise<{ message: string; transfers: BankTransfer[] }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; transfers: BankTransfer[] }>(
      `${this.baseUrl}/${periodId}/bank-transfers`,
    );

    return response.data;
  }

  async getBankTransfers(
    periodId: number,
    tenantId?: string,
  ): Promise<BankTransfer[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<BankTransfer[]>(
      `${this.baseUrl}/${periodId}/bank-transfers`,
    );

    return response.data;
  }

  async markAsPaid(
    periodId: number,
    tenantId?: string,
  ): Promise<{ message: string; period: PayrollPeriod }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; period: PayrollPeriod }>(
      `${this.baseUrl}/${periodId}/mark-as-paid`,
    );

    return response.data;
  }
}

export const payrollService = new PayrollService();
