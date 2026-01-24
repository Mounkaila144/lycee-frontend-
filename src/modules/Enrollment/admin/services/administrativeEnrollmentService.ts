import { createApiClient } from '@/shared/lib/api-client';

import type {
  AdministrativeEnrollment,
  AdministrativeEnrollmentQueryParams,
  PaginatedAdministrativeEnrollmentsResponse,
  AdministrativeEnrollmentResponse,
  CreateAdministrativeEnrollmentRequest,
  CreateAdministrativeEnrollmentResponse,
  UpdateAdministrativeEnrollmentRequest,
  AvailableModulesForEnrollmentResponse,
  AddModulesToEnrollmentRequest,
  AddModulesToEnrollmentResponse,
  RemoveModulesFromEnrollmentRequest,
  RemoveModulesFromEnrollmentResponse,
  AdministrativeEnrollmentStatistics,
} from '../../types/administrativeEnrollment.types';

/**
 * Administrative Enrollment Service
 * Handles all API communication related to administrative enrollments (StudentEnrollment)
 */
class AdministrativeEnrollmentService {
  private baseUrl = '/admin/enrollment/enrollments';

  /**
   * Fetch paginated enrollments with filters
   */
  async getEnrollments(
    tenantId?: string,
    params?: AdministrativeEnrollmentQueryParams
  ): Promise<PaginatedAdministrativeEnrollmentsResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      if (params?.per_page) {
        queryParams.append('per_page', String(params.per_page));
      }

      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      if (params?.student_id) {
        queryParams.append('student_id', String(params.student_id));
      }

      if (params?.programme_id) {
        queryParams.append('programme_id', String(params.programme_id));
      }

      if (params?.semester_id) {
        queryParams.append('semester_id', String(params.semester_id));
      }

      if (params?.academic_year_id) {
        queryParams.append('academic_year_id', String(params.academic_year_id));
      }

      if (params?.level) {
        queryParams.append('level', params.level);
      }

      if (params?.status) {
        queryParams.append('status', params.status);
      }

      if (params?.sort_by) {
        queryParams.append('sort_by', params.sort_by);
      }

      if (params?.sort_order) {
        queryParams.append('sort_order', params.sort_order);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await client.get<PaginatedAdministrativeEnrollmentsResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching administrative enrollments:', error);
      throw error;
    }
  }

  /**
   * Get enrollment by ID
   */
  async getById(id: number, tenantId?: string): Promise<AdministrativeEnrollment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<AdministrativeEnrollmentResponse>(`${this.baseUrl}/${id}`);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching enrollment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new enrollment
   */
  async create(
    data: CreateAdministrativeEnrollmentRequest,
    tenantId?: string
  ): Promise<CreateAdministrativeEnrollmentResponse['data']> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<CreateAdministrativeEnrollmentResponse>(this.baseUrl, data);

      return response.data.data;
    } catch (error) {
      console.error('Error creating administrative enrollment:', error);
      throw error;
    }
  }

  /**
   * Update enrollment
   */
  async update(
    id: number,
    data: UpdateAdministrativeEnrollmentRequest,
    tenantId?: string
  ): Promise<AdministrativeEnrollment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.put<AdministrativeEnrollmentResponse>(`${this.baseUrl}/${id}`, data);

      return response.data.data;
    } catch (error) {
      console.error(`Error updating enrollment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete enrollment
   */
  async delete(id: number, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting enrollment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get available modules for enrollment
   */
  async getAvailableModules(
    programmeId: number,
    level: string,
    semesterId: number,
    studentId?: number,
    tenantId?: string
  ): Promise<AvailableModulesForEnrollmentResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams({
        programme_id: String(programmeId),
        level,
        semester_id: String(semesterId),
      });

      if (studentId) {
        queryParams.append('student_id', String(studentId));
      }

      const response = await client.get<AvailableModulesForEnrollmentResponse>(
        `${this.baseUrl}/available-modules?${queryParams.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching available modules:', error);
      throw error;
    }
  }

  /**
   * Add modules to an enrollment
   */
  async addModules(
    enrollmentId: number,
    data: AddModulesToEnrollmentRequest,
    tenantId?: string
  ): Promise<AddModulesToEnrollmentResponse['data']> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<AddModulesToEnrollmentResponse>(
        `${this.baseUrl}/${enrollmentId}/modules`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error adding modules to enrollment ${enrollmentId}:`, error);
      throw error;
    }
  }

  /**
   * Remove modules from an enrollment
   */
  async removeModules(
    enrollmentId: number,
    data: RemoveModulesFromEnrollmentRequest,
    tenantId?: string
  ): Promise<RemoveModulesFromEnrollmentResponse['data']> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.delete<RemoveModulesFromEnrollmentResponse>(
        `${this.baseUrl}/${enrollmentId}/modules`,
        { data }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error removing modules from enrollment ${enrollmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get enrollment statistics
   */
  async getStatistics(
    programmeId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<AdministrativeEnrollmentStatistics> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams({
        programme_id: String(programmeId),
        semester_id: String(semesterId),
      });

      const response = await client.get<{ data: AdministrativeEnrollmentStatistics }>(
        `${this.baseUrl}/statistics?${queryParams.toString()}`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching enrollment statistics:', error);
      throw error;
    }
  }

  /**
   * Download enrollment sheet PDF
   */
  async downloadEnrollmentSheet(enrollmentId: number, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.baseUrl}/${enrollmentId}/sheet`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error(`Error downloading enrollment sheet ${enrollmentId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const administrativeEnrollmentService = new AdministrativeEnrollmentService();
