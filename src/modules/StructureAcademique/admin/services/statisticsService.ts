/**
 * Statistics Service - Structure Académique
 */

import { createApiClient } from '@/shared/lib/api-client';
import type {
  GlobalStats,
  VolumeDistribution,
  ProgramVolumeStats,
  ProgramDetailStats,
  CreditsByLevel,
  StatsResponse,
} from '../../types/statistics.types';

class StatisticsService {
  /**
   * Get global statistics
   */
  async getGlobalStats(tenantId?: string): Promise<GlobalStats> {
    const client = createApiClient(tenantId);
    const response = await client.get<StatsResponse<GlobalStats>>(
      '/admin/stats/structure/global'
    );
    return response.data.data;
  }

  /**
   * Get volume distribution (CM/TD/TP)
   */
  async getVolumeDistribution(tenantId?: string): Promise<VolumeDistribution> {
    const client = createApiClient(tenantId);
    const response = await client.get<StatsResponse<VolumeDistribution>>(
      '/admin/stats/structure/volumes'
    );
    return response.data.data;
  }

  /**
   * Get volumes by program
   */
  async getVolumesByProgram(
    tenantId?: string
  ): Promise<ProgramVolumeStats[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<StatsResponse<ProgramVolumeStats[]>>(
      '/admin/stats/structure/volumes/by-program'
    );
    return response.data.data;
  }

  /**
   * Get program detail statistics
   */
  async getProgramStats(
    programId: number,
    tenantId?: string
  ): Promise<ProgramDetailStats> {
    const client = createApiClient(tenantId);
    const response = await client.get<StatsResponse<ProgramDetailStats>>(
      `/admin/stats/structure/programs/${programId}`
    );
    return response.data.data;
  }

  /**
   * Get credits by level
   */
  async getCreditsByLevel(tenantId?: string): Promise<CreditsByLevel> {
    const client = createApiClient(tenantId);
    const response = await client.get<StatsResponse<CreditsByLevel>>(
      '/admin/stats/structure/credits/by-level'
    );
    return response.data.data;
  }

  /**
   * Export statistics to Excel
   */
  async exportStats(tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get('/admin/stats/structure/export', {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Invalidate statistics cache
   */
  async invalidateCache(tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.post('/admin/stats/structure/cache/invalidate');
  }

  /**
   * Helper: Trigger browser download
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const statisticsService = new StatisticsService();
