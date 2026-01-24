import { createApiClient } from '@/shared/lib/api-client';

import type {
  Reenrollment,
  ReenrollmentFormData,
  ReenrollmentFilters,
  EligibilityCheck,
  EligibilityCheckRequest,
  GlobalStatistics,
  BatchValidateRequest,
  BatchValidateResult,
} from '../../types/reenrollment.types';

/**
 * Paginated Reenrollments Response
 */
export interface PaginatedReenrollmentsResponse {
  data: Reenrollment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Reenrollment Query Params
 */
export interface ReenrollmentQueryParams extends ReenrollmentFilters {
  page?: number;
  per_page?: number;
}

/**
 * Reenrollment Response (single)
 */
export interface ReenrollmentResponse {
  data: Reenrollment;
  message?: string;
}

/**
 * Reenrollment Service
 * Handles all API communication related to reenrollments (admin)
 */
class ReenrollmentService {
  private baseUrl = '/admin/enrollment/reenrollments';

  /**
   * Fetch paginated reenrollments with filters
   */
  async getReenrollments(
    tenantId?: string,
    params?: ReenrollmentQueryParams
  ): Promise<PaginatedReenrollmentsResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      if (params?.per_page) {
        queryParams.append('per_page', String(params.per_page));
      }

      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      if (params?.campaign_id) {
        queryParams.append('campaign_id', String(params.campaign_id));
      }

      if (params?.status) {
        queryParams.append('status', params.status);
      }

      if (params?.eligibility_status) {
        queryParams.append('eligibility_status', params.eligibility_status);
      }

      if (params?.is_redoing) {
        queryParams.append('is_redoing', 'true');
      }

      if (params?.is_reorientation) {
        queryParams.append('is_reorientation', 'true');
      }

      if (params?.search) {
        queryParams.append('search', params.search);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await client.get<PaginatedReenrollmentsResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching reenrollments:', error);
      throw error;
    }
  }

  /**
   * Get reenrollment by ID
   */
  async getById(id: number, tenantId?: string): Promise<Reenrollment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ReenrollmentResponse>(`${this.baseUrl}/${id}`);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching reenrollment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new reenrollment (admin)
   */
  async create(data: ReenrollmentFormData, tenantId?: string): Promise<Reenrollment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ReenrollmentResponse>(this.baseUrl, data);

      return response.data.data;
    } catch (error) {
      console.error('Error creating reenrollment:', error);
      throw error;
    }
  }

  /**
   * Check student eligibility for a campaign
   */
  async checkEligibility(data: EligibilityCheckRequest, tenantId?: string): Promise<EligibilityCheck> {
    try {
      const client = createApiClient(tenantId);

      // API response structure
      interface ApiEligibilityResponse {
        is_eligible: boolean;
        checks: {
          is_active: { passed: boolean; label: string };
          has_previous_enrollment: { passed: boolean; label: string };
          has_min_ects: { passed: boolean; label: string; details?: string };
          financial_clearance: { passed: boolean; label: string };
          no_disciplinary_exclusion: { passed: boolean; label: string };
          program_eligible: { passed: boolean; label: string };
          level_eligible: { passed: boolean; label: string };
        };
        validated_ects: number;
        required_ects: number;
      }

      const response = await client.post<{ data: ApiEligibilityResponse }>(`${this.baseUrl}/check-eligibility`, data);
      const apiData = response.data.data;

      // Transform API response to flat EligibilityCheck structure
      const eligibility: EligibilityCheck = {
        is_eligible: apiData.is_eligible,
        is_active: apiData.checks.is_active.passed,
        has_previous_enrollment: apiData.checks.has_previous_enrollment.passed,
        has_min_ects: apiData.checks.has_min_ects.passed,
        validated_ects: apiData.validated_ects,
        required_ects: apiData.required_ects,
        financial_clearance: apiData.checks.financial_clearance.passed,
        no_disciplinary_exclusion: apiData.checks.no_disciplinary_exclusion.passed,
        program_eligible: apiData.checks.program_eligible.passed,
        level_eligible: apiData.checks.level_eligible.passed,
      };

      return eligibility;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      throw error;
    }
  }

  /**
   * Validate a reenrollment
   */
  async validate(id: number, tenantId?: string): Promise<Reenrollment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ReenrollmentResponse>(`${this.baseUrl}/${id}/validate`);

      return response.data.data;
    } catch (error) {
      console.error(`Error validating reenrollment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reject a reenrollment
   */
  async reject(id: number, reason: string, tenantId?: string): Promise<Reenrollment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ReenrollmentResponse>(`${this.baseUrl}/${id}/reject`, { reason });

      return response.data.data;
    } catch (error) {
      console.error(`Error rejecting reenrollment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Batch validate reenrollments
   */
  async batchValidate(data: BatchValidateRequest, tenantId?: string): Promise<BatchValidateResult> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; data: BatchValidateResult }>(
        `${this.baseUrl}/batch-validate`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error batch validating reenrollments:', error);
      throw error;
    }
  }

  /**
   * Get global statistics
   */
  async getStatistics(campaignId?: number, tenantId?: string): Promise<GlobalStatistics> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = campaignId ? `?campaign_id=${campaignId}` : '';
      const response = await client.get<{ data: GlobalStatistics }>(`${this.baseUrl}/statistics${queryParams}`);

      return response.data.data;
    } catch (error) {
      console.error('Error fetching reenrollment statistics:', error);
      throw error;
    }
  }

  /**
   * Download confirmation PDF
   */
  async downloadConfirmation(id: number, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.baseUrl}/${id}/confirmation`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error(`Error downloading confirmation PDF for reenrollment ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const reenrollmentService = new ReenrollmentService();
