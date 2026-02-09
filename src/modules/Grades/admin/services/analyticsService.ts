/**
 * Analytics Service
 * Handles performance analytics, KPIs, predictive analysis, and correlations
 */

import { createApiClient } from '@/shared/lib/api-client';

import type {
  AnalyticsKPIs,
  WeakModule,
  CohortAnalysis,
  AtRiskStudent,
  CorrelationEntry,
  HistoricalComparison,
} from '../../types/analytics.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class AnalyticsService {
  private baseUrl = '/admin';

  async getKPIs(
    semesterId: number,
    tenantId?: string
  ): Promise<AnalyticsKPIs> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<AnalyticsKPIs>>(
        `${this.baseUrl}/analytics/kpis/${semesterId}`
      );

      return response.data.data;
    } catch {
      return {
        success_rate: 0,
        success_rate_trend: 0,
        class_average: 0,
        class_average_trend: 0,
        absence_rate: 0,
        critical_modules_count: 0,
        dropout_rate: 0,
        total_students: 0,
      };
    }
  }

  async getWeakModules(
    semesterId: number,
    tenantId?: string
  ): Promise<WeakModule[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<WeakModule[]>>(
        `${this.baseUrl}/analytics/weak-modules/${semesterId}`
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async getCohortAnalysis(
    semesterId: number,
    tenantId?: string
  ): Promise<CohortAnalysis | null> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<CohortAnalysis>>(
        `${this.baseUrl}/analytics/cohort-analysis/${semesterId}`
      );

      return response.data.data;
    } catch {
      return null;
    }
  }

  async getAtRiskStudents(
    semesterId: number,
    threshold: number = 70,
    tenantId?: string
  ): Promise<AtRiskStudent[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<AtRiskStudent[]>>(
        `${this.baseUrl}/analytics/at-risk-students/${semesterId}`,
        { params: { threshold } }
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async getCorrelationMatrix(
    semesterId: number,
    tenantId?: string
  ): Promise<CorrelationEntry[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<CorrelationEntry[]>>(
        `${this.baseUrl}/analytics/correlation-matrix/${semesterId}`
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async getHistoricalComparison(
    programId?: number,
    tenantId?: string
  ): Promise<HistoricalComparison[]> {
    try {
      const client = createApiClient(tenantId);
      const params: Record<string, any> = {};

      if (programId) params.program_id = programId;

      const response = await client.get<ApiResponse<HistoricalComparison[]>>(
        `${this.baseUrl}/analytics/historical-comparison`,
        { params }
      );

      return response.data.data;
    } catch {
      return [];
    }
  }

  async exportReport(
    semesterId: number,
    format: 'excel' | 'pdf' | 'csv' = 'excel',
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `${this.baseUrl}/analytics/export/${semesterId}`,
      { params: { format }, responseType: 'blob' }
    );

    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
