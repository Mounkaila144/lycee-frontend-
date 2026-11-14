import { createApiClient } from '@/shared/lib/api-client';

import type {
  ExamSupervisor,
  ExamAttendanceSheet,
  ExamIncident,
  AssignSupervisorRequest,
  MarkAttendanceRequest,
  ReportIncidentRequest,
  AttendanceStatistics,
  IncidentsSummary,
} from '../../types';

/**
 * Backend : Modules/Exams/Routes/admin.php — préfixe /admin/exams/supervision
 */
class ExamSupervisionService {
  private baseUrl = '/admin/exams/supervision';

  async assignSupervisors(
    sessionId: number,
    supervisors: AssignSupervisorRequest[],
    tenantId?: string,
  ): Promise<ExamSupervisor[]> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamSupervisor[]>(
      `${this.baseUrl}/sessions/${sessionId}/supervisors`,
      { supervisors },
    );

    return response.data;
  }

  async markSupervisorPresent(
    supervisorId: number,
    tenantId?: string,
  ): Promise<ExamSupervisor> {
    const client = createApiClient(tenantId);

    const response = await client.put<ExamSupervisor>(
      `${this.baseUrl}/supervisors/${supervisorId}/present`,
    );

    return response.data;
  }

  async replaceSupervisor(
    supervisorId: number,
    data: { replacement_teacher_id: number },
    tenantId?: string,
  ): Promise<ExamSupervisor> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamSupervisor>(
      `${this.baseUrl}/supervisors/${supervisorId}/replace`,
      data,
    );

    return response.data;
  }

  async getTeacherSchedule(
    teacherId: number,
    params?: { start_date?: string; end_date?: string },
    tenantId?: string,
  ): Promise<ExamSupervisor[]> {
    const client = createApiClient(tenantId);

    const response = await client.get<ExamSupervisor[]>(
      `${this.baseUrl}/teachers/${teacherId}/schedule`,
      { params },
    );

    return response.data;
  }

  async markStudentAttendance(
    sheetId: number,
    data: MarkAttendanceRequest,
    tenantId?: string,
  ): Promise<ExamAttendanceSheet> {
    const client = createApiClient(tenantId);

    const response = await client.put<ExamAttendanceSheet>(
      `${this.baseUrl}/attendance-sheets/${sheetId}/status`,
      data,
    );

    return response.data;
  }

  async recordSubmission(sheetId: number, tenantId?: string): Promise<ExamAttendanceSheet> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamAttendanceSheet>(
      `${this.baseUrl}/attendance-sheets/${sheetId}/submit`,
    );

    return response.data;
  }

  async verifySheet(sheetId: number, tenantId?: string): Promise<ExamAttendanceSheet> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamAttendanceSheet>(
      `${this.baseUrl}/attendance-sheets/${sheetId}/verify`,
    );

    return response.data;
  }

  async getAttendanceStats(sessionId: number, tenantId?: string): Promise<AttendanceStatistics> {
    const client = createApiClient(tenantId);

    const response = await client.get<AttendanceStatistics>(
      `${this.baseUrl}/sessions/${sessionId}/attendance-stats`,
    );

    return response.data;
  }

  async getIncidents(sessionId: number, tenantId?: string): Promise<ExamIncident[]> {
    const client = createApiClient(tenantId);

    const response = await client.get<ExamIncident[]>(
      `${this.baseUrl}/sessions/${sessionId}/incidents`,
    );

    return response.data;
  }

  async getIncidentsSummary(sessionId: number, tenantId?: string): Promise<IncidentsSummary> {
    const client = createApiClient(tenantId);

    const response = await client.get<IncidentsSummary>(
      `${this.baseUrl}/sessions/${sessionId}/incidents/summary`,
    );

    return response.data;
  }

  async reportIncident(
    sessionId: number,
    data: ReportIncidentRequest,
    tenantId?: string,
  ): Promise<ExamIncident> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamIncident>(`${this.baseUrl}/incidents`, {
      ...data,
      exam_session_id: sessionId,
    });

    return response.data;
  }

  async updateIncidentStatus(
    incidentId: number,
    data: { status: string; resolution_notes?: string },
    tenantId?: string,
  ): Promise<ExamIncident> {
    const client = createApiClient(tenantId);

    const response = await client.put<ExamIncident>(
      `${this.baseUrl}/incidents/${incidentId}/status`,
      data,
    );

    return response.data;
  }

  async escalateIncident(
    incidentId: number,
    data: { reason: string },
    tenantId?: string,
  ): Promise<ExamIncident> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamIncident>(
      `${this.baseUrl}/incidents/${incidentId}/escalate`,
      data,
    );

    return response.data;
  }
}

export const examSupervisionService = new ExamSupervisionService();
