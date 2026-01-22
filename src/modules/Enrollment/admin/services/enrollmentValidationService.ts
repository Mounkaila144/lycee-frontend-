import { createApiClient } from '@/shared/lib/api-client';

import type {
  PedagogicalEnrollment,
  ValidationChecklist,
  ValidateEnrollmentRequest,
  RejectEnrollmentRequest,
  BatchValidationRequest,
  BatchValidationResult,
  EnrollmentValidationQueryParams,
  PaginatedEnrollmentsValidationResponse,
  EnrollmentValidationStatistics,
  MyEnrollmentStatus,
} from '../../types/validation.types';

/**
 * Enrollment Response (single)
 */
export interface EnrollmentResponse {
  data: PedagogicalEnrollment;
  message?: string;
}

/**
 * Checklist Response
 */
export interface ChecklistResponse {
  data: ValidationChecklist;
}

/**
 * Enrollment Validation Service
 * Handles all API communication related to enrollment validation
 */
class EnrollmentValidationService {
  // Base URL for validation endpoints - matches backend routes
  private validationUrl = '/admin/enrollment/validation';
  // Base URL for general enrollment endpoints
  private enrollmentsUrl = '/admin/enrollment/enrollments';
  // Frontend URL for student access
  private frontendUrl = '/frontend/enrollment';

  /**
   * Fetch enrollments for validation
   * Uses /admin/enrollment/enrollments endpoint (StudentEnrollment table)
   * NOT /admin/enrollment/validation (PedagogicalEnrollment table - which is unused)
   */
  async getPendingEnrollments(
    tenantId?: string,
    params?: EnrollmentValidationQueryParams
  ): Promise<PaginatedEnrollmentsValidationResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      // Note: StudentEnrollment uses 'Actif' status, not 'Pending'
      // Filter by status if provided, otherwise show all active enrollments
      if (params?.status) {
        // Map frontend status to backend status
        const backendStatus = params.status === 'Pending' ? 'Actif' : params.status;
        queryParams.append('status', backendStatus);
      }

