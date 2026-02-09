import { createApiClient } from '@/shared/lib/api-client';

import type {
  TeacherReplacement,
  ReplacementSuggestion,
  ReplacementStats,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class TeacherReplacementService {
  private baseUrl = '/admin/timetable/replacements';

  async replaceTeacher(
    data: { slot_id: number; replacement_teacher_id: number; start_date: string; end_date?: string; reason?: string },
    tenantId?: string,
  ): Promise<TeacherReplacement> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<TeacherReplacement>>(this.baseUrl, data);

    return response.data.data;
  }

  async getSuggestions(slotId: number, tenantId?: string): Promise<ReplacementSuggestion[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<ReplacementSuggestion[]>>(
      `${this.baseUrl}/suggestions/${slotId}`,
    );

    return response.data.data;
  }

  async getActive(tenantId?: string): Promise<TeacherReplacement[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TeacherReplacement[]>>(
      `${this.baseUrl}/active`,
    );

    return response.data.data;
  }

  async getAll(
    filters?: { teacher?: string; status?: string },
    tenantId?: string,
  ): Promise<TeacherReplacement[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TeacherReplacement[]>>(this.baseUrl, {
      params: filters,
    });

    return response.data.data;
  }

  async endReplacement(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.patch(`${this.baseUrl}/${id}/end`);
  }

  async getStatistics(tenantId?: string): Promise<ReplacementStats> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<ReplacementStats>>(
      `${this.baseUrl}/statistics`,
    );

    return response.data.data;
  }

  async exportExcel(tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(`${this.baseUrl}/export-excel`, {
      responseType: 'blob',
    });

    return response.data;
  }
}

export const teacherReplacementService = new TeacherReplacementService();
