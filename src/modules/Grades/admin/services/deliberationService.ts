/**
 * Deliberation Service
 * Handles deliberation sessions and jury decisions
 * API routes: /api/admin/deliberations/*
 */

import { createApiClient } from '@/shared/lib/api-client';

import type {
  DeliberationSession,
  JuryDecision,
  CreateDeliberationRequest,
  JuryDecisionRequest,
  BulkDecisionRequest,
  DecisionReviewRequest,
  PendingStudent,
} from '../../types/deliberation.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Check if an error is a 404 "no data" response from the backend
 */
function isNotFoundResponse(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    (err as any).response?.status === 404
  );
}

class DeliberationService {
  private baseUrl = '/admin/deliberations';

  /**
   * Get all deliberation sessions
   */
  async getSessions(
    semesterId?: number,
    tenantId?: string
  ): Promise<DeliberationSession[]> {
    try {
      const client = createApiClient(tenantId);
      const params: Record<string, any> = {};

      if (semesterId) params.semester_id = semesterId;

      const response = await client.get<ApiResponse<DeliberationSession[]> | PaginatedResponse<DeliberationSession>>(
        this.baseUrl,
        { params }
      );

      const data = response.data;

      return Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      if (isNotFoundResponse(err)) {
        return [];
      }

      throw err;
    }
  }

  /**
   * Create a new deliberation session
   */
  async createSession(
    request: CreateDeliberationRequest,
    tenantId?: string
  ): Promise<DeliberationSession> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<DeliberationSession>>(
      this.baseUrl,
      request
    );

    return response.data.data;
  }

  /**
   * Get a single session
   */
  async getSession(
    sessionId: number,
    tenantId?: string
  ): Promise<DeliberationSession> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<DeliberationSession>>(
      `${this.baseUrl}/sessions/${sessionId}`
    );

    return response.data.data;
  }

  /**
   * Start a session
   */
  async startSession(
    sessionId: number,
    tenantId?: string
  ): Promise<DeliberationSession> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<DeliberationSession>>(
      `${this.baseUrl}/sessions/${sessionId}/start`
    );

    return response.data.data;
  }

  /**
   * Complete a session
   */
  async completeSession(
    sessionId: number,
    tenantId?: string
  ): Promise<DeliberationSession> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<DeliberationSession>>(
      `${this.baseUrl}/sessions/${sessionId}/complete`
    );

    return response.data.data;
  }

  /**
   * Cancel a session
   */
  async cancelSession(
    sessionId: number,
    tenantId?: string
  ): Promise<DeliberationSession> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<DeliberationSession>>(
      `${this.baseUrl}/sessions/${sessionId}/cancel`
    );

    return response.data.data;
  }

  /**
   * Get pending students for a session
   */
  async getPendingStudents(
    sessionId: number,
    tenantId?: string
  ): Promise<PendingStudent[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<PendingStudent[]>>(
        `${this.baseUrl}/sessions/${sessionId}/pending-students`
      );

      return response.data.data || [];
    } catch (err) {
      if (isNotFoundResponse(err)) {
        return [];
      }

      throw err;
    }
  }

  /**
   * Get deliberated students for a session
   */
  async getDeliberatedStudents(
    sessionId: number,
    tenantId?: string
  ): Promise<JuryDecision[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<JuryDecision[]>>(
        `${this.baseUrl}/sessions/${sessionId}/deliberated-students`
      );

      return response.data.data || [];
    } catch (err) {
      if (isNotFoundResponse(err)) {
        return [];
      }

      throw err;
    }
  }

  /**
   * Make a single decision
   */
  async makeDecision(
    sessionId: number,
    request: JuryDecisionRequest,
    tenantId?: string
  ): Promise<JuryDecision> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<JuryDecision>>(
      `${this.baseUrl}/sessions/${sessionId}/decisions`,
      request
    );

    return response.data.data;
  }

  /**
   * Make bulk decisions
   */
  async makeBulkDecisions(
    sessionId: number,
    request: BulkDecisionRequest,
    tenantId?: string
  ): Promise<{ message: string; count: number }> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<{ message: string; count: number }>>(
      `${this.baseUrl}/sessions/${sessionId}/bulk-decisions`,
      request
    );

    return response.data.data || { message: response.data.message || 'Done', count: 0 };
  }

  /**
   * Review a decision (approve/reject exceptional)
   */
  async reviewDecision(
    decisionId: number,
    request: DecisionReviewRequest,
    tenantId?: string
  ): Promise<JuryDecision> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<JuryDecision>>(
      `${this.baseUrl}/decisions/${decisionId}/review`,
      request
    );

    return response.data.data;
  }

  /**
   * Get decisions requiring review
   */
  async getDecisionsRequiringReview(
    tenantId?: string
  ): Promise<JuryDecision[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<JuryDecision[]>>(
      `${this.baseUrl}/decisions-requiring-review`
    );

    return response.data.data || [];
  }
}

export const deliberationService = new DeliberationService();
