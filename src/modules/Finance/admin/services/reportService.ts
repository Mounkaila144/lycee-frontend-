import { createApiClient } from '@/shared/lib/api-client';

import type {
  FinanceDashboardData,
  PaymentJournalEntry,
  AgingBalance,
  UnpaidStatement,
  CashFlowForecast,
  CollectionStatistics,
  AccountingExport,
  PaginatedResponse,
} from '../../types';

class ReportService {
  private baseUrl = '/admin/finance/reports';

  async getDashboard(academicYearId?: number, tenantId?: string): Promise<FinanceDashboardData> {
    const client = createApiClient(tenantId);
    const response = await client.get<FinanceDashboardData>(
      `${this.baseUrl}/dashboard`,
      { params: { academic_year_id: academicYearId } },
    );

    return response.data;
  }

  async getPaymentJournal(
    params?: { date_from?: string; date_to?: string; page?: number; per_page?: number },
    tenantId?: string,
  ): Promise<PaginatedResponse<PaymentJournalEntry>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<PaymentJournalEntry>>(
      `${this.baseUrl}/payment-journal`,
      { params },
    );

    return response.data;
  }

  async getAgingBalance(academicYearId?: number, tenantId?: string): Promise<AgingBalance[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<AgingBalance[]>(
      `${this.baseUrl}/aging-balance`,
      { params: { academic_year_id: academicYearId } },
    );

    return response.data;
  }

  async getUnpaidStatements(academicYearId?: number, tenantId?: string): Promise<UnpaidStatement[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<UnpaidStatement[]>(
      `${this.baseUrl}/unpaid-statements`,
      { params: { academic_year_id: academicYearId } },
    );

    return response.data;
  }

  async getCashFlowForecast(tenantId?: string): Promise<CashFlowForecast[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<CashFlowForecast[]>(`${this.baseUrl}/cash-flow-forecast`);

    return response.data;
  }

  async getCollectionStatistics(academicYearId?: number, tenantId?: string): Promise<CollectionStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<CollectionStatistics>(
      `${this.baseUrl}/collection-statistics`,
      { params: { academic_year_id: academicYearId } },
    );

    return response.data;
  }

  async exportAccounting(data: AccountingExport, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.post<Blob>(
      `${this.baseUrl}/accounting-export`,
      data,
      { responseType: 'blob' },
    );

    return response.data;
  }
}

export const reportService = new ReportService();
