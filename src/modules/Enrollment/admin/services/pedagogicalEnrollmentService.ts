import { createApiClient } from '@/shared/lib/api-client';
import type {
  AvailableModulesResponse,
  PedagogicalEnrollmentRequest,
  EnrollmentResult,
  StudentEnrollment,
  ModuleCapacityStatus,
  CreditValidationResult,
  EnrollmentQueryParams,
  PaginatedEnrollmentsResponse,
  GroupAssignmentRequest,
  PrerequisiteOverrideRequest,
} from '../../types/pedagogicalEnrollment.types';

/**
 * Single Enrollment Response
 */
interface EnrollmentResponse {
  data: StudentEnrollment;
  message?: string;
}

/**
 * Pedagogical Enrollment Service
 * Handles all API communication for module enrollment
 *
 * Backend routes: Modules/Enrollment/Routes/admin.php
 * Base path: /api/admin/enrollment/enrollments
 */
class PedagogicalEnrollmentService {
  private baseUrl = '/admin/enrollment/enrollments';
  private groupsUrl = '/admin/enrollment/groups';

  /**
   * Get available modules for a student's enrollment
   * Route: GET /api/admin/enrollment/enrollments/available-modules
   */
  async getAvailableModules(
    studentId: number,
    programId: number,
    level: string,
    semesterId: number,
    tenantId?: string
  ): Promise<AvailableModulesResponse> {
    const client = createApiClient(tenantId);

    // API response structure from backend
    interface ApiModule {
      id: number;
      code: string;
      name: string;
      credits_ects: number;
      coefficient?: string;
      type: string;
      level: string;
      semester: string;
      hours_cm?: number;
      hours_td?: number;
      hours_tp?: number;
      total_hours?: number;
      is_eliminatory?: boolean;
      description?: string;
      is_enrolled?: boolean;
      is_obligatory: boolean;
    }

    interface ApiResponse {
      data: ApiModule[];
      meta: {
        total_modules: number;
        obligatory_modules: number;
        optional_modules: number;
        obligatory_credits: number;
        optional_credits: number;
        total_credits: number;
      };
    }

    const response = await client.get<ApiResponse>(
      `${this.baseUrl}/available-modules`,
      {
        params: {
          student_id: studentId,
          programme_id: programId, // Backend uses French spelling
          level,
          semester_id: semesterId,
        }
      }
    );

    const apiData = response.data;

    // Transform API response to frontend expected format
    const transformModule = (mod: ApiModule) => ({
      id: mod.id,
      code: mod.code,
      name: mod.name,
      credits_ects: mod.credits_ects,
      type: mod.is_obligatory ? 'mandatory' as const : 'optional' as const,
      semester_id: semesterId,
      semester_name: mod.semester,
      capacity: null,
      enrolled_count: 0,
      remaining_capacity: null,
      is_full: false,
      prerequisite_status: 'met' as const,
      prerequisite_message: undefined,
      prerequisites: [],
      groups: [],
      description: mod.description,
      coefficient: mod.coefficient ? parseFloat(mod.coefficient) : undefined,
    });

    // Split modules into mandatory and optional
    const mandatory = apiData.data
      .filter(mod => mod.is_obligatory || mod.type === 'Obligatoire')
      .map(transformModule);

    const optional = apiData.data
      .filter(mod => !mod.is_obligatory && mod.type !== 'Obligatoire')
      .map(transformModule);

    return {
      mandatory,
      optional,
      total_mandatory_credits: apiData.meta.obligatory_credits,
      total_optional_credits: apiData.meta.optional_credits,
      min_semester_credits: 30, // Default ECTS minimum
      max_semester_credits: 36, // Default ECTS maximum
    };
  }

