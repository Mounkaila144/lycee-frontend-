import { createApiClient } from '@/shared/lib/api-client';

import type {
  DuplicationPreview,
  DuplicationRequest,
  DuplicationResult,
  SlotSuggestions,
  QuickAssignRequest,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class DuplicationService {
  private baseUrl = '/admin/schedules';

  async getPreview(scheduleId: number, tenantId?: string): Promise<DuplicationPreview> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<DuplicationPreview>>(
      `${this.baseUrl}/${scheduleId}/duplication-preview`,
    );

    return response.data.data;
  }

  async duplicate(data: DuplicationRequest, tenantId?: string): Promise<DuplicationResult> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<DuplicationResult>>(
      `${this.baseUrl}/${data.source_schedule_id}/duplicate`,
      data,
    );

    return response.data.data;
  }

  async getDuplicationReport(scheduleId: number, tenantId?: string): Promise<DuplicationResult> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<DuplicationResult>>(
      `${this.baseUrl}/${scheduleId}/duplication-report`,
    );

    return response.data.data;
  }

  async getSlotSuggestions(slotId: number, tenantId?: string): Promise<SlotSuggestions> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<SlotSuggestions>>(
      `/admin/timetable/slots/${slotId}/suggestions`,
    );

    return response.data.data;
  }

  async quickAssign(data: QuickAssignRequest, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.put(`/admin/timetable/slots/${data.slot_id}/quick-assign`, data);
  }
}

export const duplicationService = new DuplicationService();
