import { createApiClient } from '@/shared/lib/api-client';

import type {
  ExamAttendanceSheet,
  AssignStudentsRequest,
  StudentSummary,
  PreparationChecklist,
} from '../../types';

class ExamManagementService {
  private baseUrl = '/admin/exams';

  async getMaterials(
    sessionId: number,
    tenantId?: string,
  ): Promise<{ allowed_materials: string; instructions: string }> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ allowed_materials: string; instructions: string }>(
      `${this.baseUrl}/sessions/${sessionId}/materials`,
    );

    return response.data;
  }

  async updateMaterials(
    sessionId: number,
    data: { allowed_materials: string; instructions: string },
    tenantId?: string,
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.put<{ message: string }>(
      `${this.baseUrl}/sessions/${sessionId}/materials`,
      data,
    );

    return response.data;
  }

  async updateInstructions(
    sessionId: number,
    data: { instructions: string },
    tenantId?: string,
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.put<{ message: string }>(
      `${this.baseUrl}/sessions/${sessionId}/instructions`,
      data,
    );

    return response.data;
  }

  async assignStudents(
    sessionId: number,
    data: AssignStudentsRequest,
    tenantId?: string,
  ): Promise<{ message: string; assigned: number }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; assigned: number }>(
      `${this.baseUrl}/sessions/${sessionId}/assign-students`,
      data,
    );

    return response.data;
  }

  async autoAssignStudents(
    sessionId: number,
    tenantId?: string,
  ): Promise<{ message: string; assigned: number }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; assigned: number }>(
      `${this.baseUrl}/sessions/${sessionId}/auto-assign`,
    );

    return response.data;
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

  async getAssignedStudents(
    sessionId: number,
    tenantId?: string,
  ): Promise<ExamAttendanceSheet[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ExamAttendanceSheet[]>(
      `${this.baseUrl}/sessions/${sessionId}/students`,
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
