import { createApiClient } from '@/shared/lib/api-client';

import type {
  FeeType,
  FeeTypeListParams,
  BulkBillingTargets,
  BulkBillingRequest,
  BulkBillingPreview,
  BulkBillingResult,
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

  /** Réponse brute `{ data: FeeType[] }` (forme renvoyée par l'API). */
  async getFeeTypes(tenantId?: string): Promise<{ data: FeeType[] }> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: FeeType[] }>(`${this.baseUrl}/fee-types`);

    return response.data;
  }

  /** Liste des types de frais (tableau) — `include_inactive` pour inclure les désactivés. */
  async listFeeTypes(params?: FeeTypeListParams, tenantId?: string): Promise<FeeType[]> {
    const client = createApiClient(tenantId);

    const response = await client.get<{ data: FeeType[] }>(`${this.baseUrl}/fee-types`, {
      params: {
        ...(params?.include_inactive ? { include_inactive: 1 } : {}),
        ...(params?.academic_year_id ? { academic_year_id: params.academic_year_id } : {}),
        ...(params?.category ? { category: params.category } : {}),
      },
    });

    return response.data.data ?? [];
  }

  async setFeeTypeStatus(feeTypeId: number, isActive: boolean, tenantId?: string): Promise<FeeType> {
    const client = createApiClient(tenantId);

    const response = await client.patch<{ message: string; data: FeeType }>(
      `${this.baseUrl}/fee-types/${feeTypeId}/status`,
      { is_active: isActive },
    );

    return response.data.data;
  }

  // ──── Facturation en masse ────

  async getBulkBillingTargets(academicYearId?: number, tenantId?: string): Promise<BulkBillingTargets> {
    const client = createApiClient(tenantId);

    const response = await client.get<{ data: BulkBillingTargets }>(`${this.baseUrl}/bulk-billing/targets`, {
      params: academicYearId ? { academic_year_id: academicYearId } : {},
    });

    return response.data.data;
  }

  async previewBulkBilling(data: BulkBillingRequest, tenantId?: string): Promise<BulkBillingPreview> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ data: BulkBillingPreview }>(`${this.baseUrl}/bulk-billing/preview`, data);

    return response.data.data;
  }

  async generateBulkBilling(data: BulkBillingRequest, tenantId?: string): Promise<BulkBillingResult> {
    const client = createApiClient(tenantId);

    const response = await client.post<{ message: string; data: BulkBillingResult }>(
      `${this.baseUrl}/bulk-billing/generate`,
      data,
    );

    return response.data.data;
  }

  async getFeeType(feeTypeId: number, tenantId?: string): Promise<FeeType> {
    const client = createApiClient(tenantId);
    const response = await client.get<FeeType>(`${this.baseUrl}/fee-types/${feeTypeId}`);

    return response.data;
  }

  async createFeeType(data: CreateFeeTypeRequest, tenantId?: string): Promise<FeeType> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; data: FeeType }>(`${this.baseUrl}/fee-types`, data);

    return response.data.data;
  }

  async updateFeeType(feeTypeId: number, data: UpdateFeeTypeRequest, tenantId?: string): Promise<FeeType> {
    const client = createApiClient(tenantId);
    const response = await client.put<{ message: string; data: FeeType }>(`${this.baseUrl}/fee-types/${feeTypeId}`, data);

    return response.data.data;
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
