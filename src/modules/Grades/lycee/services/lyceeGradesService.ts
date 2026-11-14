/**
 * Notes « lycée » — client de l'API /api/admin/lycee-grades (+ portails élève/parent).
 * Backend : Modules/NotesEvaluations (contrat SPEC_NOTES_LYCEE).
 */
import { createApiClient } from '@/shared/lib/api-client';

import type {
  AcademicYearOption,
  AssignmentFilters,
  AssignmentPayload,
  BulkAssignmentPayload,
  ClassEvaluation,
  ClassEvaluationDetail,
  ClassResults,
  ClassSubject,
  ClasseOption,
  EvaluationFilters,
  EvaluationPayload,
  GradeEntryPayload,
  PublishBulkPayload,
  PublishBulkResult,
  ReportCardComment,
  ReportCardCommentPayload,
  SemesterRef,
  StudentResultsResponse,
  TeacherAssignment,
  TeacherOption,
} from '../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

const BASE = '/admin/lycee-grades';

const client = () => createApiClient();

const cleanParams = <T extends object>(params?: T): Record<string, unknown> | undefined => {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
};

/**
 * Déclenche le téléchargement navigateur d'un blob.
 */
export function saveBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

/**
 * Extrait un message d'erreur lisible d'une erreur axios (422 {message}, erreurs de validation…).
 * Gère aussi les réponses blob (téléchargements PDF).
 */
export async function extractErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): Promise<string> {
  const response = (error as { response?: { data?: unknown; status?: number } })?.response;
  let data = response?.data;

  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      data = JSON.parse(await data.text());
    } catch {
      data = undefined;
    }
  }

  const payload = data as { message?: string; errors?: Record<string, string[]> } | undefined;
  const firstValidationError = payload?.errors ? Object.values(payload.errors).flat()[0] : undefined;

  if (firstValidationError) {
    return firstValidationError;
  }

  if (payload?.message) {
    return payload.message;
  }

  if (response?.status === 403) {
    return "Vous n'avez pas les droits nécessaires pour cette action.";
  }

  return fallback;
}

const getBlob = async (url: string, params?: Record<string, unknown>): Promise<Blob> => {
  const response = await client().get<Blob>(url, { params, responseType: 'blob' });

  return response.data;
};

