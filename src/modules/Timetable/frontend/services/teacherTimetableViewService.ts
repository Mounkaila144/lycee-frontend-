import { createApiClient } from '@/shared/lib/api-client';

import type { TeacherTimetableResponse, NextClassInfo, RecentChange } from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class TeacherTimetableViewService {
  private baseUrl = '/teacher';

  async getMyTimetable(
    semesterId: number,
    weekStart?: string,
    tenantId?: string,
  ): Promise<TeacherTimetableResponse> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TeacherTimetableResponse>>(
      `${this.baseUrl}/my-timetable`,
      { params: { semester_id: semesterId, week_start: weekStart } },
    );

    return response.data.data;
  }

  async getNextClass(tenantId?: string): Promise<NextClassInfo | null> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<NextClassInfo | null>>(
      `${this.baseUrl}/next-class`,
    );

    return response.data.data;
  }

  async getRecentChanges(tenantId?: string): Promise<RecentChange[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RecentChange[]>>(
      `${this.baseUrl}/recent-changes`,
    );

    return response.data.data;
  }

  async markChangeAsRead(changeId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.post(`${this.baseUrl}/recent-changes/${changeId}/read`);
  }

  async exportPdf(
    semesterId: number,
    weekStart?: string,
    tenantId?: string,
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(`${this.baseUrl}/my-timetable/export-pdf`, {
      params: { semester_id: semesterId, week_start: weekStart },
      responseType: 'blob',
    });

    return response.data;
  }

  async exportIcal(semesterId: number, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(`${this.baseUrl}/my-timetable/export-ical`, {
      params: { semester_id: semesterId },
      responseType: 'blob',
    });

    return response.data;
  }

  async getTeacherStatistics(
    semesterId: number,
    tenantId?: string,
  ): Promise<{ weekly_hours: number[] }> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<{ weekly_hours: number[] }>>(
      `${this.baseUrl}/my-statistics/${semesterId}`,
    );

    return response.data.data;
  }
}

export const teacherTimetableViewService = new TeacherTimetableViewService();
