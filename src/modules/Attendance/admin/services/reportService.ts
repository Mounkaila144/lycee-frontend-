import { createApiClient } from '@/shared/lib/api-client';

import type {
  AttendanceRates,
  AbsenteeEntry,
  DetailedStatistics,
} from '../../types';

class AttendanceReportService {
  private baseUrl = '/admin/attendance/reports';

  async getAttendanceRates(
    semesterId: number,
    groupId?: number,
    tenantId?: string,
  ): Promise<AttendanceRates> {
    const client = createApiClient(tenantId);
    const response = await client.get<AttendanceRates>(
      `${this.baseUrl}/rates`,
      { params: { semester_id: semesterId, group_id: groupId } },
    );

    return response.data;
  }

  async getAbsenteesList(
    semesterId: number,
    minAbsenceRate?: number,
    tenantId?: string,
  ): Promise<AbsenteeEntry[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<AbsenteeEntry[]>(
      `${this.baseUrl}/absentees`,
      { params: { semester_id: semesterId, min_absence_rate: minAbsenceRate } },
    );

    return response.data;
  }

  async getDetailedStatistics(
    semesterId: number,
    tenantId?: string,
  ): Promise<DetailedStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<DetailedStatistics>(
      `${this.baseUrl}/statistics`,
      { params: { semester_id: semesterId } },
    );

    return response.data;
  }

  async exportData(
    semesterId: number,
    type: 'students' | 'modules',
    tenantId?: string,
  ): Promise<{ data: unknown[]; export_type: string }> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: unknown[]; export_type: string }>(
      `${this.baseUrl}/export`,
      { params: { semester_id: semesterId, type } },
    );

    return response.data;
  }
}

export const reportService = new AttendanceReportService();
