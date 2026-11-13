import { createApiClient } from '@/shared/lib/api-client';

import type {
  FinanceDashboardData,
  PaymentJournal,
  AgingBalance,
  UnpaidStatementsReport,
  CashFlowForecast,
  AccountingExport,
  AccountingExportParams,
} from '../../types';

/**
 * Rapports financiers — GET /admin/finance/reports/*.
 *
 * Le backend enveloppe toutes les réponses dans `{ data: ... }` :
 * chaque méthode renvoie directement le contenu de `data`.
 */
class ReportService {
  private baseUrl = '/admin/finance/reports';

  async getDashboard(academicYearId?: number, tenantId?: string): Promise<FinanceDashboardData> {
    const client = createApiClient(tenantId);

    const response = await client.get<{ data: FinanceDashboardData }>(`${this.baseUrl}/dashboard`, {
      params: { academic_year_id: academicYearId },
    });

    return response.data.data;
  }

  async getPaymentJournal(
    params: { start_date: string; end_date: string; payment_method?: string },
    tenantId?: string,
  ): Promise<PaymentJournal> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: PaymentJournal }>(`${this.baseUrl}/payment-journal`, { params });

    return response.data.data;
  }

  async getAgingBalance(tenantId?: string): Promise<AgingBalance> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: AgingBalance }>(`${this.baseUrl}/aging-balance`);

    return response.data.data;
  }

  async getUnpaidStatements(studentId?: number, tenantId?: string): Promise<UnpaidStatementsReport> {
    const client = createApiClient(tenantId);

    const response = await client.get<{ data: UnpaidStatementsReport }>(`${this.baseUrl}/unpaid-statements`, {
      params: { student_id: studentId },
    });

    return response.data.data;
  }

  async getCashFlowForecast(months = 6, tenantId?: string): Promise<CashFlowForecast> {
    const client = createApiClient(tenantId);

    const response = await client.get<{ data: CashFlowForecast }>(`${this.baseUrl}/cash-flow-forecast`, {
      params: { months },
    });

    return response.data.data;
  }

  async exportAccounting(params: AccountingExportParams, tenantId?: string): Promise<AccountingExport> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: AccountingExport }>(`${this.baseUrl}/accounting-export`, { params });

    return response.data.data;
  }
}

export const reportService = new ReportService();
