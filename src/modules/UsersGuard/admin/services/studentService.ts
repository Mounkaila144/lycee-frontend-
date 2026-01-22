import { createApiClient } from '@/shared/lib/api-client';
import type {
  Student,
  StudentQueryParams,
  PaginatedStudentsResponse
} from '../../types/student.types';

/**
 * Student Service
 * Handles all API communication related to students (users with "Étudiant" role)
 */
class StudentService {
  /**
   * Fetch paginated students with filters
   * @param tenantId - The tenant ID for multi-tenancy
   * @param params - Query parameters including pagination and filters
   * @returns Promise with paginated response
   */
  async getStudents(
    tenantId?: string,
    params?: StudentQueryParams
  ): Promise<PaginatedStudentsResponse> {
    try {
      const client = createApiClient(tenantId);

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add per_page parameter (default: 15 according to API)
      if (params?.per_page) {
        queryParams.append('per_page', String(params.per_page));
      }

      // Add page parameter
      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      // Add search parameter (searches in username, email, firstname, lastname, matricule)
      if (params?.search) {
        queryParams.append('search', params.search);
      }

      // Add program_id filter
      if (params?.program_id) {
        queryParams.append('program_id', String(params.program_id));
      }

      // Add level_id filter
      if (params?.level_id) {
        queryParams.append('level_id', String(params.level_id));
      }

      // Add status filter
      if (params?.status) {
        queryParams.append('status', params.status);
      }

      const queryString = queryParams.toString();
      const url = `/admin/students${queryString ? `?${queryString}` : ''}`;

      const response = await client.get<PaginatedStudentsResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  /**
   * Fetch a single student by ID
   * @param studentId - The student ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with student data
   */
  async getStudentById(studentId: number, tenantId?: string): Promise<Student> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: Student }>(`/admin/students/${studentId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Search students (convenience method)
   * @param query - Search query
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with students matching the query
   */
  async searchStudents(query: string, tenantId?: string): Promise<Student[]> {
    try {
      const response = await this.getStudents(tenantId, { search: query, per_page: 50 });
      return response.data;
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const studentService = new StudentService();
