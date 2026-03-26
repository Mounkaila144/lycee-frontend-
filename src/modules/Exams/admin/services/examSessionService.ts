import { createApiClient } from '@/shared/lib/api-client';

import type {
  ExamSession,
  CreateExamSessionRequest,
  UpdateExamSessionRequest,
  AssignRoomRequest,
  ExamRoomAssignment,
  ExamSessionFilters,
  PaginatedResponse,
  ScheduleValidation,
  RoomSummary,
} from '../../types';

class ExamSessionService {
  private baseUrl = '/admin/exams';

  async getSessions(
    filters?: ExamSessionFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<ExamSession>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<ExamSession>>(
      `${this.baseUrl}/sessions`,
      { params: filters },
    );

    return response.data;
  }

  async getSession(
    sessionId: number,
    tenantId?: string,
  ): Promise<ExamSession> {
    const client = createApiClient(tenantId);
    const response = await client.get<ExamSession>(
      `${this.baseUrl}/sessions/${sessionId}`,
    );

    return response.data;
  }

  async createSession(
    data: CreateExamSessionRequest,
    tenantId?: string,
  ): Promise<ExamSession> {
    const client = createApiClient(tenantId);
    const response = await client.post<ExamSession>(
      `${this.baseUrl}/sessions`,
      data,
    );

    return response.data;
  }

  async updateSession(
    sessionId: number,
    data: UpdateExamSessionRequest,
    tenantId?: string,
  ): Promise<ExamSession> {
    const client = createApiClient(tenantId);
    const response = await client.put<ExamSession>(
      `${this.baseUrl}/sessions/${sessionId}`,
      data,
    );

    return response.data;
  }

  async deleteSession(
    sessionId: number,
    tenantId?: string,
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(
      `${this.baseUrl}/sessions/${sessionId}`,
    );

    return response.data;
  }

  async publishSession(
    sessionId: number,
    tenantId?: string,
  ): Promise<{ message: string; session: ExamSession }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; session: ExamSession }>(
      `${this.baseUrl}/sessions/${sessionId}/publish`,
    );

    return response.data;
  }

  async cancelSession(
    sessionId: number,
    tenantId?: string,
  ): Promise<{ message: string; session: ExamSession }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; session: ExamSession }>(
      `${this.baseUrl}/sessions/${sessionId}/cancel`,
    );

    return response.data;
  }

  async duplicateSession(
    sessionId: number,
    tenantId?: string,
  ): Promise<ExamSession> {
    const client = createApiClient(tenantId);
    const response = await client.post<ExamSession>(
      `${this.baseUrl}/sessions/${sessionId}/duplicate`,
    );

    return response.data;
  }

  async validateSchedule(
    sessionId: number,
    tenantId?: string,
  ): Promise<ScheduleValidation> {
    const client = createApiClient(tenantId);
    const response = await client.get<ScheduleValidation>(
      `${this.baseUrl}/sessions/${sessionId}/validate-schedule`,
    );

    return response.data;
  }

  async getAvailableRooms(
    sessionId: number,
    tenantId?: string,
  ): Promise<RoomSummary[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<RoomSummary[]>(
      `${this.baseUrl}/sessions/${sessionId}/available-rooms`,
    );

    return response.data;
  }

  async assignRoom(
    sessionId: number,
    data: AssignRoomRequest,
    tenantId?: string,
  ): Promise<ExamRoomAssignment> {
    const client = createApiClient(tenantId);
    const response = await client.post<ExamRoomAssignment>(
      `${this.baseUrl}/sessions/${sessionId}/rooms`,
      data,
    );

    return response.data;
  }

  async removeRoom(
    sessionId: number,
    roomAssignmentId: number,
    tenantId?: string,
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(
      `${this.baseUrl}/sessions/${sessionId}/rooms/${roomAssignmentId}`,
    );

    return response.data;
  }
}

export const examSessionService = new ExamSessionService();
