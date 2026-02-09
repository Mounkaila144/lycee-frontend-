import { createApiClient } from '@/shared/lib/api-client';
import type {
  RetakeEnrollment,
  RetakeStatistics,
  RetakeModuleSummary,
  RetakeStudentSummary,
  RetakeStudentEntry,
  RetakeGradeStatistics,
  IdentifyRetakesResponse,
  ValidateRetakeGradesResponse,
  PublishRetakeGradesResponse,
} from '../../types/retake.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
}

/**
 * Admin Retake Service
 * Handles retake identification, enrollment management, grade validation/publication (Stories 17 & 18 admin)
 */
class RetakeService {
  private transformPagination<T>(response: BackendPaginatedResponse<T> | PaginatedResponse<T>): PaginatedResponse<T> {
    if ('meta' in response) {
      return {
        data: response.data,
        current_page: response.meta.current_page,
        last_page: response.meta.last_page,
        per_page: response.meta.per_page,
        total: response.meta.total,
        from: response.meta.from ?? 0,
        to: response.meta.to ?? 0,
      };
    }

    return response;
  }

  // ===== Story 17: Identification =====

  /**
   * Trigger retake identification for a semester
   * POST /api/admin/semesters/{semester}/retakes/identify
   */
  async identifyRetakes(semesterId: number, tenantId?: string): Promise<IdentifyRetakesResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<IdentifyRetakesResponse>>(
      `/admin/semesters/${semesterId}/retakes/identify`
    );

