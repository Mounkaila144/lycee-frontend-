import { createApiClient } from '@/shared/lib/api-client';

import type {
  BankTransfer,
  CreatePayrollPeriodRequest,
  MessageResponse,
  PayrollPeriod,
  PayrollPeriodFilters,
  Payslip,
} from '../../types';

/**
 * Traitement de la paie (Epic 3) : périodes, calcul, validation, bulletins, virements, paiement.
 */
class PayrollService {
  private baseUrl = '/admin/payroll/payroll-periods';

  async getPeriods(filters?: PayrollPeriodFilters, tenantId?: string): Promise<PayrollPeriod[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<PayrollPeriod[]>(this.baseUrl, { params: filters });

    return response.data;
  }

  /** Inclut `payroll_records.employee` et `payslips`. */
  async getPeriod(periodId: number, tenantId?: string): Promise<PayrollPeriod> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: PayrollPeriod }>(`${this.baseUrl}/${periodId}`);

    return response.data.data;
  }

  async createPeriod(data: CreatePayrollPeriodRequest, tenantId?: string): Promise<PayrollPeriod> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<PayrollPeriod>>(this.baseUrl, data);

    return response.data.data;
  }

  /** Seules les périodes en brouillon peuvent être supprimées. */
  async deletePeriod(periodId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);

    await client.delete(`${this.baseUrl}/${periodId}`);
  }

  async calculatePeriod(periodId: number, tenantId?: string): Promise<PayrollPeriod> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<PayrollPeriod>>(`${this.baseUrl}/${periodId}/calculate`);

    return response.data.data;
  }

  async validatePeriod(periodId: number, tenantId?: string): Promise<PayrollPeriod> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<PayrollPeriod>>(`${this.baseUrl}/${periodId}/validate`);

    return response.data.data;
  }

  async generatePayslips(periodId: number, tenantId?: string): Promise<{ data: Payslip[]; count: number }> {
    const client = createApiClient(tenantId);

    const response = await client.post<MessageResponse<Payslip[]> & { count: number }>(
      `${this.baseUrl}/${periodId}/generate-payslips`,
    );

    return { data: response.data.data, count: response.data.count };
  }

  async getBankTransfers(periodId: number, tenantId?: string): Promise<BankTransfer[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<MessageResponse<BankTransfer[]>>(`${this.baseUrl}/${periodId}/bank-transfers`);

    return response.data.data;
  }

  async markAsPaid(periodId: number, paymentDate: string, tenantId?: string): Promise<PayrollPeriod> {
    const client = createApiClient(tenantId);

    const response = await client.post<MessageResponse<PayrollPeriod>>(`${this.baseUrl}/${periodId}/mark-as-paid`, {
      payment_date: paymentDate,
    });

    return response.data.data;
  }
}

export const payrollService = new PayrollService();
