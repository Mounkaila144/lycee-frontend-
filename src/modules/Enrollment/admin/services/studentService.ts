import { createApiClient } from '@/shared/lib/api-client';
import type {
  Student,
  StudentFormData,
  StudentFilters,
  StudentCompleteness,
  DuplicateCheckRequest,
  DuplicateCheckResponse,
  StudentStatistics,
  StudentAuditLog,
  DocumentUploadData,
  StudentDocument,
} from '../../types/student.types';

/**
 * Paginated Students Response
 */
export interface PaginatedStudentsResponse {
  data: Student[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Student Query Params
 */
export interface StudentQueryParams extends StudentFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Student Response (single)
 */
export interface StudentResponse {
  data: Student;
  message?: string;
}

/**
 * Student Service
 * Handles all API communication related to students
 */
class StudentService {
  private baseUrl = '/admin/enrollment/students';

  /**
   * Fetch paginated students with filters
   */
  async getStudents(
    tenantId?: string,
    params?: StudentQueryParams
  ): Promise<PaginatedStudentsResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      // Pagination
      if (params?.per_page) {
        queryParams.append('per_page', String(params.per_page));
      }
      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      // Search
      if (params?.search) {
        queryParams.append('search', params.search);
      }

      // Filters
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.programme_id) {
        queryParams.append('programme_id', String(params.programme_id));
      }
      if (params?.sex) {
        queryParams.append('sex', params.sex);
      }
      if (params?.nationality) {
        queryParams.append('nationality', params.nationality);
      }
      if (params?.year_enrolled) {
        queryParams.append('year_enrolled', String(params.year_enrolled));
      }

      // Sorting
      if (params?.sort_by) {
        queryParams.append('sort_by', params.sort_by);
      }
      if (params?.sort_order) {
        queryParams.append('sort_order', params.sort_order);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await client.get<PaginatedStudentsResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  /**
   * Get student by ID
   */
  async getById(id: number, tenantId?: string): Promise<Student> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<StudentResponse>(`${this.baseUrl}/${id}`);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new student
   */
  async create(data: StudentFormData, tenantId?: string): Promise<Student> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<StudentResponse>(this.baseUrl, data);

      return response.data.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  /**
   * Update student
   */
  async update(
    id: number,
    data: Partial<StudentFormData>,
    tenantId?: string
  ): Promise<Student> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.put<StudentResponse>(`${this.baseUrl}/${id}`, data);

      return response.data.data;
    } catch (error) {
      console.error(`Error updating student ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete student (soft delete)
   */
  async delete(id: number, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting student ${id}:`, error);
      throw error;
    }
  }

  /**
   * Upload document for student
   */
  async uploadDocument(
    studentId: number,
    data: DocumentUploadData,
    tenantId?: string
  ): Promise<StudentDocument> {
    try {
      const client = createApiClient(tenantId);
      const formData = new FormData();
      formData.append('type', data.document_type);
      formData.append('file', data.file);

      const response = await client.post<{ data: StudentDocument }>(
        `${this.baseUrl}/${studentId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error uploading document for student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Check student dossier completeness
   */
  async checkCompleteness(studentId: number, tenantId?: string): Promise<StudentCompleteness> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: StudentCompleteness }>(
        `${this.baseUrl}/${studentId}/check-completeness`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error checking completeness for student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Check for duplicate students
   */
  async checkDuplicates(
    data: DuplicateCheckRequest,
    tenantId?: string
  ): Promise<DuplicateCheckResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ data: DuplicateCheckResponse }>(
        `${this.baseUrl}/check-duplicates`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      throw error;
    }
  }

  /**
   * Get student audit log
   */
  async getAuditLog(studentId: number, tenantId?: string): Promise<StudentAuditLog[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: StudentAuditLog[] }>(
        `${this.baseUrl}/${studentId}/audit-log`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching audit log for student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Autocomplete search
   */
  async autocomplete(query: string, tenantId?: string): Promise<Student[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: Student[] }>(
        `${this.baseUrl}/search/autocomplete`,
        {
          params: { q: query },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error autocomplete search:', error);
      throw error;
    }
  }

  /**
   * Get student statistics
   */
  async getStatistics(tenantId?: string): Promise<StudentStatistics> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: StudentStatistics }>(
        `${this.baseUrl}/statistics/summary`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching student statistics:', error);
      throw error;
    }
  }

  /**
   * Export students to Excel
   */
  async exportToExcel(filters?: StudentFilters, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.programme_id) queryParams.append('programme_id', String(filters.programme_id));
      if (filters?.search) queryParams.append('search', filters.search);

      const queryString = queryParams.toString();
      const url = queryString ? `${this.baseUrl}/export?${queryString}` : `${this.baseUrl}/export`;

      const response = await client.get(url, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error exporting students:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const studentService = new StudentService();
