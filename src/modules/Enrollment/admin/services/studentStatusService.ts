import { createApiClient } from '@/shared/lib/api-client';
import type {
  StudentStatusHistory,
  StatusChangeRequest,
  StatusStatistics,
  Student,
} from '../../types/student.types';

/**
 * Student Status Service
 * Handles all API communication related to student status management
 */
class StudentStatusService {
  private baseUrl = '/admin/enrollment/students';

  /**
   * Change student status
   */
  async changeStatus(
    studentId: number,
    data: StatusChangeRequest,
    tenantId?: string
  ): Promise<Student> {
    try {
      const client = createApiClient(tenantId);
      const formData = new FormData();

      formData.append('status', data.status);
      formData.append('reason', data.reason);
      formData.append('effective_date', data.effective_date);

      if (data.document) {
        formData.append('document', data.document);
      }

      const response = await client.post<{ data: Student; message: string }>(
        `${this.baseUrl}/${studentId}/status`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error changing status for student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Get status history for a student
   */
  async getStatusHistory(
    studentId: number,
    tenantId?: string
  ): Promise<StudentStatusHistory[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: StudentStatusHistory[] }>(
        `${this.baseUrl}/${studentId}/status/history`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching status history for student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Get status statistics across all students
   */
  async getStatusStatistics(tenantId?: string): Promise<StatusStatistics[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: StatusStatistics[] }>(
        `${this.baseUrl}/status/statistics`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching status statistics:', error);
      throw error;
    }
  }

  /**
   * Download status change document
   */
  async downloadDocument(
    studentId: number,
    historyId: number,
    tenantId?: string
  ): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(
        `${this.baseUrl}/${studentId}/status/history/${historyId}/document`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error downloading document for history ${historyId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const studentStatusService = new StudentStatusService();
