import { createApiClient } from '@/shared/lib/api-client';

import type {
  FeeType,
  CreateFeeTypeRequest,
  UpdateFeeTypeRequest,
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  GenerateAutomatedInvoicesRequest,
  PaymentSchedule,
  InvoiceFilters,
  InvoiceStatistics,
  PaginatedResponse,
} from '../../types';

class InvoiceService {
  private baseUrl = '/admin/finance';

  // ──── Fee Types ────

  async getFeeTypes(tenantId?: string): Promise<FeeType[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<FeeType[]>(`${this.baseUrl}/fee-types`);

    return response.data;
  }

  async getFeeType(feeTypeId: number, tenantId?: string): Promise<FeeType> {
    const client = createApiClient(tenantId);
    const response = await client.get<FeeType>(`${this.baseUrl}/fee-types/${feeTypeId}`);

    return response.data;
  }

  async createFeeType(data: CreateFeeTypeRequest, tenantId?: string): Promise<FeeType> {
    const client = createApiClient(tenantId);
    const response = await client.post<FeeType>(`${this.baseUrl}/fee-types`, data);

    return response.data;
  }

  async updateFeeType(feeTypeId: number, data: UpdateFeeTypeRequest, tenantId?: string): Promise<FeeType> {
    const client = createApiClient(tenantId);
    const response = await client.put<FeeType>(`${this.baseUrl}/fee-types/${feeTypeId}`, data);

    return response.data;
  }

  async deleteFeeType(feeTypeId: number, tenantId?: string): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(`${this.baseUrl}/fee-types/${feeTypeId}`);

    return response.data;
  }

  // ──── Invoices ────

  async getInvoices(filters?: InvoiceFilters, tenantId?: string): Promise<PaginatedResponse<Invoice>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Invoice>>(
      `${this.baseUrl}/invoices`,
      { params: filters },
    );

    return response.data;
  }

  async getInvoice(invoiceId: number, tenantId?: string): Promise<Invoice> {
    const client = createApiClient(tenantId);
    const response = await client.get<Invoice>(`${this.baseUrl}/invoices/${invoiceId}`);

    return response.data;
  }

  async createInvoice(data: CreateInvoiceRequest, tenantId?: string): Promise<Invoice> {
    const client = createApiClient(tenantId);
    const response = await client.post<Invoice>(`${this.baseUrl}/invoices`, data);

    return response.data;
  }

  async updateInvoice(invoiceId: number, data: UpdateInvoiceRequest, tenantId?: string): Promise<Invoice> {
    const client = createApiClient(tenantId);
    const response = await client.put<Invoice>(`${this.baseUrl}/invoices/${invoiceId}`, data);

    return response.data;
  }

  async deleteInvoice(invoiceId: number, tenantId?: string): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(`${this.baseUrl}/invoices/${invoiceId}`);

    return response.data;
  }

  async generateAutomatedInvoices(
    data: GenerateAutomatedInvoicesRequest,
    tenantId?: string,
  ): Promise<{ message: string; invoices_count: number }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; invoices_count: number }>(
      `${this.baseUrl}/invoices/generate-automated`,
      data,
    );

    return response.data;
  }

  async getPaymentSchedule(invoiceId: number, tenantId?: string): Promise<PaymentSchedule[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaymentSchedule[]>(
      `${this.baseUrl}/invoices/${invoiceId}/payment-schedule`,
    );

    return response.data;
  }

  async applyLateFees(tenantId?: string): Promise<{ message: string; affected_count: number }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; affected_count: number }>(
      `${this.baseUrl}/invoices/late-fees`,
    );

    return response.data;
  }

  async getStatistics(academicYearId?: number, tenantId?: string): Promise<InvoiceStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<InvoiceStatistics>(
      `${this.baseUrl}/invoices/statistics`,
      { params: { academic_year_id: academicYearId } },
    );

    return response.data;
  }
}

export const invoiceService = new InvoiceService();
