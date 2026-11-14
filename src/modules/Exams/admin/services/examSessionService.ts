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
  ValidateScheduleRequest,
  ExamOptions,
  CreateEvaluationsRequest,
  CreateEvaluationsResponse,
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

  /** Référentiels du formulaire (classes, niveaux, matières, semestres, salles, professeurs). */
  async getOptions(
    params?: { academic_year_id?: number },
    tenantId?: string,
  ): Promise<ExamOptions> {
    const client = createApiClient(tenantId);

    const response = await client.get<{ data: ExamOptions }>(
      `${this.baseUrl}/sessions/options`,
      { params },
    );

    return response.data.data;
  }

  /** Démarrer (ongoing) ou terminer (completed) une session publiée. */
  async changeStatus(
    sessionId: number,
    status: 'ongoing' | 'completed',
    tenantId?: string,
  ): Promise<ExamSession> {
    const client = createApiClient(tenantId);

    const response = await client.put<ExamSession>(
      `${this.baseUrl}/sessions/${sessionId}/status`,
      { status },
    );

    return response.data;
  }

  /** Crée les compositions (notes lycée, brouillon) d'une session terminée. */
  async createEvaluations(
    sessionId: number,
    data: CreateEvaluationsRequest,
    tenantId?: string,
  ): Promise<CreateEvaluationsResponse> {
    const client = createApiClient(tenantId);

    const response = await client.post<CreateEvaluationsResponse>(
      `${this.baseUrl}/sessions/${sessionId}/create-evaluations`,
      data,
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
  ): Promise<void> {
    const client = createApiClient(tenantId);

    await client.delete(`${this.baseUrl}/sessions/${sessionId}`);
  }

  async publishSession(
    sessionId: number,
    tenantId?: string,
  ): Promise<ExamSession> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamSession>(
      `${this.baseUrl}/sessions/${sessionId}/publish`,
    );

    return response.data;
  }

  async cancelSession(
    sessionId: number,
    reason?: string,
    tenantId?: string,
  ): Promise<ExamSession> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamSession>(
      `${this.baseUrl}/sessions/${sessionId}/cancel`,
      { reason },
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
    data: ValidateScheduleRequest,
    tenantId?: string,
  ): Promise<ScheduleValidation> {
    const client = createApiClient(tenantId);

    const response = await client.post<ScheduleValidation>(
      `${this.baseUrl}/sessions/validate-schedule`,
      data,
    );

    return response.data;
  }

  async getAvailableRooms(
    params: { date: string; start_time: string; end_time: string },
    tenantId?: string,
  ): Promise<RoomSummary[]> {
    const client = createApiClient(tenantId);

    const response = await client.get<RoomSummary[]>(
      `${this.baseUrl}/sessions/available-rooms`,
      { params },
    );

    return response.data;
  }

  async assignRoom(
    sessionId: number,
    data: AssignRoomRequest,
    tenantId?: string,
  ): Promise<ExamRoomAssignment[]> {
    const client = createApiClient(tenantId);

    const response = await client.post<ExamRoomAssignment[]>(
      `${this.baseUrl}/sessions/${sessionId}/rooms`,
      data,
    );

    return response.data;
  }

  async removeRoom(
    sessionId: number,
    roomAssignmentId: number,
    tenantId?: string,
  ): Promise<void> {
    const client = createApiClient(tenantId);

    await client.delete(`${this.baseUrl}/sessions/${sessionId}/rooms/${roomAssignmentId}`);
  }
}

export const examSessionService = new ExamSessionService();
