import { createApiClient } from '@/shared/lib/api-client';

import type {
  OccupancyKPIs,
  OccupancyByDay,
  SessionTypeDistribution,
  HeatmapCell,
  RoomOccupancyStat,
  TeacherOccupancyStat,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class OccupancyStatsService {
  private baseUrl = '/admin/timetable/statistics';

  async getGlobalKPIs(semesterId: number, tenantId?: string): Promise<OccupancyKPIs> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<OccupancyKPIs>>(
      `${this.baseUrl}/global`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async getOccupancyByDay(semesterId: number, tenantId?: string): Promise<OccupancyByDay[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<OccupancyByDay[]>>(
      `${this.baseUrl}/by-day`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async getSessionTypeDistribution(semesterId: number, tenantId?: string): Promise<SessionTypeDistribution[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<SessionTypeDistribution[]>>(
      `${this.baseUrl}/session-types`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async getHeatmap(semesterId: number, tenantId?: string): Promise<HeatmapCell[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<HeatmapCell[]>>(
      `${this.baseUrl}/timeslots`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async getTopRooms(semesterId: number, tenantId?: string): Promise<RoomOccupancyStat[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RoomOccupancyStat[]>>(
      `${this.baseUrl}/rooms`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async getTopTeachers(semesterId: number, tenantId?: string): Promise<TeacherOccupancyStat[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TeacherOccupancyStat[]>>(
      `${this.baseUrl}/teachers`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async refreshStats(semesterId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.post(`${this.baseUrl}/refresh`, { semester_id: semesterId });
  }

  async exportExcel(semesterId: number, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.baseUrl}/export/excel`,
      { params: { semester_id: semesterId }, responseType: 'blob' },
    );

    return response.data;
  }
}

export const occupancyStatsService = new OccupancyStatsService();
