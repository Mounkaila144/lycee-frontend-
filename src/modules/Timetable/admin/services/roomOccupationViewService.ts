import { createApiClient } from '@/shared/lib/api-client';

import type { RoomOccupationResponse } from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class RoomOccupationViewService {
  private baseUrl = '/admin/rooms';

  async getRoomOccupation(
    roomId: number,
    semesterId: number,
    weekStart?: string,
    tenantId?: string,
  ): Promise<RoomOccupationResponse> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RoomOccupationResponse>>(
      `${this.baseUrl}/${roomId}/occupation`,
      { params: { semester_id: semesterId, week_start: weekStart } },
    );

    return response.data.data;
  }

  async getRoomStatistics(
    roomId: number,
    semesterId: number,
    tenantId?: string,
  ): Promise<{ occupation_rate: number; total_occupied: number; total_available: number }> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<{ occupation_rate: number; total_occupied: number; total_available: number }>>(
      `${this.baseUrl}/${roomId}/statistics`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async compareRooms(
    roomIds: number[],
    semesterId: number,
    tenantId?: string,
  ): Promise<Array<{ room_id: number; name: string; occupation_rate: number }>> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<Array<{ room_id: number; name: string; occupation_rate: number }>>>(
      `${this.baseUrl}/compare`,
      { params: { room_ids: roomIds, semester_id: semesterId } },
    );

    return response.data.data;
  }

  async exportPdf(
    roomId: number,
    semesterId: number,
    weekStart?: string,
    tenantId?: string,
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(`${this.baseUrl}/${roomId}/occupation/export-pdf`, {
      params: { semester_id: semesterId, week_start: weekStart },
      responseType: 'blob',
    });

    return response.data;
  }
}

export const roomOccupationViewService = new RoomOccupationViewService();
