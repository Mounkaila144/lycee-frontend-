/**
 * Publication Service
 * Handles results publication management
 * API routes: /api/admin/publications/*, /api/admin/semesters/{semester}/publication/*
 */

import { createApiClient } from '@/shared/lib/api-client';

import type {
  PublicationRecord,
  PublicationFilters,
  PublishRequest,
  CanPublishResponse,
  PublicationStatusSummary,
  PublicationHistoryEntry,
} from '../../types/publication.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
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

class PublicationService {
  private baseUrl = '/admin';

  /**
   * Get all publications
   */
  async getPublications(
    filters?: PublicationFilters,
    tenantId?: string
  ): Promise<PublicationRecord[]> {
    try {
      const client = createApiClient(tenantId);
      const params: Record<string, any> = {};

      if (filters?.type) params.type = filters.type;
      if (filters?.status) params.status = filters.status;
      if (filters?.semester_id) params.semester_id = filters.semester_id;

      const response = await client.get<ApiResponse<PublicationRecord[]>>(
        `${this.baseUrl}/publications`,
        { params }
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
   * Get a single publication
   */
  async getPublication(
    publicationId: number,
    tenantId?: string
  ): Promise<PublicationRecord> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<PublicationRecord>>(
      `${this.baseUrl}/publications/${publicationId}`
    );

    return response.data.data;
  }

  /**
   * Delete a publication
   */
  async deletePublication(
    publicationId: number,
    tenantId?: string
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/publications/${publicationId}`
    );

    return response.data.data || { message: response.data.message || 'Deleted' };
  }

  /**
   * Get publication status for a semester
   */
  async getStatus(
    semesterId: number,
    tenantId?: string
  ): Promise<PublicationStatusSummary | null> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<PublicationStatusSummary>>(
        `${this.baseUrl}/semesters/${semesterId}/publication/status`
      );

      return response.data.data;
    } catch (err) {
      if (isNotFoundResponse(err)) {
        return null;
      }

      throw err;
    }
  }

  /**
   * Get publication history for a semester
   */
  async getHistory(
    semesterId: number,
    tenantId?: string
  ): Promise<PublicationHistoryEntry[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<PublicationHistoryEntry[]>>(
        `${this.baseUrl}/semesters/${semesterId}/publication/history`
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
   * Check if can publish
   */
  async canPublish(
    semesterId: number,
    tenantId?: string
  ): Promise<CanPublishResponse | null> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<CanPublishResponse>>(
        `${this.baseUrl}/semesters/${semesterId}/publication/can-publish`
      );

      return response.data.data;
    } catch (err) {
      if (isNotFoundResponse(err)) {
        return null;
      }

      throw err;
    }
  }

  /**
   * Publish results
   */
  async publish(
    semesterId: number,
    request: PublishRequest,
    tenantId?: string
  ): Promise<PublicationRecord> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<PublicationRecord>>(
      `${this.baseUrl}/semesters/${semesterId}/publication/publish`,
      request
    );

    return response.data.data;
  }
}

export const publicationService = new PublicationService();
