import { createApiClient } from '@/shared/lib/api-client';

import type {
  AttendanceAlert,
  StudentHistory,
} from '../../types';

class MonitoringService {
  private baseUrl = '/admin/attendance/monitoring';

  async checkThresholds(
    studentId: number,
    semesterId: number,
    tenantId?: string,
  ): Promise<{ alert_created: boolean; alert: AttendanceAlert | null }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ alert_created: boolean; alert: AttendanceAlert | null }>(
      `${this.baseUrl}/check-thresholds`,
      { student_id: studentId, semester_id: semesterId },
    );

    return response.data;
  }

  async triggerAlerts(
    semesterId: number,
    tenantId?: string,
  ): Promise<{ message: string; alerts: AttendanceAlert[] }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; alerts: AttendanceAlert[] }>(
      `${this.baseUrl}/trigger-alerts`,
      { semester_id: semesterId },
    );

    return response.data;
  }

  async getActiveAlerts(
    semesterId: number,
    tenantId?: string,
  ): Promise<AttendanceAlert[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<AttendanceAlert[]>(
      `${this.baseUrl}/alerts`,
      { params: { semester_id: semesterId } },
    );

    return response.data;
  }

  async getStudentHistory(
    studentId: number,
    semesterId: number,
    tenantId?: string,
  ): Promise<StudentHistory> {
    const client = createApiClient(tenantId);
    const response = await client.get<StudentHistory>(
      `${this.baseUrl}/students/${studentId}/history`,
      { params: { semester_id: semesterId } },
    );

    return response.data;
  }

  async getStudentStats(
    studentId: number,
    semesterId: number,
    tenantId?: string,
  ): Promise<Record<string, number>> {
    const client = createApiClient(tenantId);
    const response = await client.get<Record<string, number>>(
      `${this.baseUrl}/students/${studentId}/stats`,
      { params: { semester_id: semesterId } },
    );

    return response.data;
  }
}

export const monitoringService = new MonitoringService();
