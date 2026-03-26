import { createApiClient } from '@/shared/lib/api-client';

import type {
  Payment,
  RecordPaymentRequest,
  Refund,
  CreateRefundRequest,
  Discount,
  CreateDiscountRequest,
  PaymentFilters,
  PaginatedResponse,
  DailySummary,
  ReconciliationReport,
} from '../../types';

class PaymentService {
  private baseUrl = '/admin/finance';

  // ──── Payments ────

  async getPayments(filters?: PaymentFilters, tenantId?: string): Promise<PaginatedResponse<Payment>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Payment>>(
      `${this.baseUrl}/payments`,
      { params: filters },
    );

    return response.data;
  }

  async getPayment(paymentId: number, tenantId?: string): Promise<Payment> {
    const client = createApiClient(tenantId);
    const response = await client.get<Payment>(`${this.baseUrl}/payments/${paymentId}`);

    return response.data;
  }

  async recordPayment(data: RecordPaymentRequest, tenantId?: string): Promise<Payment> {
    const client = createApiClient(tenantId);
    const response = await client.post<Payment>(`${this.baseUrl}/payments`, data);

    return response.data;
  }

  async recordPartialPayment(data: RecordPaymentRequest, tenantId?: string): Promise<Payment> {
    const client = createApiClient(tenantId);
    const response = await client.post<Payment>(`${this.baseUrl}/payments/partial`, data);

    return response.data;
  }

  async getReceipt(paymentId: number, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.baseUrl}/payments/${paymentId}/receipt`,
      { responseType: 'blob' },
    );

    return response.data;
  }

  // ──── Refunds ────

  async createRefund(data: CreateRefundRequest, tenantId?: string): Promise<Refund> {
    const client = createApiClient(tenantId);
    const response = await client.post<Refund>(`${this.baseUrl}/payments/refund`, data);

    return response.data;
  }

  async getRefunds(tenantId?: string): Promise<Refund[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<Refund[]>(`${this.baseUrl}/payments/refunds`);

    return response.data;
  }

  // ──── Reconciliation ────

  async getReconciliation(date: string, tenantId?: string): Promise<ReconciliationReport> {
    const client = createApiClient(tenantId);
    const response = await client.get<ReconciliationReport>(
      `${this.baseUrl}/payments/reconciliation`,
      { params: { date } },
    );

    return response.data;
  }

  // ──── Daily Summary ────

  async getDailySummary(date: string, tenantId?: string): Promise<DailySummary> {
    const client = createApiClient(tenantId);
    const response = await client.get<DailySummary>(
      `${this.baseUrl}/payments/daily-summary`,
      { params: { date } },
    );

    return response.data;
  }

  // ──── Discounts ────

  async getDiscounts(tenantId?: string): Promise<Discount[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<Discount[]>(`${this.baseUrl}/discounts`);

    return response.data;
  }

  async createDiscount(data: CreateDiscountRequest, tenantId?: string): Promise<Discount> {
    const client = createApiClient(tenantId);
    const response = await client.post<Discount>(`${this.baseUrl}/discounts`, data);

    return response.data;
  }

  async deleteDiscount(discountId: number, tenantId?: string): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(`${this.baseUrl}/discounts/${discountId}`);

    return response.data;
  }
}

export const paymentService = new PaymentService();
