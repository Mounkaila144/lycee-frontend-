import { createApiClient } from '@/shared/lib/api-client';
import type {
  TeacherModule,
  Evaluation,
  StudentGradeEntry,
  BatchGradeRequest,
  GradeStatistics,
  PublishGradesRequest,
  PublishGradesResponse,
  ImportGradesPreviewResponse,
  ImportGradesExecuteRequest,
  ImportGradesResult,
  ModuleAveragesResponse,
  ModuleGrade,
} from '../../types/grade.types';
import type {
  GradeHistory,
  RequestGradeCorrectionPayload,
  RequestGradeCorrectionResponse,
} from '../../types/validation.types';
import type {
  AbsencePolicy,
  AbsenceRecord,
  AbsenceType,
  AbsenceSummary,
  AbsenceJustification,
  ReplacementEvaluation,
  StudentAbsenceEntry,
} from '../../types/absence.types';

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
}

/**
 * Teacher Grade Service
 * Handles all API communication for teacher grade entry
 * API routes: /frontend/teacher/...
 */
class TeacherGradeService {
  private baseUrl = '/frontend/teacher';

  /**
   * Get all modules assigned to the current teacher
   */
  async getMyModules(tenantId?: string): Promise<TeacherModule[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<TeacherModule[]>>(
        `${this.baseUrl}/my-modules`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching teacher modules:', error);
      throw error;
    }
  }

