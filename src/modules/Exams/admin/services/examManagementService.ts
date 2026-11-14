import { createApiClient } from '@/shared/lib/api-client';

import type {
  ExamSession,
  ExamAttendanceSheet,
  AssignStudentsRequest,
  StudentSummary,
  PreparationChecklist,
} from '../../types';

/**
 * Backend : Modules/Exams/Routes/admin.php — préfixe /admin/exams/management
 */
class ExamManagementService {
  private baseUrl = '/admin/exams/management';

  async updateMaterials(
    sessionId: number,
    data: { materials: string[] },
    tenantId?: string,
  ): Promise<ExamSession> {
    const client = createApiClient(tenantId);

    const response = await client.put<ExamSession>(
      `${this.baseUrl}/sessions/${sessionId}/materials`,
      data,
    );

    return response.data;
  }

  async updateInstructions(
    sessionId: number,
    data: { instructions: string },
    tenantId?: string,
  ): Promise<ExamSession> {
    const client = createApiClient(tenantId);

    const response = await client.put<ExamSession>(
      `${this.baseUrl}/sessions/${sessionId}/instructions`,
      data,
    );

    return response.data;
  }

  async assignStudents(
    sessionId: number,
    data: AssignStudentsRequest,
    tenantId?: string,
  ): Promise<ExamAttendanceSheet[]> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamAttendanceSheet[]>(
      `${this.baseUrl}/sessions/${sessionId}/students/assign`,
      data,
    );

    return response.data;
  }

  async autoAssignStudents(
    sessionId: number,
    tenantId?: string,
  ): Promise<ExamAttendanceSheet[]> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamAttendanceSheet[]>(
      `${this.baseUrl}/sessions/${sessionId}/students/auto-assign`,
    );

    return response.data;
  }

  async reassignStudent(
    sheetId: number,
    data: { room_assignment_id: number; seat_number?: string },
    tenantId?: string,
  ): Promise<ExamAttendanceSheet> {
    const client = createApiClient(tenantId);

    const response = await client.put<ExamAttendanceSheet>(
      `${this.baseUrl}/attendance-sheets/${sheetId}/reassign`,
      data,
    );

    return response.data;
  }

  async removeStudent(sheetId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);

    await client.delete(`${this.baseUrl}/attendance-sheets/${sheetId}`);
  }

  async getEligibleStudents(
    sessionId: number,
    tenantId?: string,
  ): Promise<StudentSummary[]> {
    const client = createApiClient(tenantId);

    const response = await client.get<StudentSummary[]>(
      `${this.baseUrl}/sessions/${sessionId}/eligible-students`,
    );

    return response.data;
  }

  async getPreparationChecklist(
    sessionId: number,
    tenantId?: string,
  ): Promise<PreparationChecklist> {
    const client = createApiClient(tenantId);

    const response = await client.get<PreparationChecklist>(
      `${this.baseUrl}/sessions/${sessionId}/preparation-checklist`,
    );

    return response.data;
  }
}

export const examManagementService = new ExamManagementService();
