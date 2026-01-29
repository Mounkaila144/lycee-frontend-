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
 * Backend simplified submission status response
 */
interface BackendSubmissionStatus {
  module_id: number;
  module_name?: string;
  evaluation_id?: number;
  can_submit: boolean;
  errors: string[];
  warnings: string[];
  status?: string;
  submitted_at?: string | null;
  validated_at?: string | null;
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
      const response = await client.get<
        ApiResponse<BackendSubmissionStatus | BackendSubmissionStatus[]>
      >(`${this.baseUrl}/submission-status`, { params });

      // Backend returns an array, get the first element
      const backendData = response.data.data;
      const data = Array.isArray(backendData) ? backendData[0] : backendData;

      // Transform backend response to expected format
      const submissionStatus: SubmissionStatus = {
        module_id: data.module_id,
        evaluation_id: data.evaluation_id ?? params.evaluation_id ?? null,
        status: (data.status as any) ?? 'Draft',
        submitted_at: data.submitted_at ?? null,
        validated_at: data.validated_at ?? null,
        can_edit: !data.status || data.status === 'Draft',
        can_submit: data.can_submit,
        validation_id: null,
        // Build pre_check from errors/warnings
        pre_check:
          data.errors.length > 0 || data.warnings.length > 0
            ? {
                can_submit: data.can_submit,
                checks: {
                  all_grades_entered: data.errors.length === 0,
                  valid_grade_range: true,
                  no_anomalies: data.warnings.length === 0,
                },
                errors: data.errors,
                warnings: data.warnings,
                statistics: null,
              }
            : undefined,
      };

      return submissionStatus;
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
