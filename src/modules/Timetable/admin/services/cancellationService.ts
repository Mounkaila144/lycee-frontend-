import { createApiClient } from '@/shared/lib/api-client';

import type {
  CancellationRequest,
  CancellationRecord,
  CancellationStats,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class CancellationService {
  private baseUrl = '/admin/timetable/cancellations';

  async cancelSession(data: CancellationRequest, tenantId?: string): Promise<CancellationRecord> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<CancellationRecord>>(this.baseUrl, data);

    return response.data.data;
  }

  async restoreSession(exceptionId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.post(`${this.baseUrl}/${exceptionId}/restore`);
  }

  async getAll(
    filters?: { module?: string; teacher?: string; status?: string },
    tenantId?: string,
  ): Promise<CancellationRecord[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<CancellationRecord[]>>(this.baseUrl, {
      params: filters,
    });

    return response.data.data;
  }

  async getStatistics(tenantId?: string): Promise<CancellationStats> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<CancellationStats>>(
      `${this.baseUrl}/statistics`,
    );

    return response.data.data;
  }

  async exportExcel(tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(`${this.baseUrl}/export-excel`, {
      responseType: 'blob',
    });

    return response.data;
  }
}

export const cancellationService = new CancellationService();
