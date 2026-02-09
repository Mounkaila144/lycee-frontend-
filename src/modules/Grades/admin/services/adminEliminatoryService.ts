/**
 * Admin Eliminatory Service
 * Handles eliminatory module management API calls
 * API routes: /api/admin/semesters/{semester}/eliminatory/*, /api/admin/modules/{module}/eliminatory/*
 */

import { createApiClient } from '@/shared/lib/api-client';

import type {
  EliminatoryModule,
  BlockedStudent,
  EliminatoryStatistics,
  ToggleEliminatoryResponse,
  UpdateThresholdResponse,
  StudentEliminatoryStatus,
  FailedEliminatoryModule,
} from '../../types/eliminatory.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface BlockedStudentsResponse {
  data: BlockedStudent[];
  count: number;
}

class AdminEliminatoryService {
  private baseUrl = '/admin';

  /**
   * Get eliminatory modules for a semester
   */
  async getEliminatoryModules(
    semesterId: number,
    tenantId?: string
  ): Promise<EliminatoryModule[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<EliminatoryModule[]>>(
      `${this.baseUrl}/semesters/${semesterId}/eliminatory/modules`
    );

    return response.data.data;
  }

  /**
   * Get students blocked by eliminatory failures
   */
  async getBlockedStudents(
    semesterId: number,
    tenantId?: string
  ): Promise<{ students: BlockedStudent[]; count: number }> {
    const client = createApiClient(tenantId);
    const response = await client.get<BlockedStudentsResponse>(
      `${this.baseUrl}/semesters/${semesterId}/eliminatory/blocked-students`
    );

    return {
      students: response.data.data,
      count: response.data.count,
    };
  }

  /**
   * Get eliminatory statistics for a semester
   */
  async getStatistics(
    semesterId: number,
    tenantId?: string
  ): Promise<EliminatoryStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<EliminatoryStatistics>>(
      `${this.baseUrl}/semesters/${semesterId}/eliminatory/statistics`
    );

    return response.data.data;
  }

  /**
   * Toggle eliminatory status for a module
   */
  async toggleEliminatory(
    moduleId: number,
    tenantId?: string
  ): Promise<ToggleEliminatoryResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<ToggleEliminatoryResponse>>(
      `${this.baseUrl}/modules/${moduleId}/eliminatory/toggle`
    );

    return response.data.data;
  }

  /**
   * Update eliminatory threshold for a module
   */
  async updateThreshold(
    moduleId: number,
    threshold: number,
    tenantId?: string
  ): Promise<UpdateThresholdResponse> {
    const client = createApiClient(tenantId);
    const response = await client.put<ApiResponse<UpdateThresholdResponse>>(
      `${this.baseUrl}/modules/${moduleId}/eliminatory/threshold`,
      { eliminatory_threshold: threshold }
    );

    return response.data.data;
  }

  /**
   * Check student eliminatory status for a module/semester
   */
  async getStudentStatus(
    studentId: number,
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<StudentEliminatoryStatus> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<StudentEliminatoryStatus>>(
      `${this.baseUrl}/students/${studentId}/modules/${moduleId}/semesters/${semesterId}/eliminatory-status`
    );

    return response.data.data;
  }

  /**
   * Get failed eliminatory modules for a student in a semester
   */
  async getStudentFailedModules(
    studentId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<FailedEliminatoryModule[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<FailedEliminatoryModule[]>>(
      `${this.baseUrl}/students/${studentId}/semesters/${semesterId}/failed-eliminatory`
    );

    return response.data.data;
  }
}

export const adminEliminatoryService = new AdminEliminatoryService();