      if (params?.per_page) queryParams.append('per_page', String(params.per_page));
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.search) queryParams.append('search', params.search);
      if (params?.program_id) queryParams.append('programme_id', String(params.program_id));
      if (params?.level) queryParams.append('level', params.level);
      if (params?.academic_year_id) queryParams.append('academic_year_id', String(params.academic_year_id));
      if (params?.semester_id) queryParams.append('semester_id', String(params.semester_id));
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

      const queryString = queryParams.toString();
      const url = queryString ? `${this.enrollmentsUrl}?${queryString}` : this.enrollmentsUrl;

      const response = await client.get<any>(url);

      // Transform response to match expected format
      const data = response.data;

      // Debug: log the full API response structure
      console.log('[EnrollmentValidation] API URL:', url);
      console.log('[EnrollmentValidation] Full API response structure:', {
        hasData: !!data,
        hasDataArray: !!data?.data,
        dataArrayLength: data?.data?.length,
        firstItem: data?.data?.[0] ? {
          id: data.data[0].id,
          enrolled_modules_count: data.data[0].enrolled_modules_count,
          total_credits: data.data[0].total_credits,
          status: data.data[0].status,
        } : null,
      });

      return {
        data: data.data.map((enrollment: any) => this.transformEnrollment(enrollment)),
        current_page: data.current_page || data.meta?.current_page || 1,
        last_page: data.last_page || data.meta?.last_page || 1,
        per_page: data.per_page || data.meta?.per_page || 15,
        total: data.total || data.meta?.total || 0,
      };
    } catch (error) {
      console.error('Error fetching pending enrollments:', error);
      throw error;
    }
  }

  /**
   * Transform backend StudentEnrollment to frontend PedagogicalEnrollment format
   */
  private transformEnrollment(enrollment: any): PedagogicalEnrollment {
    // Map backend status to frontend status
    const mapStatus = (backendStatus: string): string => {
      switch (backendStatus) {
        case 'Actif':
          return 'Pending';
        case 'Validé':
          return 'Validated';
        case 'Rejeté':
          return 'Rejected';
        case 'Annulé':
          return 'Cancelled';
        default:
          return backendStatus;
      }
    };

    const transformed = {
      id: enrollment.id,
      student_id: enrollment.student_id,
      program_id: enrollment.programme_id || enrollment.program_id,
      level: enrollment.level,
      academic_year_id: enrollment.academic_year_id,
      semester_id: enrollment.semester_id,
      status: mapStatus(enrollment.status),
      total_modules: enrollment.enrolled_modules_count || enrollment.total_modules || 0,
      total_ects: enrollment.total_credits || enrollment.total_ects || 0,
      modules_check: true,
      groups_check: true,
      options_check: true,
      prerequisites_check: true,
      validated_by: enrollment.validated_by || enrollment.enrolled_by || null,
      validated_at: enrollment.validated_at || null,
      rejection_reason: enrollment.rejection_reason || null,
      contract_pdf_path: enrollment.contract_pdf_path || null,
      created_at: enrollment.created_at,
      updated_at: enrollment.updated_at,
      student: enrollment.student,
      program: enrollment.programme || enrollment.program,
      academic_year: enrollment.academic_year,
      semester: enrollment.semester,
    };

    return transformed;
  }

  /**
   * Fetch all enrollments with filters
   */
  async getEnrollments(
    tenantId?: string,
    params?: EnrollmentValidationQueryParams
  ): Promise<PaginatedEnrollmentsValidationResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      if (params?.per_page) queryParams.append('per_page', String(params.per_page));
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) {
        // Map frontend status to backend status
        const backendStatus = params.status === 'Pending' ? 'Actif' : params.status;
        queryParams.append('status', backendStatus);
      }
      if (params?.program_id) queryParams.append('programme_id', String(params.program_id));
      if (params?.level) queryParams.append('level', params.level);
      if (params?.academic_year_id) queryParams.append('academic_year_id', String(params.academic_year_id));
      if (params?.semester_id) queryParams.append('semester_id', String(params.semester_id));
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

      const queryString = queryParams.toString();
      const url = queryString ? `${this.enrollmentsUrl}?${queryString}` : this.enrollmentsUrl;

      const response = await client.get<any>(url);

      // Transform response to match expected format
      const data = response.data;

      return {
        data: data.data.map((enrollment: any) => this.transformEnrollment(enrollment)),
        current_page: data.current_page || data.meta?.current_page || 1,
        last_page: data.last_page || data.meta?.last_page || 1,
        per_page: data.per_page || data.meta?.per_page || 15,
        total: data.total || data.meta?.total || 0,
      };
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  }

  /**
   * Get enrollment by ID
   */
  async getById(id: number, tenantId?: string): Promise<PedagogicalEnrollment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<any>(`${this.enrollmentsUrl}/${id}`);

      return this.transformEnrollment(response.data.data);
    } catch (error) {
      console.error(`Error fetching enrollment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check enrollment completeness
   */
  async checkCompleteness(id: number, tenantId?: string): Promise<ValidationChecklist> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ChecklistResponse>(`${this.validationUrl}/${id}/check`);

      return response.data.data;
    } catch (error) {
      console.error(`Error checking enrollment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Validate enrollment
   * Uses /admin/enrollment/validation/{id}/validate
   * Note: Backend EnrollmentValidationController needs to be updated to use StudentEnrollment
   */
  async validate(data: ValidateEnrollmentRequest, tenantId?: string): Promise<PedagogicalEnrollment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<EnrollmentResponse>(
        `${this.validationUrl}/${data.enrollment_id}/validate`,
        { validation_notes: data.validation_notes }
      );

      return this.transformEnrollment(response.data.data);
    } catch (error) {
      console.error('Error validating enrollment:', error);
      throw error;
    }
  }

  /**
   * Reject enrollment
   * Uses /admin/enrollment/validation/{id}/reject
   * Note: Backend EnrollmentValidationController needs to be updated to use StudentEnrollment
   */
  async reject(data: RejectEnrollmentRequest, tenantId?: string): Promise<PedagogicalEnrollment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<EnrollmentResponse>(
        `${this.validationUrl}/${data.enrollment_id}/reject`,
        { rejection_reason: data.rejection_reason }
      );

      return this.transformEnrollment(response.data.data);
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      throw error;
    }
  }

  /**
   * Batch validate enrollments
   * Uses /admin/enrollment/validation/batch-validate
   */
  async batchValidate(data: BatchValidationRequest, tenantId?: string): Promise<BatchValidationResult> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ data: BatchValidationResult }>(
        `${this.validationUrl}/batch-validate`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error batch validating enrollments:', error);
      throw error;
    }
  }

  /**
   * Get validation statistics
   * Uses /admin/enrollment/enrollments/statistics endpoint
   */
  async getStatistics(academicYearId?: number, programId?: number, tenantId?: string): Promise<EnrollmentValidationStatistics> {
    try {
      const client = createApiClient(tenantId);

      const queryParams = new URLSearchParams();

      if (academicYearId) {
        queryParams.append('academic_year_id', String(academicYearId));
      }

      if (programId) {
        queryParams.append('programme_id', String(programId));
      }

      const queryString = queryParams.toString();
      const url = queryString ? `${this.enrollmentsUrl}/statistics?${queryString}` : `${this.enrollmentsUrl}/statistics`;

      const response = await client.get<any>(url);

      // Transform response to match expected format
      const data = response.data.data || response.data;

      return {
        total: data.total_enrollments || data.total || 0,
        by_status: {
          draft: 0,
          complete: 0,
          pending: data.by_status?.Actif || data.pending_enrollments || 0,
          validated: data.by_status?.Validé || data.confirmed_enrollments || 0,
          rejected: data.by_status?.Rejeté || 0,
          cancelled: data.by_status?.Annulé || 0,
        },
        by_program: data.by_program || [],
        validation_rate: data.validation_rate || 0,
        rejection_rate: data.rejection_rate || 0,
        average_validation_time_hours: data.average_validation_time_hours || 0,
      };
    } catch (error) {
      console.error('Error fetching validation statistics:', error);
      // Return default stats on error to avoid breaking the UI
      return {
        total: 0,
        by_status: { draft: 0, complete: 0, pending: 0, validated: 0, rejected: 0, cancelled: 0 },
        by_program: [],
        validation_rate: 0,
        rejection_rate: 0,
        average_validation_time_hours: 0,
      };
    }
  }

  /**
   * Download contract PDF
   * Uses /admin/enrollment/validation/{id}/contract
   */
  async downloadContract(enrollmentId: number, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.validationUrl}/${enrollmentId}/contract`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error(`Error downloading contract for enrollment ${enrollmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get my enrollment status (student frontend)
   */
  async getMyEnrollmentStatus(academicYearId?: number, tenantId?: string): Promise<MyEnrollmentStatus> {
    try {
      const client = createApiClient(tenantId);
      const params = academicYearId ? { academic_year_id: academicYearId } : {};
      const response = await client.get<{ data: MyEnrollmentStatus }>(
        `${this.frontendUrl}/my-enrollment/status`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching my enrollment status:', error);
      throw error;
    }
  }

  /**
   * Get my enrollment history (student frontend)
   */
  async getMyEnrollmentHistory(tenantId?: string): Promise<PedagogicalEnrollment[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: PedagogicalEnrollment[] }>(
        `${this.frontendUrl}/my-enrollment/history`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching my enrollment history:', error);
      throw error;
    }
  }

  /**
   * Download my contract (student frontend)
   */
  async downloadMyContract(tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.frontendUrl}/my-enrollment/contract`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error downloading my contract:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const enrollmentValidationService = new EnrollmentValidationService();