    return response.data.data ?? response.data;
  }

  /**
   * Get retake statistics for a semester
   * GET /api/admin/semesters/{semester}/retakes/statistics
   */
  async getStatistics(semesterId: number, tenantId?: string): Promise<RetakeStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RetakeStatistics>>(
      `/admin/semesters/${semesterId}/retakes/statistics`
    );

    return response.data.data;
  }

  /**
   * Get students with retakes for a semester
   * GET /api/admin/semesters/{semester}/retakes/students
   */
  async getStudentsList(
    semesterId: number,
    params?: { status?: string; page?: number; per_page?: number },
    tenantId?: string
  ): Promise<PaginatedResponse<RetakeStudentSummary>> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `/admin/semesters/${semesterId}/retakes/students`,
      { params }
    );

    return this.transformPagination(response.data);
  }

  /**
   * Get modules with retakes for a semester
   * GET /api/admin/semesters/{semester}/retakes/modules
   */
  async getModulesList(semesterId: number, tenantId?: string): Promise<RetakeModuleSummary[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RetakeModuleSummary[]>>(
      `/admin/semesters/${semesterId}/retakes/modules`
    );

    return response.data.data;
  }

  /**
   * Get students for a specific module's retake
   * GET /api/admin/modules/{module}/retake-students
   */
  async getModuleRetakeStudents(
    moduleId: number,
    params?: { semester_id?: number },
    tenantId?: string
  ): Promise<RetakeStudentEntry[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RetakeStudentEntry[]>>(
      `/admin/modules/${moduleId}/retake-students`,
      { params }
    );

    return response.data.data;
  }

  /**
   * Get retake modules for a specific student
   * GET /api/admin/students/{student}/retake-modules
   */
  async getStudentRetakeModules(
    studentId: number,
    params?: { semester_id?: number },
    tenantId?: string
  ): Promise<RetakeEnrollment[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RetakeEnrollment[]>>(
      `/admin/students/${studentId}/retake-modules`,
      { params }
    );

    return response.data.data;
  }

  /**
   * Get single retake enrollment details
   * GET /api/admin/retake-enrollments/{retakeEnrollment}
   */
  async getEnrollment(enrollmentId: number, tenantId?: string): Promise<RetakeEnrollment> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RetakeEnrollment>>(
      `/admin/retake-enrollments/${enrollmentId}`
    );

    return response.data.data;
  }

  /**
   * Schedule a retake enrollment
   * POST /api/admin/retake-enrollments/{retakeEnrollment}/schedule
   */
  async scheduleEnrollment(
    enrollmentId: number,
    scheduledAt?: string,
    tenantId?: string
  ): Promise<RetakeEnrollment> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<RetakeEnrollment>>(
      `/admin/retake-enrollments/${enrollmentId}/schedule`,
      { scheduled_at: scheduledAt }
    );

    return response.data.data;
  }

  /**
   * Cancel a retake enrollment
   * POST /api/admin/retake-enrollments/{retakeEnrollment}/cancel
   */
  async cancelEnrollment(enrollmentId: number, tenantId?: string): Promise<RetakeEnrollment> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<RetakeEnrollment>>(
      `/admin/retake-enrollments/${enrollmentId}/cancel`
    );

    return response.data.data;
  }

  /**
   * Export retake students as Excel
   * GET /api/admin/semesters/{semester}/retakes/students/export
   */
  async exportStudents(
    semesterId: number,
    params?: { module_id?: number },
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `/admin/semesters/${semesterId}/retakes/students/export`,
      { params, responseType: 'blob' }
    );

    return response.data;
  }

  // ===== Story 18 Admin: Retake Grade Validation & Publication =====

  /**
   * Get pending retake grades for validation
   * GET /api/admin/semesters/{semester}/retake-grades/pending
   */
  async getPendingGrades(
    semesterId: number,
    params?: { module_id?: number; page?: number; per_page?: number },
    tenantId?: string
  ): Promise<PaginatedResponse<RetakeStudentEntry>> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `/admin/semesters/${semesterId}/retake-grades/pending`,
      { params }
    );

    return this.transformPagination(response.data);
  }

  /**
   * Get modules with pending retake grades
   * GET /api/admin/semesters/{semester}/retake-grades/modules-pending
   */
  async getModulesPendingGrades(semesterId: number, tenantId?: string): Promise<RetakeModuleSummary[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RetakeModuleSummary[]>>(
      `/admin/semesters/${semesterId}/retake-grades/modules-pending`
    );

    return response.data.data;
  }

  /**
   * Validate retake grades for a module
   * POST /api/admin/modules/{module}/semesters/{semester}/retake-grades/validate
   */
  async validateGrades(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<ValidateRetakeGradesResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<ValidateRetakeGradesResponse>(
      `/admin/modules/${moduleId}/semesters/${semesterId}/retake-grades/validate`
    );

    return response.data;
  }

  /**
   * Publish retake grades for a module
   * POST /api/admin/modules/{module}/semesters/{semester}/retake-grades/publish
   */
  async publishGrades(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<PublishRetakeGradesResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<PublishRetakeGradesResponse>(
      `/admin/modules/${moduleId}/semesters/${semesterId}/retake-grades/publish`
    );

    return response.data;
  }

  /**
   * Get retake grade statistics for a module
   * GET /api/admin/modules/{module}/semesters/{semester}/retake-grades/statistics
   */
  async getGradeStatistics(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<RetakeGradeStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RetakeGradeStatistics>>(
      `/admin/modules/${moduleId}/semesters/${semesterId}/retake-grades/statistics`
    );

    return response.data.data;
  }

  /**
   * Bulk validate retake grades
   * POST /api/admin/semesters/{semester}/retake-grades/bulk-validate
   */
  async bulkValidateGrades(
    semesterId: number,
    gradeIds: number[],
    tenantId?: string
  ): Promise<ValidateRetakeGradesResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<ValidateRetakeGradesResponse>(
      `/admin/semesters/${semesterId}/retake-grades/bulk-validate`,
      { grade_ids: gradeIds }
    );

    return response.data;
  }

  /**
   * Reject a retake grade (send back to teacher)
   * POST /api/admin/retake-grades/{retakeGrade}/reject
   */
  async rejectGrade(gradeId: number, tenantId?: string): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string }>(
      `/admin/retake-grades/${gradeId}/reject`
    );

    return response.data;
  }
}

export const retakeService = new RetakeService();
