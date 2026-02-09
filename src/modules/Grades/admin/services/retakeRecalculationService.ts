import { createApiClient } from '@/shared/lib/api-client';
import type {
  RecalculationLog,
  RecalculateResponse,
} from '../../types/retake.types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Admin Retake Recalculation Service (Story 19)
 * Handles post-retake recalculation of averages, statuses, and ECTS credits
 */
class RetakeRecalculationService {
  /**
   * Recalculate all students after retake for a semester
   * POST /api/admin/semesters/{semester}/recalculate-after-retake
   */
  async recalculateAll(semesterId: number, tenantId?: string): Promise<RecalculateResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<RecalculateResponse>(
      `/admin/semesters/${semesterId}/recalculate-after-retake`
    );

    return response.data;
  }

  /**
   * Recalculate a specific student after retake
   * POST /api/admin/students/{student}/recalculate-retake
   */
  async recalculateStudent(
    studentId: number,
    params?: { semester_id?: number },
    tenantId?: string
  ): Promise<RecalculateResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<RecalculateResponse>(
      `/admin/students/${studentId}/recalculate-retake`,
      params
    );

    return response.data;
  }

  /**
   * Get recalculation logs for a semester
   * GET /api/admin/semesters/{semester}/recalculation-logs
   */
  async getLogs(
    semesterId: number,
    params?: { student_id?: number; page?: number; per_page?: number },
    tenantId?: string
  ): Promise<RecalculationLog[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<RecalculationLog[]>>(
      `/admin/semesters/${semesterId}/recalculation-logs`,
      { params }
    );

    return response.data.data;
  }
}

export const retakeRecalculationService = new RetakeRecalculationService();
