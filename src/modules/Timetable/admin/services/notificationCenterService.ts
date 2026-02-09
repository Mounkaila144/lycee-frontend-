import { createApiClient } from '@/shared/lib/api-client';

import type {
  TimetableNotification,
  NotificationPreferences,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class NotificationCenterService {
  private baseUrl = '/notifications/timetable';

  async getAll(
    filters?: { read?: boolean; priority?: string; type?: string; page?: number },
    tenantId?: string,
  ): Promise<TimetableNotification[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TimetableNotification[]>>(this.baseUrl, {
      params: filters,
    });

    return response.data.data;
  }

  async getUnreadCount(tenantId?: string): Promise<number> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<number>>(`${this.baseUrl}/unread-count`);

    return response.data.data;
  }

  async markAsRead(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.patch(`${this.baseUrl}/${id}/read`);
  }

  async markAllAsRead(tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.patch(`${this.baseUrl}/read-all`);
  }

  async deleteNotification(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`${this.baseUrl}/${id}`);
  }

  async getPreferences(tenantId?: string): Promise<NotificationPreferences> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<NotificationPreferences>>(
      `${this.baseUrl}/preferences`,
    );

    return response.data.data;
  }

  async updatePreferences(data: NotificationPreferences, tenantId?: string): Promise<NotificationPreferences> {
    const client = createApiClient(tenantId);
    const response = await client.put<ApiResponse<NotificationPreferences>>(
      `${this.baseUrl}/preferences`,
      data,
    );

    return response.data.data;
  }
}

export const notificationCenterService = new NotificationCenterService();
