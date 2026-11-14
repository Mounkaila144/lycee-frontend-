import { createApiClient } from '@/shared/lib/api-client';

import type {
  ExamStatistics,
  AttendanceReport,
  IncidentReport,
  SupervisorWorkload,
  RoomUtilization,
  ExamReportPeriodFilters,
  ExamStatisticsFilters,
} from '../../types';

/**
 * Backend : Modules/Exams/Routes/admin.php — préfixe /admin/exams/reports
 */
class ExamReportService {
  private baseUrl = '/admin/exams/reports';

  async getStatistics(
    filters?: ExamStatisticsFilters,
    tenantId?: string,
  ): Promise<ExamStatistics> {
    const client = createApiClient(tenantId);

    const response = await client.get<ExamStatistics>(`${this.baseUrl}/statistics`, {
      params: filters,
    });

    return response.data;
  }

  async getAttendanceReport(sessionId: number, tenantId?: string): Promise<AttendanceReport> {
    const client = createApiClient(tenantId);

    const response = await client.get<AttendanceReport>(
      `${this.baseUrl}/sessions/${sessionId}/attendance`,
    );

    return response.data;
  }

  async getIncidentReport(sessionId: number, tenantId?: string): Promise<IncidentReport> {
    const client = createApiClient(tenantId);

    const response = await client.get<IncidentReport>(
      `${this.baseUrl}/sessions/${sessionId}/incidents`,
    );

    return response.data;
  }

  async getSupervisorWorkload(
    filters?: ExamReportPeriodFilters,
    tenantId?: string,
  ): Promise<SupervisorWorkload[]> {
    const client = createApiClient(tenantId);

    const response = await client.get<SupervisorWorkload[]>(
      `${this.baseUrl}/supervisor-workload`,
      { params: filters },
    );

    return response.data;
  }

  async getRoomUtilization(
    filters?: ExamReportPeriodFilters,
    tenantId?: string,
  ): Promise<RoomUtilization[]> {
    const client = createApiClient(tenantId);

    const response = await client.get<RoomUtilization[]>(
      `${this.baseUrl}/room-utilization`,
      { params: filters },
    );

    return response.data;
  }
}

export const examReportService = new ExamReportService();
