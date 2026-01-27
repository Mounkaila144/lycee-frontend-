import { createApiClient } from '@/shared/lib/api-client';
import type {
  SubmitGradesRequest,
  SubmitGradesResponse,
  SubmissionStatus,
  PreSubmissionCheck,
} from '../../types/validation.types';

/**
 * Response wrapper for API responses
 */
interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Grade Submission Service (Teacher)
 * Handles grade submission for validation
 * API routes: /frontend/teacher/grades/...
 */
class GradeSubmissionService {
  private baseUrl = '/frontend/teacher/grades';

  /**
   * Submit grades for validation
   * POST /api/frontend/teacher/grades/submit
   */
  async submitGrades(
    data: SubmitGradesRequest,
    tenantId?: string
  ): Promise<SubmitGradesResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<SubmitGradesResponse>>(
        `${this.baseUrl}/submit`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error submitting grades for validation:', error);
      throw error;
    }
  }

  /**
   * Get submission status for module/evaluation
   * GET /api/frontend/teacher/grades/submission-status
   */
  async getSubmissionStatus(
    params: {
      module_id: number;
      evaluation_id?: number;
      academic_year_id: number;
    },
    tenantId?: string
  ): Promise<SubmissionStatus> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<SubmissionStatus>>(
        `${this.baseUrl}/submission-status`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching submission status:', error);
      throw error;
    }
  }

  /**
   * Perform pre-submission checks
   * Validates that grades can be submitted
   */
  async performPreSubmissionCheck(
    data: SubmitGradesRequest,
    tenantId?: string
  ): Promise<PreSubmissionCheck> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<PreSubmissionCheck>>(
        `${this.baseUrl}/pre-check`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error performing pre-submission check:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const gradeSubmissionService = new GradeSubmissionService();
