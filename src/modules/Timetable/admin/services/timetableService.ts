import { createApiClient } from '@/shared/lib/api-client';

import type {
  TimetableSlot,
  Schedule,
  CreateSlotRequest,
  UpdateSlotRequest,
  TimetableFilters,
  ConflictResult,
  CheckConflictRequest,
  AlternativeSlot,
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

class TimetableService {
  private baseUrl = '/admin/timetable';

  async getSchedules(semesterId?: number, tenantId?: string): Promise<Schedule[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<Schedule[]>>(`${this.baseUrl}/schedules`, {
      params: { semester_id: semesterId },
    });

    return response.data.data;
  }

  async getSchedule(id: number, tenantId?: string): Promise<Schedule> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<Schedule>>(`${this.baseUrl}/schedules/${id}`);

    return response.data.data;
  }

  async getGroupTimetable(groupId: number, semesterId: number, tenantId?: string): Promise<TimetableSlot[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TimetableSlot[]>>(`${this.baseUrl}/groups/${groupId}`, {
      params: { semester_id: semesterId },
    });

    return response.data.data;
  }

  async getTeacherTimetable(teacherId: number, semesterId: number, tenantId?: string): Promise<TimetableSlot[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TimetableSlot[]>>(`${this.baseUrl}/teachers/${teacherId}`, {
      params: { semester_id: semesterId },
    });

    return response.data.data;
  }

  async getRoomTimetable(roomId: number, semesterId: number, tenantId?: string): Promise<TimetableSlot[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TimetableSlot[]>>(`${this.baseUrl}/rooms/${roomId}`, {
      params: { semester_id: semesterId },
    });

    return response.data.data;
  }

  async getSlots(filters?: TimetableFilters, tenantId?: string): Promise<TimetableSlot[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TimetableSlot[]>>(`${this.baseUrl}/slots`, {
      params: filters,
    });

    return response.data.data;
  }

  async createSlot(data: CreateSlotRequest, tenantId?: string): Promise<TimetableSlot> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<TimetableSlot>>(`${this.baseUrl}/slots`, data);

    return response.data.data;
  }

  async updateSlot(id: number, data: Partial<CreateSlotRequest>, tenantId?: string): Promise<TimetableSlot> {
    const client = createApiClient(tenantId);
    const response = await client.put<ApiResponse<TimetableSlot>>(`${this.baseUrl}/slots/${id}`, data);

    return response.data.data;
  }

  async deleteSlot(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`${this.baseUrl}/slots/${id}`);
  }

  async checkConflicts(data: CheckConflictRequest, tenantId?: string): Promise<ConflictResult> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<ConflictResult>>(`${this.baseUrl}/check-conflicts`, data);

    return response.data.data;
  }

  async getSuggestedAlternatives(data: CheckConflictRequest, tenantId?: string): Promise<AlternativeSlot[]> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<AlternativeSlot[]>>(
      `${this.baseUrl}/suggest-alternatives`,
      data,
    );

    return response.data.data;
  }

  async publishSchedule(scheduleId: number, tenantId?: string): Promise<Schedule> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<Schedule>>(`${this.baseUrl}/schedules/${scheduleId}/publish`);

    return response.data.data;
  }

  async exportPdf(type: 'group' | 'teacher' | 'room', id: number, semesterId: number, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(`${this.baseUrl}/export/${type}/${id}`, {
      params: { semester_id: semesterId },
      responseType: 'blob',
    });

    return response.data;
  }
}

export const timetableService = new TimetableService();
