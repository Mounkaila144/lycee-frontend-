import { createApiClient } from '@/shared/lib/api-client';
import type {
  GradeValidation,
  GradeValidationFilters,
  ValidateGradesRequest,
  ValidateGradesResponse,
  PublishGradesRequest,
  PublishGradesResponse,
  BulkPublishRequest,
  BulkPublishResponse,
  ValidationStatisticsSummary,
  CorrectionRequest,
  CorrectionRequestFilters,
  ReviewCorrectionRequest,
  AuditTrailEntry,
} from '../../types/validation.types';

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
  from: number;
  to: number;
}

/**
 * Grade Validation Service (Admin)
 * Handles grade validation, rejection, and publication
 * API routes: /admin/grade-validations/...
 */
class GradeValidationService {
  private baseUrl = '/admin/grade-validations';
  private correctionsUrl = '/admin/correction-requests';

  /**
   * Get all grade validations with filters and pagination
   * GET /api/admin/grade-validations
   */
  async getValidations(
    filters?: GradeValidationFilters,
    page: number = 1,
    perPage: number = 15,
    tenantId?: string
  ): Promise<PaginatedResponse<GradeValidation>> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<PaginatedResponse<GradeValidation>>(
        this.baseUrl,
        {
          params: {
            ...filters,
            page,
            per_page: perPage,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching grade validations:', error);
      throw error;
    }
  }

  /**
   * Get validation statistics summary
   * GET /api/admin/grade-validations/statistics
   */
  async getStatistics(
    filters?: Pick<GradeValidationFilters, 'academic_year_id' | 'semester_id'>,
    tenantId?: string
  ): Promise<ValidationStatisticsSummary> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<ValidationStatisticsSummary>>(
        `${this.baseUrl}/statistics`,
        { params: filters }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching validation statistics:', error);
      throw error;
    }
  }

  /**
   * Get single validation details
   * GET /api/admin/grade-validations/{validation}
   */
  async getValidation(
    validationId: number,
    tenantId?: string
  ): Promise<GradeValidation> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<GradeValidation>>(
        `${this.baseUrl}/${validationId}`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching validation ${validationId}:`, error);
      throw error;
    }
  }

  /**
   * Validate (approve) grades
   * POST /api/admin/grade-validations/{validation}/validate
   */
  async validateGrades(
    validationId: number,
    data: ValidateGradesRequest,
    tenantId?: string
  ): Promise<ValidateGradesResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<ValidateGradesResponse>>(
        `${this.baseUrl}/${validationId}/validate`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error validating grades ${validationId}:`, error);
      throw error;
    }
  }

  /**
   * Reject grades
   * POST /api/admin/grade-validations/{validation}/reject
   */
  async rejectGrades(
    validationId: number,
    data: ValidateGradesRequest,
    tenantId?: string
  ): Promise<ValidateGradesResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<ValidateGradesResponse>>(
        `${this.baseUrl}/${validationId}/reject`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error rejecting grades ${validationId}:`, error);
      throw error;
    }
  }

  /**
   * Publish grades to students
   * POST /api/admin/grade-validations/{validation}/publish
   */
  async publishGrades(
    validationId: number,
    data?: Omit<PublishGradesRequest, 'validation_id'>,
    tenantId?: string
  ): Promise<PublishGradesResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<PublishGradesResponse>>(
        `${this.baseUrl}/${validationId}/publish`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error publishing grades ${validationId}:`, error);
      throw error;
    }
  }

  /**
   * Bulk publish multiple validations
   * POST /api/admin/grade-validations/bulk-publish
   */
  async bulkPublish(
    data: BulkPublishRequest,
    tenantId?: string
  ): Promise<BulkPublishResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<BulkPublishResponse>>(
        `${this.baseUrl}/bulk-publish`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error bulk publishing grades:', error);
      throw error;
    }
  }

  /**
   * Get audit trail for a module
   * GET /api/admin/modules/{module}/audit-trail
   */
  async getModuleAuditTrail(
    moduleId: number,
    params?: {
      page?: number;
      per_page?: number;
      date_from?: string;
      date_to?: string;
    },
    tenantId?: string
  ): Promise<PaginatedResponse<AuditTrailEntry>> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<PaginatedResponse<AuditTrailEntry>>(
        `/admin/modules/${moduleId}/audit-trail`,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching audit trail for module ${moduleId}:`, error);
      throw error;
    }
  }

  // ===== Correction Requests Management =====

  /**
   * Get all correction requests
   * GET /api/admin/correction-requests
   */
  async getCorrectionRequests(
    filters?: CorrectionRequestFilters,
    page: number = 1,
    perPage: number = 15,
    tenantId?: string
  ): Promise<PaginatedResponse<CorrectionRequest>> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<PaginatedResponse<CorrectionRequest>>(
        this.correctionsUrl,
        {
          params: {
            ...filters,
            page,
            per_page: perPage,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching correction requests:', error);
      throw error;
    }
  }

  /**
   * Get single correction request
   * GET /api/admin/correction-requests/{request}
   */
  async getCorrectionRequest(
    requestId: number,
    tenantId?: string
  ): Promise<CorrectionRequest> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<CorrectionRequest>>(
        `${this.correctionsUrl}/${requestId}`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching correction request ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Approve correction request
   * POST /api/admin/correction-requests/{request}/approve
   */
  async approveCorrectionRequest(
    requestId: number,
    data?: { notes?: string },
    tenantId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<{ success: boolean; message: string }>>(
        `${this.correctionsUrl}/${requestId}/approve`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error approving correction request ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Reject correction request
   * POST /api/admin/correction-requests/{request}/reject
   */
  async rejectCorrectionRequest(
    requestId: number,
    data: { notes: string },
    tenantId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<{ success: boolean; message: string }>>(
        `${this.correctionsUrl}/${requestId}/reject`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error rejecting correction request ${requestId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const gradeValidationService = new GradeValidationService();
