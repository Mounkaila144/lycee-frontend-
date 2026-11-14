import { createApiClient } from '@/shared/lib/api-client';

import type {
  AlertFilters,
  AttendanceAlert,
  AttendanceRates,
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

  /** Recalcule les alertes de tous les élèves (Administrator / Manager uniquement). */
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

  /** Alertes du semestre (actives par défaut), restreintes aux classes du professeur côté API. */
  async getAlerts(filters: AlertFilters, tenantId?: string): Promise<AttendanceAlert[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<AttendanceAlert[]>(`${this.baseUrl}/alerts`, { params: filters });

    return response.data;
  }

  async acknowledgeAlert(
    alertId: number,
    tenantId?: string,
  ): Promise<{ message: string; alert: AttendanceAlert }> {
    const client = createApiClient(tenantId);

    const response = await client.post<{ message: string; alert: AttendanceAlert }>(
      `${this.baseUrl}/alerts/${alertId}/acknowledge`,
    );

    return response.data;
  }

  /** `studentId` = compte utilisateur de l'élève (users.id). */
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
  ): Promise<AttendanceRates> {
    const client = createApiClient(tenantId);

    const response = await client.get<AttendanceRates>(
      `${this.baseUrl}/students/${studentId}/stats`,
      { params: { semester_id: semesterId } },
    );

    return response.data;
  }
}

export const monitoringService = new MonitoringService();
