import { createApiClient } from '@/shared/lib/api-client';
import type {
  TeacherRetakeModule,
  RetakeStudentEntry,
  RetakeGradeStatistics,
  StoreRetakeGradeRequest,
  StoreRetakeGradesBatchRequest,
  SubmitRetakeGradesResponse,
  RetakeSubmissionCheck,
} from '../../types/retake.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Teacher Retake Grade Service (Story 18)
 * Handles teacher-side retake grade entry and submission
 * API routes: /frontend/teacher/...
 */
class RetakeGradeService {
  private baseUrl = '/frontend/teacher';

  /**
   * Get teacher's modules with retake students
   * GET /api/frontend/teacher/retake-modules
   */
  async getMyRetakeModules(
    params?: { semester_id?: number },
    tenantId?: string
  ): Promise<TeacherRetakeModule[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<TeacherRetakeModule[]>>(
      `${this.baseUrl}/retake-modules`,
      { params }
    );

    return response.data.data;
  }

  /**
   * Get retake students for a module
   * GET /api/frontend/teacher/modules/{module}/retake-students
   */
  async getModuleRetakeStudents(
    moduleId: number,
    params?: { semester_id?: number },
    tenantId?: string
  ): Promise<RetakeStudentEntry[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RetakeStudentEntry[]>>(
      `${this.baseUrl}/modules/${moduleId}/retake-students`,
      { params }
    );

    return response.data.data;
  }

  /**
   * Store a single retake grade
   * POST /api/frontend/teacher/retake-grades
   */
  async storeGrade(data: StoreRetakeGradeRequest, tenantId?: string): Promise<RetakeStudentEntry> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<RetakeStudentEntry>>(
      `${this.baseUrl}/retake-grades`,
      data
    );

    return response.data.data;
  }

  /**
   * Store batch retake grades
   * POST /api/frontend/teacher/retake-grades/batch
   */
  async storeBatchGrades(
    data: StoreRetakeGradesBatchRequest,
    tenantId?: string
  ): Promise<RetakeStudentEntry[]> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<RetakeStudentEntry[]>>(
      `${this.baseUrl}/retake-grades/batch`,
      data
    );

    return response.data.data;
  }

  /**
   * Submit retake grades for validation
   * POST /api/frontend/teacher/modules/{module}/submit-retake-grades
   */
  async submitGrades(
    moduleId: number,
    params?: { semester_id?: number },
    tenantId?: string
  ): Promise<SubmitRetakeGradesResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<SubmitRetakeGradesResponse>(
      `${this.baseUrl}/modules/${moduleId}/submit-retake-grades`,
      params
    );

    return response.data;
  }

  /**
   * Get retake statistics for a module
   * GET /api/frontend/teacher/modules/{module}/retake-statistics
   */
  async getStatistics(
    moduleId: number,
    params?: { semester_id?: number },
    tenantId?: string
  ): Promise<RetakeGradeStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RetakeGradeStatistics>>(
      `${this.baseUrl}/modules/${moduleId}/retake-statistics`,
      { params }
    );

    return response.data.data;
  }

  /**
   * Download retake grade template for a module
   * GET /api/frontend/teacher/modules/{module}/retake-template
   */
  async downloadTemplate(
    moduleId: number,
    params?: { semester_id?: number },
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `${this.baseUrl}/modules/${moduleId}/retake-template`,
      { params, responseType: 'blob' }
    );

    return response.data;
  }
}

export const retakeGradeService = new RetakeGradeService();