  /**
   * Get evaluations for a specific module
   */
  async getModuleEvaluations(
    moduleId: number,
    tenantId?: string
  ): Promise<Evaluation[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<Evaluation[]>>(
        `${this.baseUrl}/modules/${moduleId}/evaluations`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching evaluations for module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Get students list with their grades for an evaluation
   */
  async getEvaluationStudents(
    evaluationId: number,
    tenantId?: string
  ): Promise<StudentGradeEntry[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<any[]>>(
        `${this.baseUrl}/evaluations/${evaluationId}/students`
      );

      // Transform flat API response to nested structure expected by frontend
      const transformed: StudentGradeEntry[] = response.data.data.map((item: any) => ({
        student: {
          id: item.student_id,
          matricule: item.matricule,
          firstname: item.firstname,
          lastname: item.lastname,
          full_name: item.full_name,
        },
        grade: item.grade,
        score: item.grade?.score ?? null,
        is_absent: item.grade?.is_absent ?? false,
        absence_type: item.grade?.absence_type ?? null,
        comment: item.grade?.comment ?? null,
        is_modified: false,
      }));

      return transformed;
    } catch (error) {
      console.error(`Error fetching students for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Save grades in batch
   */
  async saveGradesBatch(
    data: BatchGradeRequest,
    tenantId?: string
  ): Promise<{ saved: number; message: string }> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<{ saved: number; message: string }>>(
        `${this.baseUrl}/grades/batch`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error saving grades batch:', error);
      throw error;
    }
  }

  /**
   * Get statistics for an evaluation
   */
  async getEvaluationStatistics(
    evaluationId: number,
    tenantId?: string
  ): Promise<GradeStatistics> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<GradeStatistics>>(
        `${this.baseUrl}/evaluations/${evaluationId}/statistics`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching statistics for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Publish grades for an evaluation
   */
  async publishGrades(
    data: PublishGradesRequest,
    tenantId?: string
  ): Promise<PublishGradesResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<PublishGradesResponse>>(
        `${this.baseUrl}/evaluations/${data.evaluation_id}/publish`,
        { notify_students: data.notify_students ?? true }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error publishing grades for evaluation ${data.evaluation_id}:`, error);
      throw error;
    }
  }

  /**
   * Export grades template (empty or with current grades)
   */
  async exportGradesTemplate(
    evaluationId: number,
    tenantId?: string
  ): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(
        `${this.baseUrl}/evaluations/${evaluationId}/export`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error exporting grades for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Export absent students list
   */
  async exportAbsentStudents(
    evaluationId: number,
    tenantId?: string
  ): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(
        `${this.baseUrl}/evaluations/${evaluationId}/export-absents`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error exporting absent students for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Upload and preview grades import
   */
  async previewGradesImport(
    evaluationId: number,
    file: File,
    tenantId?: string
  ): Promise<ImportGradesPreviewResponse> {
    try {
      const client = createApiClient(tenantId);
      const formData = new FormData();
      formData.append('file', file);

      const response = await client.post<ApiResponse<ImportGradesPreviewResponse>>(
        `${this.baseUrl}/evaluations/${evaluationId}/import/preview`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error previewing grades import for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Execute grades import
   */
  async importGrades(
    data: ImportGradesExecuteRequest,
    tenantId?: string
  ): Promise<ImportGradesResult> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<ImportGradesResult>>(
        `${this.baseUrl}/evaluations/${data.evaluation_id}/import`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error importing grades for evaluation ${data.evaluation_id}:`, error);
      throw error;
    }
  }

  /**
   * Check if all grades are entered (completeness check)
   */
  async checkCompleteness(
    evaluationId: number,
    tenantId?: string
  ): Promise<{
    is_complete: boolean;
    total_students: number;
    entered_count: number;
    missing_count: number;
    absent_count: number;
  }> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<
        ApiResponse<{
          is_complete: boolean;
          total_students: number;
          entered_count: number;
          missing_count: number;
          absent_count: number;
        }>
      >(`${this.baseUrl}/evaluations/${evaluationId}/check-completeness`);

      return response.data.data;
    } catch (error) {
      console.error(`Error checking completeness for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  // ===== Module Averages =====

  /**
   * Get module averages (all students) for a module
   * Combines two backend endpoints:
   * - GET /api/admin/modules/{module}/averages?semester_id={id}&per_page=999
   * - GET /api/admin/modules/{module}/averages/statistics?semester_id={id}
   */
  async getModuleAverages(
    moduleId: number,
    semesterId?: number,
    tenantId?: string
  ): Promise<ModuleAveragesResponse> {
    try {
      const client = createApiClient(tenantId);
      const params = { ...(semesterId ? { semester_id: semesterId } : {}), per_page: 999 };

      // Fetch grades list and statistics in parallel
      const [gradesResponse, statsResponse] = await Promise.all([
        client.get<{ data: any[]; meta: { total: number } }>(
          `/admin/modules/${moduleId}/averages`,
          { params }
        ),
        client.get<{ data: { count: number; average: number | null; min: number | null; max: number | null; validated_count: number; validation_rate: number } }>(
          `/admin/modules/${moduleId}/averages/statistics`,
          { params: semesterId ? { semester_id: semesterId } : {} }
        ).catch(() => null), // Statistics endpoint may fail if no data
      ]);

      const grades: ModuleGrade[] = (gradesResponse.data.data || []).map((item: any) => ({
        student_id: item.student_id,
        module_id: item.module_id,
        semester_id: item.semester_id,
        average: item.average !== null ? parseFloat(item.average) : null,
        is_final: item.is_final,
        missing_evaluations_count: item.missing_evaluations_count,
        status: item.status,
        rank: item.rank,
        total_ranked: item.total_ranked,
        calculated_at: item.calculated_at,
        compensation_applied_at: null,
        student: item.student ? {
          id: item.student.id,
          matricule: item.student.matricule,
          firstname: item.student.full_name?.split(' ')[0] ?? '',
          lastname: item.student.full_name?.split(' ').slice(1).join(' ') ?? '',
          full_name: item.student.full_name,
        } : undefined,
      }));

      const stats = statsResponse?.data?.data;

      return {
        module_id: moduleId,
        module_name: '',
        semester_id: semesterId ?? 0,
        averages: grades,
        class_average: stats?.average ?? null,
        pass_rate: stats?.validation_rate ?? null,
        total_students: gradesResponse.data.meta?.total ?? grades.length,
        calculated_count: stats?.count ?? grades.length,
      };
    } catch (error) {
      console.error(`Error fetching module averages for module ${moduleId}:`, error);
      return {
        module_id: moduleId,
        module_name: '',
        semester_id: semesterId ?? 0,
        averages: [],
        class_average: null,
        pass_rate: null,
        total_students: 0,
        calculated_count: 0,
      };
    }
  }

  /**
   * Get a single student's module grade
   */
  async getStudentModuleGrade(
    moduleId: number,
    studentId: number,
    semesterId?: number,
    tenantId?: string
  ): Promise<ModuleGrade | null> {
    const response = await this.getModuleAverages(moduleId, semesterId, tenantId);
    return response.averages.find(a => a.student_id === studentId) ?? null;
  }

  /**
   * Force recalculate module averages
   * POST /api/admin/modules/{module}/averages/recalculate?semester_id={id}
   */
  async recalculateModuleAverages(
    moduleId: number,
    semesterId?: number,
    tenantId?: string
  ): Promise<{ message: string }> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string }>(
        `/admin/modules/${moduleId}/averages/recalculate`,
        {},
        { params: semesterId ? { semester_id: semesterId } : {} }
      );

      return response.data;
    } catch (error) {
      console.error(`Error recalculating averages for module ${moduleId}:`, error);
      throw error;
    }
  }

  // ===== Grade Correction & History =====

  /**
   * Request a correction for a published grade
   * POST /api/frontend/teacher/grades/{id}/request-correction
   */
  async requestGradeCorrection(
    gradeId: number,
    data: RequestGradeCorrectionPayload,
    tenantId?: string
  ): Promise<RequestGradeCorrectionResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<RequestGradeCorrectionResponse>>(
        `${this.baseUrl}/grades/${gradeId}/request-correction`,
        data
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error(`Error requesting correction for grade ${gradeId}:`, error);
      // Extract error message from Axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
        const message = axiosError.response?.data?.message || `Erreur serveur (${axiosError.response?.status || 'inconnue'})`;
        throw new Error(message);
      }
      throw new Error('Erreur lors de la demande de correction');
    }
  }

  /**
   * Get history for a specific grade
   * GET /api/frontend/teacher/grades/{id}/history
   */
  async getGradeHistory(
    gradeId: number,
    tenantId?: string
  ): Promise<GradeHistory[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<GradeHistory[]>>(
        `${this.baseUrl}/grades/${gradeId}/history`
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error(`Error fetching history for grade ${gradeId}:`, error);
      // Extract error message from Axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
        const message = axiosError.response?.data?.message || `Erreur serveur (${axiosError.response?.status || 'inconnue'})`;
        throw new Error(message);
      }
      throw new Error('Erreur lors du chargement de l\'historique');
    }
  }

  /**
   * Export grade history for a module as Excel
   * GET /api/frontend/teacher/modules/{id}/export-history
   */
  async exportModuleHistory(
    moduleId: number,
    tenantId?: string
  ): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(
        `${this.baseUrl}/modules/${moduleId}/export-history`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error exporting history for module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Export grade history for an evaluation as Excel
   * GET /api/frontend/teacher/evaluations/{id}/export-history
   */
  async exportEvaluationHistory(
    evaluationId: number,
    tenantId?: string
  ): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(
        `${this.baseUrl}/evaluations/${evaluationId}/export-history`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error exporting history for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }
  // ===== Absence Management =====

  /**
   * Get absence policy for an evaluation
   * GET /api/frontend/teacher/evaluations/{id}/absence-policy
   */
  async getAbsencePolicy(
    evaluationId: number,
    tenantId?: string
  ): Promise<AbsencePolicy> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<AbsencePolicy>>(
        `${this.baseUrl}/evaluations/${evaluationId}/absence-policy`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching absence policy for evaluation ${evaluationId}:`, error);
      // Return default policy if endpoint not yet available
      return {
        unjustified_grade_is_zero: true,
        justified_allows_replacement: true,
        justification_deadline_days: 7,
      };
    }
  }

  /**
   * Get absence summary for an evaluation
   * GET /api/frontend/teacher/evaluations/{id}/absences
   */
  async getEvaluationAbsences(
    evaluationId: number,
    tenantId?: string
  ): Promise<StudentAbsenceEntry[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<StudentAbsenceEntry[]>>(
        `${this.baseUrl}/evaluations/${evaluationId}/absences`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching absences for evaluation ${evaluationId}:`, error);
      return [];
    }
  }

