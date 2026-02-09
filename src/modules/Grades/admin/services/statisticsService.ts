/**
 * Statistics Service
 * Handles success rate statistics, grade distribution, and program comparisons
 */

import { createApiClient } from '@/shared/lib/api-client';

import type {
  GlobalStatistics,
  ModuleStatistic,
  ProgramComparison,
  StatisticsDistribution,
  SemesterEvolution,
  StatisticsFilters,
} from '../../types/statistics.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class StatisticsService {
  private baseUrl = '/admin';

  async getGlobalStatistics(
    semesterId: number,
    filters?: StatisticsFilters,
    tenantId?: string
  ): Promise<GlobalStatistics> {
    try {
      const client = createApiClient(tenantId);
      const params: Record<string, any> = {};

      if (filters?.program_id) params.program_id = filters.program_id;
      if (filters?.level_id) params.level_id = filters.level_id;
      if (filters?.type) params.type = filters.type;

      const response = await client.get<ApiResponse<GlobalStatistics>>(
        `${this.baseUrl}/statistics/global/${semesterId}`,
        { params }
      );

      return response.data.data;
    } catch {
      return {
        total_students: 0,
        success_rate: 0,
        compensation_rate: 0,
        retake_rate: 0,
        failure_rate: 0,
        dropout_rate: 0,
        average_ects: 0,
        class_average: 0,
      };
    }
  }

  async getModuleStatistics(
    semesterId: number,
    tenantId?: string
  ): Promise<ModuleStatistic[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<ModuleStatistic[]>>(
        `${this.baseUrl}/statistics/modules/${semesterId}`
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async getProgramComparison(
    semesterId: number,
    tenantId?: string
  ): Promise<ProgramComparison[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<ProgramComparison[]>>(
        `${this.baseUrl}/statistics/filieres/${semesterId}`
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async getDistribution(
    semesterId: number,
    tenantId?: string
  ): Promise<StatisticsDistribution> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<StatisticsDistribution>>(
        `${this.baseUrl}/statistics/distribution/${semesterId}`
      );

      return response.data.data;
    } catch {
      return { '0-5': 0, '5-10': 0, '10-12': 0, '12-14': 0, '14-16': 0, '16-20': 0 };
    }
  }

  async getSemesterEvolution(
    tenantId?: string
  ): Promise<SemesterEvolution[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<SemesterEvolution[]>>(
        `${this.baseUrl}/statistics/evolution`
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async exportExcel(
    semesterId: number,
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `${this.baseUrl}/statistics/export/${semesterId}`,
      { responseType: 'blob' }
    );

    return response.data;
  }
}

export const statisticsService = new StatisticsService();
