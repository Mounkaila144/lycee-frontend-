import { createApiClient } from '@/shared/lib/api-client';

import type {
  TeacherWorkload,
  DepartmentWorkloadSummary,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class TeacherWorkloadService {
  private teacherBaseUrl = '/admin/teacher-workload';
  private departmentBaseUrl = '/admin/department-workload';

  async getTeacherWorkload(teacherId: number, semesterId: number, tenantId?: string): Promise<TeacherWorkload> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TeacherWorkload>>(
      `${this.teacherBaseUrl}/${teacherId}`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async getDepartmentSummary(departmentId: number, semesterId: number, tenantId?: string): Promise<DepartmentWorkloadSummary> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<DepartmentWorkloadSummary>>(
      `${this.departmentBaseUrl}/${departmentId}`,
      { params: { semester_id: semesterId } },
    );

    return response.data.data;
  }

  async exportTeacherPdf(teacherId: number, semesterId: number, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.teacherBaseUrl}/${teacherId}/export/pdf`,
      { params: { semester_id: semesterId }, responseType: 'blob' },
    );

    return response.data;
  }

  async exportDepartmentExcel(departmentId: number, semesterId: number, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.departmentBaseUrl}/${departmentId}/export/excel`,
      { params: { semester_id: semesterId }, responseType: 'blob' },
    );

    return response.data;
  }

  async sendTeacherReport(teacherId: number, semesterId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.post(`${this.teacherBaseUrl}/${teacherId}/send-report`, {
      semester_id: semesterId,
    });
  }
}

export const teacherWorkloadService = new TeacherWorkloadService();