  /**
   * Mark multiple students as absent
   * POST /api/frontend/teacher/evaluations/{id}/mark-absent
   */
  async markStudentsAbsent(
    evaluationId: number,
    studentIds: number[],
    absenceType: AbsenceType,
    tenantId?: string
  ): Promise<{ marked: number; message: string }> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<{ marked: number; message: string }>>(
        `${this.baseUrl}/evaluations/${evaluationId}/mark-absent`,
        { student_ids: studentIds, absence_type: absenceType }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error('Error marking students absent:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors du marquage des absences');
      }
      throw new Error('Erreur lors du marquage des absences');
    }
  }

  /**
   * Update absence type for a grade
   * PUT /api/frontend/teacher/grades/{id}/absence-type
   */
  async updateAbsenceType(
    gradeId: number,
    absenceType: AbsenceType,
    comment?: string,
    tenantId?: string
  ): Promise<AbsenceRecord> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.put<ApiResponse<AbsenceRecord>>(
        `${this.baseUrl}/grades/${gradeId}/absence-type`,
        { absence_type: absenceType, comment }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error(`Error updating absence type for grade ${gradeId}:`, error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour');
      }
      throw new Error('Erreur lors de la mise à jour du type d\'absence');
    }
  }

  /**
   * Upload justification for an absence
   * POST /api/frontend/teacher/grades/{id}/upload-justification
   */
  async uploadJustification(
    gradeId: number,
    file: File,
    comment?: string,
    tenantId?: string
  ): Promise<AbsenceJustification> {
    try {
      const client = createApiClient(tenantId);
      const formData = new FormData();
      formData.append('file', file);
      if (comment) {
        formData.append('comment', comment);
      }

      const response = await client.post<ApiResponse<AbsenceJustification>>(
        `${this.baseUrl}/grades/${gradeId}/upload-justification`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error(`Error uploading justification for grade ${gradeId}:`, error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de l\'upload');
      }
      throw new Error('Erreur lors de l\'upload du justificatif');
    }
  }

  /**
   * Schedule replacement evaluation
   * POST /api/frontend/teacher/evaluations/{evaluationId}/replacement
   */
  async scheduleReplacement(
    evaluationId: number,
    studentId: number,
    data: { scheduled_at: string; location: string; type: 'same' | 'alternative'; comment?: string },
    tenantId?: string
  ): Promise<ReplacementEvaluation> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<ReplacementEvaluation>>(
        `${this.baseUrl}/evaluations/${evaluationId}/replacement`,
        { student_id: studentId, ...data }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error('Error scheduling replacement evaluation:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de la planification');
      }
      throw new Error('Erreur lors de la planification de l\'évaluation de remplacement');
    }
  }

  /**
   * Export absent students list with details
   * GET /api/frontend/teacher/evaluations/{id}/export-absences
   */
  async exportAbsencesList(
    evaluationId: number,
    tenantId?: string
  ): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(
        `${this.baseUrl}/evaluations/${evaluationId}/export-absences`,
        { responseType: 'blob' }
      );

      return response.data;
    } catch (error) {
      console.error(`Error exporting absences for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const teacherGradeService = new TeacherGradeService();
