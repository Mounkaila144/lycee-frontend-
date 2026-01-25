import { createApiClient } from '@/shared/lib/api-client';

import type {
  ModuleExemption,
  ExemptionFormData,
  ExemptionFilters,
  ExemptionStatistics,
  TeacherReviewData,
  ExemptionValidationData,
  ExemptionRevokeData,
} from '../../types/exemption.types';

/**
 * Paginated Exemptions Response
 */
export interface PaginatedExemptionsResponse {
  data: ModuleExemption[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Exemption Query Params
 */
export interface ExemptionQueryParams extends ExemptionFilters {
  page?: number;
  per_page?: number;
}

/**
 * Exemption Response (single)
 */
export interface ExemptionResponse {
  data: ModuleExemption;
  message?: string;
}

/**
 * Exemption Service
 * Handles all API communication related to module exemptions (admin)
 */
class ExemptionService {
  private baseUrl = '/admin/enrollment/exemptions';

  /**
   * Fetch paginated exemptions with filters
   */
  async getExemptions(tenantId?: string, params?: ExemptionQueryParams): Promise<PaginatedExemptionsResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      if (params?.per_page) {
        queryParams.append('per_page', String(params.per_page));
      }

      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      if (params?.status) {
        queryParams.append('status', params.status);
      }

      if (params?.academic_year_id) {
        queryParams.append('academic_year_id', String(params.academic_year_id));
      }

      if (params?.reason_category) {
        queryParams.append('reason_category', params.reason_category);
      }

      if (params?.student_id) {
        queryParams.append('student_id', String(params.student_id));
      }

      if (params?.module_id) {
        queryParams.append('module_id', String(params.module_id));
      }

      if (params?.search) {
        queryParams.append('search', params.search);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await client.get<PaginatedExemptionsResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching exemptions:', error);
      throw error;
    }
  }

  /**
   * Get exemption by ID
   */
  async getById(id: number, tenantId?: string): Promise<ModuleExemption> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ExemptionResponse>(`${this.baseUrl}/${id}`);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching exemption ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new exemption request (admin)
   */
  async create(data: ExemptionFormData, documents?: File[], tenantId?: string): Promise<ModuleExemption> {
    try {
      const client = createApiClient(tenantId);

      const formData = new FormData();

      // Add all exemption data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Add documents if provided
      if (documents && documents.length > 0) {
        documents.forEach(doc => {
          formData.append('documents[]', doc);
        });
      }

      const response = await client.post<ExemptionResponse>(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error creating exemption:', error);
      throw error;
    }
  }

  /**
   * Submit teacher review
   */
  async teacherReview(id: number, data: TeacherReviewData, tenantId?: string): Promise<ModuleExemption> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ExemptionResponse>(`${this.baseUrl}/${id}/teacher-review`, data);

      return response.data.data;
    } catch (error) {
      console.error(`Error submitting teacher review for exemption ${id}:`, error);
      throw error;
    }
  }

  /**
   * Validate/Reject an exemption
   */
  async validate(id: number, data: ExemptionValidationData, tenantId?: string): Promise<ModuleExemption> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ExemptionResponse>(`${this.baseUrl}/${id}/validate`, data);

      return response.data.data;
    } catch (error) {
      console.error(`Error validating exemption ${id}:`, error);
      throw error;
    }
  }

  /**
   * Revoke an exemption
   */
  async revoke(id: number, data: ExemptionRevokeData, tenantId?: string): Promise<ModuleExemption> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ExemptionResponse>(`${this.baseUrl}/${id}/revoke`, data);

      return response.data.data;
    } catch (error) {
      console.error(`Error revoking exemption ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get pending exemptions
   */
  async getPending(academicYearId?: number, tenantId?: string): Promise<ModuleExemption[]> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = academicYearId ? `?academic_year_id=${academicYearId}` : '';
      const response = await client.get<{ data: ModuleExemption[] }>(`${this.baseUrl}/pending${queryParams}`);

      return response.data.data;
    } catch (error) {
      console.error('Error fetching pending exemptions:', error);
      throw error;
    }
  }

  /**
   * Download exemption certificate PDF
   */
  async downloadCertificate(id: number, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.baseUrl}/${id}/certificate`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error(`Error downloading certificate for exemption ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get exemption statistics
   */
  async getStatistics(academicYearId?: number, tenantId?: string): Promise<ExemptionStatistics> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = academicYearId ? `?academic_year_id=${academicYearId}` : '';
      const response = await client.get<{ data: ExemptionStatistics }>(`${this.baseUrl}/statistics${queryParams}`);

      return response.data.data;
    } catch (error) {
      console.error('Error fetching exemption statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const exemptionService = new ExemptionService();
