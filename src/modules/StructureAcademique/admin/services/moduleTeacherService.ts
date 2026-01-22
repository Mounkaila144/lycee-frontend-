import { createApiClient } from '@/shared/lib/api-client';
import type {
  ModuleTeacher,
  AssignTeacherRequest,
  ModuleTeachersResponse,
  ModuleTeacherResponse,
  TeacherWorkload,
  TeacherWorkloadResponse,
} from '../../types/moduleTeacher.types';

class ModuleTeacherService {
  /**
   * Get all teacher assignments for a module
   */
  async getModuleTeachers(moduleId: number, academicYear?: string, tenantId?: string): Promise<ModuleTeacher[]> {
    const client = createApiClient(tenantId);
    const params = academicYear ? { academic_year: academicYear } : {};
    const response = await client.get<ModuleTeachersResponse>(`/admin/modules/${moduleId}/teachers`, { params });
    return response.data.data;
  }

  /**
   * Assign a teacher to a module
   */
  async assignTeacher(
    moduleId: number,
    data: AssignTeacherRequest,
    tenantId?: string
  ): Promise<ModuleTeacher> {
    const client = createApiClient(tenantId);
    const response = await client.post<ModuleTeacherResponse>(`/admin/modules/${moduleId}/teachers`, data);
    return response.data.data;
  }

  /**
   * Update a teacher assignment
   */
  async updateAssignment(
    moduleId: number,
    assignmentId: number,
    data: Partial<AssignTeacherRequest>,
    tenantId?: string
  ): Promise<ModuleTeacher> {
    const client = createApiClient(tenantId);
    const response = await client.put<ModuleTeacherResponse>(
      `/admin/modules/${moduleId}/teachers/${assignmentId}`,
      data
    );
    return response.data.data;
  }

  /**
   * Remove a teacher assignment
   */
  async removeAssignment(moduleId: number, assignmentId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`/admin/modules/${moduleId}/teachers/${assignmentId}`);
  }

  /**
   * Get teacher workload (charge horaire)
   */
  async getTeacherWorkload(
    teacherId: number,
    academicYear: string,
    tenantId?: string
  ): Promise<TeacherWorkload> {
    const client = createApiClient(tenantId);
    const response = await client.get<TeacherWorkloadResponse>(`/admin/teachers/${teacherId}/workload`, {
      params: { academic_year: academicYear },
    });
    return response.data.data;
  }
}

export const moduleTeacherService = new ModuleTeacherService();
