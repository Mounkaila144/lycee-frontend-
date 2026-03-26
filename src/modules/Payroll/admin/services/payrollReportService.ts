import { createApiClient } from '@/shared/lib/api-client';

import type {
  PayrollDashboardStats,
  PayrollJournalEntry,
  SocialChargesReport,
  SalaryStatistics,
} from '../../types';

class PayrollReportService {
  private baseUrl = '/admin/payroll/reports';

  async getDashboardStats(
    tenantId?: string,
  ): Promise<PayrollDashboardStats> {
    const client = createApiClient(tenantId);
    const response = await client.get<PayrollDashboardStats>(
      `${this.baseUrl}/dashboard`,
    );

    return response.data;
  }

  async getPayrollJournal(
    periodId: number,
    tenantId?: string,
  ): Promise<PayrollJournalEntry[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<PayrollJournalEntry[]>(
      `${this.baseUrl}/payroll-journal`,
      { params: { period_id: periodId } },
    );

    return response.data;
  }

  async getSocialCharges(
    year: number,
    tenantId?: string,
  ): Promise<SocialChargesReport[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<SocialChargesReport[]>(
      `${this.baseUrl}/social-charges`,
      { params: { year } },
    );

    return response.data;
  }

  async getSalaryStatistics(
    tenantId?: string,
  ): Promise<SalaryStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<SalaryStatistics>(
      `${this.baseUrl}/salary-statistics`,
    );

    return response.data;
  }
}

export const payrollReportService = new PayrollReportService();
