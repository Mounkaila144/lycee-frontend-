import { createApiClient } from '@/shared/lib/api-client';

import type {
  RoomUtilization,
  AllRoomsUtilization,
  RoomRecommendation,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class RoomUtilizationService {
  private roomBaseUrl = '/admin/room-utilization';
  private allRoomsBaseUrl = '/admin/rooms-utilization';

  async getRoomUtilization(roomId: number, semesterId: number, tenantId?: string): Promise<RoomUtilization> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RoomUtilization>>(
      `${this.roomBaseUrl}/${roomId}`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async getAllRoomsUtilization(semesterId: number, filters?: Record<string, string>, tenantId?: string): Promise<AllRoomsUtilization> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<AllRoomsUtilization>>(
      this.allRoomsBaseUrl,
      { params: { semester_id: semesterId, ...filters } },
    );

    return response.data.data;
  }

  async getRecommendations(semesterId: number, tenantId?: string): Promise<RoomRecommendation[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RoomRecommendation[]>>(
      `${this.roomBaseUrl}/recommendations`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async exportRoomPdf(roomId: number, semesterId: number, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.roomBaseUrl}/${roomId}/export/pdf`,
      { params: { semester_id: semesterId }, responseType: 'blob' },
    );

    return response.data;
  }

  async exportAllExcel(semesterId: number, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.allRoomsBaseUrl}/export/excel`,
      { params: { semester_id: semesterId }, responseType: 'blob' },
    );

    return response.data;
  }

  async refreshStats(semesterId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.post(`${this.roomBaseUrl}/refresh`, { semester_id: semesterId });
  }
}

export const roomUtilizationService = new RoomUtilizationService();
