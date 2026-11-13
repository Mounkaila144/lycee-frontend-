import { createApiClient } from '@/shared/lib/api-client';

import type {
  MessageResponse,
  PayrollDashboard,
  PayrollJournal,
  SalaryStatistics,
  SocialChargesReport,
} from '../../types';

/**
 * Rapports RH (Epic 5).
 */
class PayrollReportService {
  private baseUrl = '/admin/payroll/reports';

  async getDashboard(params?: { year?: number; month?: number }, tenantId?: string): Promise<PayrollDashboard> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: PayrollDashboard }>(`${this.baseUrl}/dashboard`, { params });

    return response.data.data;
  }

  async getPayrollJournal(periodId: number, tenantId?: string): Promise<PayrollJournal> {
    const client = createApiClient(tenantId);
    const response = await client.get<MessageResponse<PayrollJournal>>(`${this.baseUrl}/payroll-journal/${periodId}`);

    return response.data.data;
  }

  async getSocialCharges(periodId: number, tenantId?: string): Promise<SocialChargesReport> {
    const client = createApiClient(tenantId);

    const response = await client.get<MessageResponse<SocialChargesReport>>(
      `${this.baseUrl}/social-charges/${periodId}`,
    );

    return response.data.data;
  }

  async getSalaryStatistics(params?: { year?: number; month?: number }, tenantId?: string): Promise<SalaryStatistics> {
    const client = createApiClient(tenantId);

    const response = await client.get<MessageResponse<SalaryStatistics>>(`${this.baseUrl}/salary-statistics`, {
      params,
    });

    return response.data.data;
  }
}

export const payrollReportService = new PayrollReportService();