  /**
   * Enroll student to modules (pedagogical enrollment)
   * Route: POST /api/admin/enrollment/enrollments
   */
  async enrollStudent(
    data: PedagogicalEnrollmentRequest,
    tenantId?: string
  ): Promise<EnrollmentResult> {
    const client = createApiClient(tenantId);

    // Transform to match backend field names (French spelling)
    const requestData = {
      student_id: data.student_id,
      programme_id: data.program_id, // Backend uses French spelling
      level: data.level,
      semester_id: data.semester_id,
      academic_year_id: data.academic_year_id,
      module_selections: data.module_selections,
      override_prerequisites: data.override_prerequisites,
    };

    // API response structure from backend
    interface ApiEnrollmentResponse {
      message: string;
      data: {
        enrollment: any;
        modules_enrolled_count: number;
      };
    }

    const response = await client.post<ApiEnrollmentResponse>(
      this.baseUrl,
      requestData
    );

    const apiData = response.data.data;
    const enrollment = apiData.enrollment;

    // Transform to frontend expected format
    return {
      success: true,
      enrollment: {
        id: enrollment.id,
        student_id: enrollment.student_id,
        program_id: enrollment.programme_id,
        level: enrollment.level,
        semester_id: enrollment.semester_id,
        academic_year_id: enrollment.academic_year_id,
        enrollment_date: enrollment.enrollment_date,
        status: enrollment.status === 'Actif' ? 'Confirmed' : 'Pending',
        total_credits: enrollment.total_credits,
        modules_count: enrollment.enrolled_modules_count,
        created_at: enrollment.created_at,
        updated_at: enrollment.updated_at,
        student: enrollment.student,
        program: enrollment.programme,
        semester: enrollment.semester,
        module_enrollments: enrollment.module_enrollments,
      },
      total_credits: enrollment.total_credits,
      modules_count: apiData.modules_enrolled_count,
      mandatory_modules: enrollment.module_enrollments?.filter((m: any) => !m.is_optional).length || 0,
      optional_modules: enrollment.module_enrollments?.filter((m: any) => m.is_optional).length || 0,
      warnings: [],
      errors: [],
    };
  }

  /**
   * Get module capacity status
   * Note: This may need adjustment based on actual backend route
   */
  async getModuleCapacityStatus(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<ModuleCapacityStatus> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: ModuleCapacityStatus }>(
      `${this.baseUrl}/module-enrollments`,
      {
        params: {
          module_id: moduleId,
          semester_id: semesterId
        }
      }
    );

