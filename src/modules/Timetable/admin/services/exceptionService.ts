import { createApiClient } from '@/shared/lib/api-client';

import type {
  TimetableException,
  CreateExceptionRequest,
  ExceptionFilters,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class ExceptionService {
  private baseUrl = '/admin/timetable/exceptions';

  async create(data: CreateExceptionRequest, tenantId?: string): Promise<TimetableException> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<TimetableException>>(this.baseUrl, data);

    return response.data.data;
  }

  async getAll(filters?: ExceptionFilters, tenantId?: string): Promise<TimetableException[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TimetableException[]>>(this.baseUrl, {
      params: filters,
    });

    return response.data.data;
  }

  async getSlotExceptions(slotId: number, tenantId?: string): Promise<TimetableException[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TimetableException[]>>(
      `/admin/timetable/slots/${slotId}/exceptions`,
    );

    return response.data.data;
  }

  async cancel(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`${this.baseUrl}/${id}`);
  }

  async getUpcoming(scheduleId: number, days: number = 7, tenantId?: string): Promise<TimetableException[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TimetableException[]>>(
      `${this.baseUrl}/upcoming/${scheduleId}`,
      { params: { days } },
    );

    return response.data.data;
  }
}

export const exceptionService = new ExceptionService();
