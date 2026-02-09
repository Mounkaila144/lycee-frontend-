/**
 * Ranking Service
 * Handles promotion rankings, mentions, and palmares generation
 */

import { createApiClient } from '@/shared/lib/api-client';

import type {
  RankedStudent,
  MentionDistribution,
  RankingFilters,
} from '../../types/ranking.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class RankingService {
  private baseUrl = '/admin';

  async calculateRanking(
    semesterId: number,
    tenantId?: string
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/semesters/${semesterId}/calculate-ranking`
    );

    return response.data.data || { message: response.data.message || 'Ranking calculated' };
  }

  async getRanking(
    semesterId: number,
    filters?: RankingFilters,
    tenantId?: string
  ): Promise<RankedStudent[]> {
    try {
      const client = createApiClient(tenantId);
      const params: Record<string, any> = {};

      if (filters?.program_id) params.program_id = filters.program_id;
      if (filters?.level_id) params.level_id = filters.level_id;
      if (filters?.search) params.search = filters.search;

      const response = await client.get<ApiResponse<RankedStudent[]>>(
        `${this.baseUrl}/semesters/${semesterId}/ranking`,
        { params }
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async getMentionDistribution(
    semesterId: number,
    tenantId?: string
  ): Promise<MentionDistribution[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<MentionDistribution[]>>(
        `${this.baseUrl}/semesters/${semesterId}/mention-distribution`
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async generatePalmares(
    semesterId: number,
    topN: number = 10,
    tenantId?: string
  ): Promise<{ file_url: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<{ file_url: string }>>(
      `${this.baseUrl}/semesters/${semesterId}/generate-palmares`,
      { top_n: topN }
    );

    return response.data.data;
  }

  async exportExcel(
    semesterId: number,
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `${this.baseUrl}/semesters/${semesterId}/ranking/export`,
      { responseType: 'blob' }
    );

    return response.data;
  }
}

export const rankingService = new RankingService();
