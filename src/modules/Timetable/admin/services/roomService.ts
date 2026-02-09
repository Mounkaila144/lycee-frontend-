import { createApiClient } from '@/shared/lib/api-client';

import type {
  Room,
  CreateRoomRequest,
  UpdateRoomRequest,
  RoomFilters,
  BlockRoomRequest,
  RoomOccupationReport,
  RoomSuggestion,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

class RoomService {
  private baseUrl = '/admin/rooms';

  async getAll(filters?: RoomFilters, page: number = 1, perPage: number = 50, tenantId?: string): Promise<PaginatedResponse<Room>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Room>>(this.baseUrl, {
      params: { ...filters, page, per_page: perPage },
    });

    return response.data;
  }

  async getById(id: number, tenantId?: string): Promise<Room> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<Room>>(`${this.baseUrl}/${id}`);

    return response.data.data;
  }

  async create(data: CreateRoomRequest, tenantId?: string): Promise<Room> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<Room>>(this.baseUrl, data);

    return response.data.data;
  }

  async update(id: number, data: Partial<CreateRoomRequest>, tenantId?: string): Promise<Room> {
    const client = createApiClient(tenantId);
    const response = await client.put<ApiResponse<Room>>(`${this.baseUrl}/${id}`, data);

    return response.data.data;
  }

  async delete(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`${this.baseUrl}/${id}`);
  }

  async getAvailable(
    day: string,
    start: string,
    end: string,
    type?: string,
    size?: number,
    tenantId?: string,
  ): Promise<Room[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<Room[]>>(`${this.baseUrl}/available`, {
      params: { day, start, end, type, size },
    });

    return response.data.data;
  }

  async getSuggested(
    sessionType: string,
    groupSize: number,
    day: string,
    start: string,
    end: string,
    tenantId?: string,
  ): Promise<RoomSuggestion[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RoomSuggestion[]>>(`${this.baseUrl}/suggested`, {
      params: { session_type: sessionType, group_size: groupSize, day, start, end },
    });

    return response.data.data;
  }

  async block(id: number, data: BlockRoomRequest, tenantId?: string): Promise<Room> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<Room>>(`${this.baseUrl}/${id}/block`, data);

    return response.data.data;
  }

  async unblock(id: number, tenantId?: string): Promise<Room> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<Room>>(`${this.baseUrl}/${id}/unblock`);

    return response.data.data;
  }

  async getOccupation(id: number, semesterId: number, tenantId?: string): Promise<RoomOccupationReport> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RoomOccupationReport>>(
      `${this.baseUrl}/${id}/occupation`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }
}

export const roomService = new RoomService();