export const lyceeGradesService = {
  /* ----------------------------- Affectations ----------------------------- */

  async getAssignments(filters?: AssignmentFilters): Promise<TeacherAssignment[]> {
    const { data } = await client().get<ApiResponse<TeacherAssignment[]>>(`${BASE}/assignments`, {
      params: cleanParams(filters),
    });

    return data.data ?? [];
  },

  async getMyAssignments(): Promise<TeacherAssignment[]> {
    const { data } = await client().get<ApiResponse<TeacherAssignment[]>>(`${BASE}/assignments/mine`);

    return data.data ?? [];
  },

  async createAssignment(payload: AssignmentPayload): Promise<TeacherAssignment> {
    const { data } = await client().post<ApiResponse<TeacherAssignment>>(`${BASE}/assignments`, payload);

    return data.data;
  },

  async updateAssignment(id: number, teacherId: number): Promise<TeacherAssignment> {
    const { data } = await client().put<ApiResponse<TeacherAssignment>>(`${BASE}/assignments/${id}`, {
      teacher_id: teacherId,
    });

    return data.data;
  },

  async deleteAssignment(id: number): Promise<void> {
    await client().delete(`${BASE}/assignments/${id}`);
  },

  async bulkAssign(payload: BulkAssignmentPayload): Promise<TeacherAssignment[]> {
    const { data } = await client().post<ApiResponse<TeacherAssignment[]>>(`${BASE}/assignments/bulk`, payload);

    return data.data ?? [];
  },

  async getClassSubjects(classeId: number): Promise<ClassSubject[]> {
    const { data } = await client().get<ApiResponse<ClassSubject[]>>(`${BASE}/classes/${classeId}/subjects`);

    return data.data ?? [];
  },

  /* ----------------------------- Évaluations ------------------------------ */

  async getEvaluations(filters?: EvaluationFilters): Promise<ClassEvaluation[]> {
    const { data } = await client().get<ApiResponse<ClassEvaluation[]>>(`${BASE}/evaluations`, {
      params: cleanParams({ per_page: 200, ...filters }),
    });

    return data.data ?? [];
  },

  async getEvaluation(id: number): Promise<ClassEvaluationDetail> {
    const { data } = await client().get<ApiResponse<ClassEvaluationDetail>>(`${BASE}/evaluations/${id}`);

    return data.data;
  },

  async createEvaluation(payload: EvaluationPayload): Promise<ClassEvaluation> {
    const { data } = await client().post<ApiResponse<ClassEvaluation>>(`${BASE}/evaluations`, payload);

    return data.data;
  },

  async updateEvaluation(id: number, payload: Partial<EvaluationPayload>): Promise<ClassEvaluation> {
    const { data } = await client().put<ApiResponse<ClassEvaluation>>(`${BASE}/evaluations/${id}`, payload);

    return data.data;
  },

  async deleteEvaluation(id: number): Promise<void> {
    await client().delete(`${BASE}/evaluations/${id}`);
  },

  async saveGrades(id: number, grades: GradeEntryPayload[]): Promise<ClassEvaluationDetail> {
    const { data } = await client().put<ApiResponse<ClassEvaluationDetail>>(`${BASE}/evaluations/${id}/grades`, {
      grades,
    });

    return data.data;
  },

  async submitEvaluation(id: number): Promise<ClassEvaluation> {
    const { data } = await client().post<ApiResponse<ClassEvaluation>>(`${BASE}/evaluations/${id}/submit`);

    return data.data;
  },

  async reopenEvaluation(id: number): Promise<ClassEvaluation> {
    const { data } = await client().post<ApiResponse<ClassEvaluation>>(`${BASE}/evaluations/${id}/reopen`);

    return data.data;
  },

  async publishEvaluation(id: number): Promise<ClassEvaluation> {
    const { data } = await client().post<ApiResponse<ClassEvaluation>>(`${BASE}/evaluations/${id}/publish`);

    return data.data;
  },

  async unpublishEvaluation(id: number): Promise<ClassEvaluation> {
    const { data } = await client().post<ApiResponse<ClassEvaluation>>(`${BASE}/evaluations/${id}/unpublish`);

    return data.data;
  },

  async publishBulk(payload: PublishBulkPayload): Promise<PublishBulkResult> {
    const { data } = await client().post<ApiResponse<Omit<PublishBulkResult, 'message'>>>(
      `${BASE}/evaluations/publish-bulk`,
      payload,
    );

    return { ...(data.data ?? {}), message: data.message };
  },

  /* ------------------------- Résultats & bulletins ------------------------- */

  async getClassResults(classeId: number, semesterId: number, includeUnpublished = false): Promise<ClassResults> {
    const { data } = await client().get<ApiResponse<ClassResults>>(`${BASE}/results/classes/${classeId}`, {
      params: { semester_id: semesterId, include_unpublished: includeUnpublished ? 1 : 0 },
    });

    return data.data;
  },

  async getStudentResults(studentId: number, semesterId?: number): Promise<StudentResultsResponse> {
    const { data } = await client().get<StudentResultsResponse>(`${BASE}/results/students/${studentId}`, {
      params: cleanParams({ semester_id: semesterId }),
    });

    return data;
  },

  downloadStudentReportCard(studentId: number, semesterId: number): Promise<Blob> {
    return getBlob(`${BASE}/report-cards/students/${studentId}/pdf`, { semester_id: semesterId });
  },

  downloadClassReportCards(classeId: number, semesterId: number): Promise<Blob> {
    return getBlob(`${BASE}/report-cards/classes/${classeId}/pdf`, { semester_id: semesterId });
  },

  async saveReportCardComment(payload: ReportCardCommentPayload): Promise<ReportCardComment> {
    const { data } = await client().put<ApiResponse<ReportCardComment>>(`${BASE}/report-cards/comments`, payload);

    return data.data;
  },

  /* ---------------------------- Portails ---------------------------------- */

  /** Élève connecté : GET /api/frontend/student/my-grades */
  async getMyGrades(semesterId?: number): Promise<StudentResultsResponse> {
    const { data } = await client().get<StudentResultsResponse>('/frontend/student/my-grades', {
      params: cleanParams({ semester_id: semesterId }),
    });

    return data;
  },

  /** Parent : GET /api/admin/parent/children/{studentId}/grades */
  async getChildGrades(studentId: number, semesterId?: number): Promise<StudentResultsResponse> {
    const { data } = await client().get<StudentResultsResponse>(`/admin/parent/children/${studentId}/grades`, {
      params: cleanParams({ semester_id: semesterId }),
    });

    return data;
  },

  /* ------------------------- Données de référence -------------------------- */

  async getAcademicYears(): Promise<AcademicYearOption[]> {
    const { data } = await client().get<ApiResponse<AcademicYearOption[]>>('/admin/academic-years', {
      params: { per_page: 100 },
    });

    return (data.data ?? []).map((year) => ({
      id: year.id,
      name: year.name,
      is_active: Boolean(year.is_active),
      semesters: (year.semesters ?? []).map((semester) => ({ ...semester, academic_year_id: year.id })),
    }));
  },

  async getSemesters(academicYearId?: number): Promise<SemesterRef[]> {
    const { data } = await client().get<ApiResponse<SemesterRef[]>>('/admin/semesters', {
      params: cleanParams({ academic_year_id: academicYearId, per_page: 100 }),
    });

    return data.data ?? [];
  },

  /** Professeur : classes dont il est PP (et/ou affecté) — GET /api/frontend/teacher/my-classes */
  async getTeacherClasses(): Promise<ClasseOption[]> {
    const { data } = await client().get<ApiResponse<ClasseOption[]>>('/frontend/teacher/my-classes');

    return data.data ?? [];
  },

  async getClasses(academicYearId?: number): Promise<ClasseOption[]> {
    const { data } = await client().get<ApiResponse<ClasseOption[]>>('/admin/classes', {
      params: cleanParams({ academic_year_id: academicYearId, per_page: 200 }),
    });

    return data.data ?? [];
  },

  async getSubjects(): Promise<Array<{ id: number; name: string; code?: string | null }>> {
    const { data } = await client().get<ApiResponse<Array<{ id: number; name: string; code?: string | null }>>>(
      '/admin/subjects',
      { params: { per_page: 200, is_active: 1 } },
    );

    return data.data ?? [];
  },

  async getTeachers(): Promise<TeacherOption[]> {
    const { data } = await client().get<
      ApiResponse<Array<{ id: number; full_name?: string; firstname?: string; lastname?: string; name?: string }>>
    >('/admin/teachers', { params: { per_page: 500 } });

    return (data.data ?? []).map((teacher) => ({
      id: teacher.id,
      full_name:
        teacher.full_name ?? (`${teacher.firstname ?? ''} ${teacher.lastname ?? ''}`.trim() || teacher.name || `#${teacher.id}`),
    }));
  },
};

export default lyceeGradesService;
