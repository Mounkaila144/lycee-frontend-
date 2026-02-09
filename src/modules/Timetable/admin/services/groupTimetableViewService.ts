import { createApiClient } from '@/shared/lib/api-client';

import type { GroupTimetableResponse, GapInfo, TimetableStatistics } from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class GroupTimetableViewService {
  private baseUrl = '/admin/timetable/groups';

  async getGroupTimetable(
    groupId: number,
    semesterId: number,
    weekStart?: string,
    tenantId?: string,
  ): Promise<GroupTimetableResponse> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<GroupTimetableResponse>>(
      `${this.baseUrl}/${groupId}`,
      { params: { semester_id: semesterId, week_start: weekStart } },
    );

    return response.data.data;
  }

  async getGroupStatistics(
    groupId: number,
    semesterId: number,
    tenantId?: string,
  ): Promise<TimetableStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TimetableStatistics>>(
      `${this.baseUrl}/${groupId}/statistics`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async getGroupGaps(
    groupId: number,
    semesterId: number,
    weekStart?: string,
    tenantId?: string,
  ): Promise<GapInfo[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<GapInfo[]>>(
      `${this.baseUrl}/${groupId}/gaps`,
      { params: { semester_id: semesterId, week_start: weekStart } },
    );

    return response.data.data;
  }

  async exportCsv(
    groupId: number,
    semesterId: number,
    tenantId?: string,
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(`${this.baseUrl}/${groupId}/export-csv`, {
      params: { semester_id: semesterId },
      responseType: 'blob',
    });

    return response.data;
  }
}

export const groupTimetableViewService = new GroupTimetableViewService();
