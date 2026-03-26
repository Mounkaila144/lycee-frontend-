import { createApiClient } from '@/shared/lib/api-client';

import type {
  ExamStatistics,
  AttendanceReport,
  IncidentReport,
  SupervisorWorkload,
  RoomUtilization,
} from '../../types';

class ExamReportService {
  private baseUrl = '/admin/exams/reports';

  async getStatistics(
    academicYearId: number,
    evaluationPeriodId?: number,
    tenantId?: string,
  ): Promise<ExamStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<ExamStatistics>(
      `${this.baseUrl}/statistics`,
      { params: { academic_year_id: academicYearId, evaluation_period_id: evaluationPeriodId } },
    );

    return response.data;
  }

  async getAttendanceReport(
    sessionId: number,
    tenantId?: string,
  ): Promise<AttendanceReport> {
    const client = createApiClient(tenantId);
    const response = await client.get<AttendanceReport>(
      `${this.baseUrl}/attendance/${sessionId}`,
    );

    return response.data;
  }

  async getIncidentReport(
    academicYearId: number,
    tenantId?: string,
  ): Promise<IncidentReport> {
    const client = createApiClient(tenantId);
    const response = await client.get<IncidentReport>(
      `${this.baseUrl}/incidents`,
      { params: { academic_year_id: academicYearId } },
    );

    return response.data;
  }

  async getSupervisorWorkload(
    academicYearId: number,
    tenantId?: string,
  ): Promise<SupervisorWorkload[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<SupervisorWorkload[]>(
      `${this.baseUrl}/supervisor-workload`,
      { params: { academic_year_id: academicYearId } },
    );

    return response.data;
  }

  async getRoomUtilization(
    academicYearId: number,
    tenantId?: string,
  ): Promise<RoomUtilization[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<RoomUtilization[]>(
      `${this.baseUrl}/room-utilization`,
      { params: { academic_year_id: academicYearId } },
    );

    return response.data;
  }
}

export const examReportService = new ExamReportService();