    return response.data.data;
  }

  /**
   * Validate credits selection before enrollment
   * Route: POST /api/admin/enrollment/enrollments/check-prerequisites
   */
  async validateCredits(
    studentId: number,
    moduleIds: number[],
    semesterId: number,
    tenantId?: string
  ): Promise<CreditValidationResult> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ data: CreditValidationResult }>(
      `${this.baseUrl}/check-prerequisites`,
      {
        student_id: studentId,
        module_ids: moduleIds,
        semester_id: semesterId,
      }
    );

    return response.data.data;
  }

  /**
   * Get student's current enrollment
   * Route: GET /api/admin/enrollment/enrollments?student_id=X&semester_id=Y&programme_id=Z
   *
   * Note: If semesterId is not provided (0 or undefined), searches for any enrollment
   * for the student + program combination
   */
  async getStudentEnrollment(
    studentId: number,
    semesterId: number,
    tenantId?: string,
    programId?: number
  ): Promise<StudentEnrollment | null> {
    try {
      const client = createApiClient(tenantId);

      // API can return paginated response or direct array
      interface ApiEnrollment {
        id: number;
        student_id: number;
        programme_id: number;
        programme?: any;
        academic_year_id: number;
        semester_id: number;
        semester?: any;
        level: string;
        enrollment_date: string;
        status: string;
        total_credits: number;
        enrolled_modules_count: number;
        module_enrollments?: any[];
        student?: any;
        created_at: string;
        updated_at: string;
      }

      // Build params - only include semester_id if provided and not 0
      const params: Record<string, any> = {
        student_id: studentId,
      };

      if (semesterId && semesterId > 0) {
        params.semester_id = semesterId;
      }

      if (programId && programId > 0) {
        params.programme_id = programId;
      }

      const response = await client.get<{ data: ApiEnrollment[] }>(
        this.baseUrl,
        { params }
      );

      // Return first enrollment if exists
      const enrollments = response.data.data;

      if (!enrollments || enrollments.length === 0) {
        return null;
      }

      const enrollment = enrollments[0];

      // Transform to frontend expected format
      return {
        id: enrollment.id,
        student_id: enrollment.student_id,
        program_id: enrollment.programme_id,
        level: enrollment.level,
        semester_id: enrollment.semester_id,
        academic_year_id: enrollment.academic_year_id,
        enrollment_date: enrollment.enrollment_date,
        status: enrollment.status === 'Actif' ? 'Confirmed' : 'Pending',
        total_credits: enrollment.total_credits,
        modules_count: enrollment.enrolled_modules_count,
        created_at: enrollment.created_at,
        updated_at: enrollment.updated_at,
        student: enrollment.student,
        program: enrollment.programme,
        semester: enrollment.semester,
        module_enrollments: enrollment.module_enrollments,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  }

  /**
   * Check if student has any pedagogical enrollment
   * This is a broader check that doesn't require specific semester/program
   * Route: GET /api/admin/enrollment/enrollments?student_id=X
   */
  async hasExistingEnrollment(
    studentId: number,
    tenantId?: string
  ): Promise<StudentEnrollment | null> {
    try {
      const client = createApiClient(tenantId);

      interface ApiEnrollment {
        id: number;
        student_id: number;
        programme_id: number;
        programme?: any;
        academic_year_id: number;
        semester_id: number;
        semester?: any;
        level: string;
        enrollment_date: string;
        status: string;
        total_credits: number;
        enrolled_modules_count: number;
        module_enrollments?: any[];
        student?: any;
        created_at: string;
        updated_at: string;
      }

      // Query only by student_id to find ANY enrollment
      const response = await client.get<{ data: ApiEnrollment[] }>(
        this.baseUrl,
        {
          params: {
            student_id: studentId,
          }
        }
      );

      const enrollments = response.data.data;

      if (!enrollments || enrollments.length === 0) {
        return null;
      }

      // Return the most recent enrollment (first one returned by API)
      const enrollment = enrollments[0];

      return {
        id: enrollment.id,
        student_id: enrollment.student_id,
        program_id: enrollment.programme_id,
        level: enrollment.level,
        semester_id: enrollment.semester_id,
        academic_year_id: enrollment.academic_year_id,
        enrollment_date: enrollment.enrollment_date,
        status: enrollment.status === 'Actif' ? 'Confirmed' : 'Pending',
        total_credits: enrollment.total_credits,
        modules_count: enrollment.enrolled_modules_count,
        created_at: enrollment.created_at,
        updated_at: enrollment.updated_at,
        student: enrollment.student,
        program: enrollment.programme,
        semester: enrollment.semester,
        module_enrollments: enrollment.module_enrollments,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  }

  /**
   * Get paginated list of enrollments
   * Route: GET /api/admin/enrollment/enrollments
   */
  async getEnrollments(
    params: EnrollmentQueryParams = {},
    tenantId?: string
  ): Promise<PaginatedEnrollmentsResponse> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedEnrollmentsResponse>(
      this.baseUrl,
      { params }
    );

    return response.data;
  }

  /**
   * Get single enrollment by ID
   * Route: GET /api/admin/enrollment/enrollments/{id}
   */
  async getEnrollmentById(
    enrollmentId: number,
    tenantId?: string
  ): Promise<StudentEnrollment> {
    const client = createApiClient(tenantId);
    const response = await client.get<EnrollmentResponse>(
      `${this.baseUrl}/${enrollmentId}`
    );

    return response.data.data;
  }

  /**
   * Cancel student enrollment
   * Route: DELETE /api/admin/enrollment/enrollments/{id}
   */
  async cancelEnrollment(
    enrollmentId: number,
    reason: string,
    tenantId?: string
  ): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`${this.baseUrl}/${enrollmentId}`, {
      data: { reason }
    });
  }

  /**
   * Assign student to a group
   * Route: POST /api/admin/enrollment/groups/{group}/assign-student
   */
  async assignToGroup(
    groupId: number,
    studentId: number,
    tenantId?: string
  ): Promise<void> {
    const client = createApiClient(tenantId);
    await client.post(
      `${this.groupsUrl}/${groupId}/assign-student`,
      { student_id: studentId }
    );
  }

  /**
   * Get available groups for a module
   * Route: GET /api/admin/enrollment/groups
   */
  async getAvailableGroups(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<Array<{
    id: number;
    name: string;
    type: 'TD' | 'TP';
    capacity: number;
    enrolled_count: number;
  }>> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: Array<{
      id: number;
      name: string;
      type: 'TD' | 'TP';
      capacity: number;
      enrolled_count: number;
    }> }>(
      this.groupsUrl,
      {
        params: {
          module_id: moduleId,
          semester_id: semesterId
        }
      }
    );

    return response.data.data;
  }

  /**
   * Request prerequisite override
   * Note: This route may not exist in backend - commenting out
   */
  async requestPrerequisiteOverride(
    data: PrerequisiteOverrideRequest,
    tenantId?: string
  ): Promise<void> {
    const client = createApiClient(tenantId);
    // Using validation endpoint with override flag
    await client.post(`/admin/enrollment/validation/${data.enrollment_id}/validate`, {
      override_prerequisites: true,
      reason: data.reason,
    });
  }

  /**
   * Generate enrollment sheet PDF
   * Route: GET /api/admin/enrollment/enrollments/{id}/sheet
   */
  async generateEnrollmentSheet(
    enrollmentId: number,
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `/admin/enrollment/enrollments/${enrollmentId}/sheet`,
      { responseType: 'blob' }
    );

    return response.data;
  }

  /**
   * Add modules to an existing enrollment
   * Route: POST /api/admin/enrollment/enrollments/{id}/modules
   */
  async addModulesToEnrollment(
    enrollmentId: number,
    moduleIds: number[],
    tenantId?: string
  ): Promise<void> {
    const client = createApiClient(tenantId);
    await client.post(
      `${this.baseUrl}/${enrollmentId}/modules`,
      { module_ids: moduleIds }
    );
  }

  /**
   * Remove modules from an enrollment
   * Route: DELETE /api/admin/enrollment/enrollments/{id}/modules
   */
  async removeModulesFromEnrollment(
    enrollmentId: number,
    moduleIds: number[],
    tenantId?: string
  ): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(
      `${this.baseUrl}/${enrollmentId}/modules`,
      { data: { module_ids: moduleIds } }
    );
  }

  /**
   * Check prerequisites for modules
   * Route: POST /api/admin/enrollment/enrollments/check-prerequisites
   */
  async checkPrerequisites(
    studentId: number,
    moduleIds: number[],
    tenantId?: string
  ): Promise<{
    can_enroll: boolean;
    results: Array<{
      module_id: number;
      module_code: string;
      module_name: string;
      can_enroll: boolean;
      prerequisites: Array<{
        module_code: string;
        module_name: string;
        required_grade: number;
        student_grade: number | null;
        is_met: boolean;
      }>;
    }>;
    message?: string;
  }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{
      data: {
        can_enroll: boolean;
        results: Array<{
          module_id: number;
          module_code: string;
          module_name: string;
          can_enroll: boolean;
          prerequisites: Array<{
            module_code: string;
            module_name: string;
            required_grade: number;
            student_grade: number | null;
            is_met: boolean;
          }>;
        }>;
        message?: string;
      };
    }>(`${this.baseUrl}/check-prerequisites`, {
      student_id: studentId,
      module_ids: moduleIds,
    });

    return response.data.data;
  }

  /**
   * Get enrollment statistics for a semester
   * Route: GET /api/admin/enrollment/enrollments/statistics
   */
  async getEnrollmentStatistics(
    semesterId: number,
    tenantId?: string
  ): Promise<{
    total_enrollments: number;
    pending_enrollments: number;
    confirmed_enrollments: number;
    average_credits: number;
    modules_by_enrollment: Array<{
      module_id: number;
      module_code: string;
      module_name: string;
      enrollment_count: number;
    }>;
  }> {
    const client = createApiClient(tenantId);
    const response = await client.get<{
      data: {
        total_enrollments: number;
        pending_enrollments: number;
        confirmed_enrollments: number;
        average_credits: number;
        modules_by_enrollment: Array<{
          module_id: number;
          module_code: string;
          module_name: string;
          enrollment_count: number;
        }>;
      };
    }>(`${this.baseUrl}/statistics`, { params: { semester_id: semesterId } });

    return response.data.data;
  }

  /**
   * Get students enrolled in a specific module
   * Route: GET /api/admin/enrollment/enrollments/students-in-module
   */
  async getStudentsInModule(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<Array<{
    student_id: number;
    matricule: string;
    firstname: string;
    lastname: string;
    enrollment_date: string;
  }>> {
    const client = createApiClient(tenantId);
    const response = await client.get<{
      data: Array<{
        student_id: number;
        matricule: string;
        firstname: string;
        lastname: string;
        enrollment_date: string;
      }>;
    }>(`${this.baseUrl}/students-in-module`, {
      params: {
        module_id: moduleId,
        semester_id: semesterId,
      }
    });

    return response.data.data;
  }
}

// Export singleton instance
export const pedagogicalEnrollmentService = new PedagogicalEnrollmentService();
