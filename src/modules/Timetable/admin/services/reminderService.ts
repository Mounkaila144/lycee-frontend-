import { createApiClient } from '@/shared/lib/api-client';

import type {
  ReminderPreferences,
  WeeklySummary,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class ReminderService {
  private baseUrl = '/user/reminder-preferences';

  async getPreferences(tenantId?: string): Promise<ReminderPreferences> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<ReminderPreferences>>(this.baseUrl);

    return response.data.data;
  }

  async updatePreferences(data: ReminderPreferences, tenantId?: string): Promise<ReminderPreferences> {
    const client = createApiClient(tenantId);
    const response = await client.put<ApiResponse<ReminderPreferences>>(this.baseUrl, data);

    return response.data.data;
  }

  async getWeeklySummary(tenantId?: string): Promise<WeeklySummary> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<WeeklySummary>>(
      `${this.baseUrl}/weekly-summary`,
    );

    return response.data.data;
  }

  async sendGroupReminder(groupId: number, message: string, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.post(`${this.baseUrl}/send-group-reminder`, {
      group_id: groupId,
      message,
    });
  }
}

export const reminderService = new ReminderService();
