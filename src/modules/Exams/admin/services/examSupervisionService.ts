import { createApiClient } from '@/shared/lib/api-client';

import type {
  ExamSupervisor,
  ExamAttendanceSheet,
  ExamIncident,
  AssignSupervisorRequest,
  MarkAttendanceRequest,
  ReportIncidentRequest,
  IncidentFilters,
} from '../../types';

class ExamSupervisionService {
  private baseUrl = '/admin/exams';

  async assignSupervisor(
    sessionId: number,
    data: AssignSupervisorRequest,
    tenantId?: string,
  ): Promise<ExamSupervisor> {
    const client = createApiClient(tenantId);
    const response = await client.post<ExamSupervisor>(
      `${this.baseUrl}/sessions/${sessionId}/supervisors`,
      data,
    );

    return response.data;
  }

  async removeSupervisor(
    sessionId: number,
    supervisorId: number,
    tenantId?: string,
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(
      `${this.baseUrl}/sessions/${sessionId}/supervisors/${supervisorId}`,
    );

    return response.data;
  }

  async markSupervisorPresent(
    sessionId: number,
    supervisorId: number,
    tenantId?: string,
  ): Promise<{ message: string; supervisor: ExamSupervisor }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; supervisor: ExamSupervisor }>(
      `${this.baseUrl}/sessions/${sessionId}/supervisors/${supervisorId}/mark-present`,
    );

    return response.data;
  }

  async replaceSupervisor(
    sessionId: number,
    supervisorId: number,
    data: { replacement_teacher_id: number },
    tenantId?: string,
  ): Promise<{ message: string; supervisor: ExamSupervisor }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; supervisor: ExamSupervisor }>(
      `${this.baseUrl}/sessions/${sessionId}/supervisors/${supervisorId}/replace`,
      data,
    );

    return response.data;
  }

  async getAttendanceSheet(
    sessionId: number,
    tenantId?: string,
  ): Promise<ExamAttendanceSheet[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ExamAttendanceSheet[]>(
      `${this.baseUrl}/sessions/${sessionId}/attendance`,
    );

    return response.data;
  }

  async markStudentAttendance(
    sessionId: number,
    data: MarkAttendanceRequest,
    tenantId?: string,
  ): Promise<ExamAttendanceSheet> {
    const client = createApiClient(tenantId);
    const response = await client.post<ExamAttendanceSheet>(
      `${this.baseUrl}/sessions/${sessionId}/attendance`,
      data,
    );

    return response.data;
  }

  async getIncidents(
    sessionId: number,
    filters?: IncidentFilters,
    tenantId?: string,
  ): Promise<ExamIncident[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ExamIncident[]>(
      `${this.baseUrl}/sessions/${sessionId}/incidents`,
      { params: filters },
    );

    return response.data;
  }

  async reportIncident(
    sessionId: number,
    data: ReportIncidentRequest,
    tenantId?: string,
  ): Promise<ExamIncident> {
    const client = createApiClient(tenantId);
    const formData = new FormData();
    if (data.student_id) {
      formData.append('student_id', String(data.student_id));
    }
    formData.append('type', data.type);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('severity', data.severity);
    formData.append('occurred_at_time', data.occurred_at_time);
    if (data.witnesses) {
      formData.append('witnesses', data.witnesses);
    }
    if (data.evidence) {
      formData.append('evidence', data.evidence);
    }

    const response = await client.post<ExamIncident>(
      `${this.baseUrl}/sessions/${sessionId}/incidents`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return response.data;
  }

  async updateIncidentStatus(
    sessionId: number,
    incidentId: number,
    data: { status: string; action_taken?: string },
    tenantId?: string,
  ): Promise<ExamIncident> {
    const client = createApiClient(tenantId);
    const response = await client.put<ExamIncident>(
      `${this.baseUrl}/sessions/${sessionId}/incidents/${incidentId}`,
      data,
    );

    return response.data;
  }
}

export const examSupervisionService = new ExamSupervisionService();
