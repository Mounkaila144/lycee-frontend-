import { createApiClient } from '@/shared/lib/api-client';

import type {
  GenerationConfig,
  GenerationResult,
  GenerationStatusResponse,
  TeacherPreference,
  TeacherPreferenceRequest,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class OptimizationService {
  private baseUrl = '/admin/timetable';

  async generate(config: GenerationConfig, tenantId?: string): Promise<{ job_id: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<{ job_id: string }>>(`${this.baseUrl}/generate`, config);

    return response.data.data;
  }

  async getGenerationStatus(jobId: string, tenantId?: string): Promise<GenerationStatusResponse> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<GenerationStatusResponse>>(
      `${this.baseUrl}/generation-status/${jobId}`,
    );

    return response.data.data;
  }

  async getGenerationResult(groupId: number, tenantId?: string): Promise<GenerationResult> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<GenerationResult>>(
      `${this.baseUrl}/generation-result/${groupId}`,
    );

    return response.data.data;
  }

  async acceptGenerated(groupId: number, semesterId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.post(`${this.baseUrl}/accept-generated`, { group_id: groupId, semester_id: semesterId });
  }

  async getTeacherPreferences(teacherId: number, tenantId?: string): Promise<TeacherPreference[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TeacherPreference[]>>(
      `/admin/teachers/${teacherId}/preferences`,
    );

    return response.data.data;
  }

  async updateTeacherPreferences(data: TeacherPreferenceRequest, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.put(`/admin/teachers/${data.teacher_id}/preferences`, data);
  }
}

export const optimizationService = new OptimizationService();
