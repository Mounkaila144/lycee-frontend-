import { createApiClient } from '@/shared/lib/api-client';
import type {
  TeacherModule,
  Evaluation,
  StudentGradeEntry,
  BatchGradeRequest,
  GradeStatistics,
  PublishGradesRequest,
  PublishGradesResponse,
  ImportGradesPreviewResponse,
  ImportGradesExecuteRequest,
  ImportGradesResult,
} from '../../types/grade.types';

/**
 * Response wrapper for API responses
 */
interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Paginated response
 */
interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Teacher Grade Service
 * Handles all API communication for teacher grade entry
 * API routes: /frontend/teacher/...
 */
class TeacherGradeService {
  private baseUrl = '/frontend/teacher';

  /**
   * Get all modules assigned to the current teacher
   */
  async getMyModules(tenantId?: string): Promise<TeacherModule[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<TeacherModule[]>>(
        `${this.baseUrl}/my-modules`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching teacher modules:', error);
      throw error;
    }
  }

  /**
   * Get evaluations for a specific module
   */
  async getModuleEvaluations(
    moduleId: number,
    tenantId?: string
  ): Promise<Evaluation[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<Evaluation[]>>(
        `${this.baseUrl}/modules/${moduleId}/evaluations`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching evaluations for module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Get students list with their grades for an evaluation
   */
  async getEvaluationStudents(
    evaluationId: number,
    tenantId?: string
  ): Promise<StudentGradeEntry[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<any[]>>(
        `${this.baseUrl}/evaluations/${evaluationId}/students`
      );

      // Transform flat API response to nested structure expected by frontend
      const transformed: StudentGradeEntry[] = response.data.data.map((item: any) => ({
        student: {
          id: item.student_id,
          matricule: item.matricule,
          firstname: item.firstname,
          lastname: item.lastname,
          full_name: item.full_name,
        },
        grade: item.grade,
        score: item.grade?.score ?? null,
        is_absent: item.grade?.is_absent ?? false,
        comment: item.grade?.comment ?? null,
        is_modified: false,
      }));

      return transformed;
    } catch (error) {
      console.error(`Error fetching students for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Save grades in batch
   */
  async saveGradesBatch(
    data: BatchGradeRequest,
    tenantId?: string
  ): Promise<{ saved: number; message: string }> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<{ saved: number; message: string }>>(
        `${this.baseUrl}/grades/batch`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error saving grades batch:', error);
      throw error;
    }
  }

  /**
   * Get statistics for an evaluation
   */
  async getEvaluationStatistics(
    evaluationId: number,
    tenantId?: string
  ): Promise<GradeStatistics> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<GradeStatistics>>(
        `${this.baseUrl}/evaluations/${evaluationId}/statistics`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching statistics for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Publish grades for an evaluation
   */
  async publishGrades(
    data: PublishGradesRequest,
    tenantId?: string
  ): Promise<PublishGradesResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<PublishGradesResponse>>(
        `${this.baseUrl}/evaluations/${data.evaluation_id}/publish`,
        { notify_students: data.notify_students ?? true }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error publishing grades for evaluation ${data.evaluation_id}:`, error);
      throw error;
    }
  }

  /**
   * Export grades template (empty or with current grades)
   */
  async exportGradesTemplate(
    evaluationId: number,
    tenantId?: string
  ): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(
        `${this.baseUrl}/evaluations/${evaluationId}/export`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error exporting grades for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Export absent students list
   */
  async exportAbsentStudents(
    evaluationId: number,
    tenantId?: string
  ): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(
        `${this.baseUrl}/evaluations/${evaluationId}/export-absents`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error exporting absent students for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Upload and preview grades import
   */
  async previewGradesImport(
    evaluationId: number,
    file: File,
    tenantId?: string
  ): Promise<ImportGradesPreviewResponse> {
    try {
      const client = createApiClient(tenantId);
      const formData = new FormData();
      formData.append('file', file);

      const response = await client.post<ApiResponse<ImportGradesPreviewResponse>>(
        `${this.baseUrl}/evaluations/${evaluationId}/import/preview`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error previewing grades import for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Execute grades import
   */
  async importGrades(
    data: ImportGradesExecuteRequest,
    tenantId?: string
  ): Promise<ImportGradesResult> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<ImportGradesResult>>(
        `${this.baseUrl}/evaluations/${data.evaluation_id}/import`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error importing grades for evaluation ${data.evaluation_id}:`, error);
      throw error;
    }
  }

  /**
   * Check if all grades are entered (completeness check)
   */
  async checkCompleteness(
    evaluationId: number,
    tenantId?: string
  ): Promise<{
    is_complete: boolean;
    total_students: number;
    entered_count: number;
    missing_count: number;
    absent_count: number;
  }> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<
        ApiResponse<{
          is_complete: boolean;
          total_students: number;
          entered_count: number;
          missing_count: number;
          absent_count: number;
        }>
      >(`${this.baseUrl}/evaluations/${evaluationId}/check-completeness`);

      return response.data.data;
    } catch (error) {
      console.error(`Error checking completeness for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const teacherGradeService = new TeacherGradeService();
