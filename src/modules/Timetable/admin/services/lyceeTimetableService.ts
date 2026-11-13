import { createApiClient } from '@/shared/lib/api-client';

import type {
  LyceeSlot,
  PortalTimetableSlot,
  RefOption,
  SemesterOption,
  SlotPayload,
  TimetableGridResponse,
  TimetableReferenceData,
} from '../../types/lycee.types';

interface AcademicYearDto {
  id: number;
  name: string;
  is_active: boolean;
  semesters?: Array<{ id: number; name: string; is_active: boolean; academic_year_id: number }>;
}

interface ClasseDto {
  id: number;
  name: string;
  academic_year_id: number;
}

/**
 * Emplois du temps (lycée) — appels vers les endpoints réels du module Timetable.
 * Backend : Modules/Timetable/Routes/admin.php
 */
class LyceeTimetableService {
  private baseUrl = '/admin/timetable';

  async getReferenceData(): Promise<TimetableReferenceData & { classAcademicYears: Record<number, number> }> {
    const client = createApiClient();

    const [years, classes, subjects, teachers, rooms] = await Promise.all([
      client.get<{ data: AcademicYearDto[] }>('/admin/academic-years', { params: { per_page: 100 } }),
      client.get<{ data: ClasseDto[] }>('/admin/classes', { params: { per_page: 200 } }),
      client.get<{ data: Array<{ id: number; name: string; code: string }> }>('/admin/subjects', {
        params: { per_page: 200, is_active: 1 },
      }),
      client.get<{ data: Array<{ id: number; full_name?: string; firstname?: string; lastname?: string }> }>(
        '/admin/teachers',
        { params: { per_page: 200 } },
      ),
      client
        .get<{ data: Array<{ id: number; name: string; code: string }> }>('/admin/rooms', { params: { per_page: 200 } })
        .catch(() => ({ data: { data: [] as Array<{ id: number; name: string; code: string }> } })),
    ]);

    const semesters: SemesterOption[] = (years.data.data ?? []).flatMap((year) =>
      (year.semesters ?? []).map((semester) => ({
        id: semester.id,
        label: `${semester.name} ${year.name}`,
        is_active: semester.is_active,
        academic_year_id: year.id,
      })),
    );

    const classAcademicYears: Record<number, number> = {};

    (classes.data.data ?? []).forEach((classe) => {
      classAcademicYears[classe.id] = classe.academic_year_id;
    });

    const toOptions = <T extends { id: number }>(items: T[] | undefined, label: (item: T) => string): RefOption[] =>
      (items ?? []).map((item) => ({ id: item.id, label: label(item) }));

    return {
      semesters,
      classes: toOptions(classes.data.data, (classe) => classe.name),
      subjects: toOptions(subjects.data.data, (subject) => subject.name),
      teachers: toOptions(teachers.data.data, (teacher) =>
        teacher.full_name ?? `${teacher.firstname ?? ''} ${teacher.lastname ?? ''}`.trim(),
      ),
      rooms: toOptions(rooms.data.data, (room) => room.name),
      classAcademicYears,
    };
  }

  async getClasseTimetable(classeId: number, semesterId?: number): Promise<TimetableGridResponse> {
    const response = await createApiClient().get<TimetableGridResponse>(`${this.baseUrl}/classes/${classeId}`, {
      params: { semester_id: semesterId },
    });

    return response.data;
  }

  async getTeacherTimetable(teacherId: number, semesterId: number): Promise<TimetableGridResponse> {
    const response = await createApiClient().get<TimetableGridResponse>(`${this.baseUrl}/teachers/${teacherId}`, {
      params: { semester_id: semesterId },
    });

    return response.data;
  }

  async getRoomTimetable(roomId: number, semesterId: number): Promise<TimetableGridResponse> {
    const response = await createApiClient().get<TimetableGridResponse>(`${this.baseUrl}/rooms/${roomId}`, {
      params: { semester_id: semesterId },
    });

    return response.data;
  }

  async getStudentTimetable(studentId: number, semesterId?: number): Promise<TimetableGridResponse> {
    const response = await createApiClient().get<TimetableGridResponse>(`${this.baseUrl}/students/${studentId}`, {
      params: { semester_id: semesterId },
    });

    return response.data;
  }

  /** Emploi du temps de l'enseignant connecté. */
  async getMyTimetable(semesterId?: number): Promise<TimetableGridResponse> {
    const response = await createApiClient().get<TimetableGridResponse>(`${this.baseUrl}/me`, {
      params: { semester_id: semesterId },
    });

    return response.data;
  }

  async getClasseStudents(classeId: number): Promise<RefOption[]> {
    const response = await createApiClient().get<{
      data: Array<{ id: number; student_id?: number; firstname?: string; lastname?: string; full_name?: string; student?: { id: number; firstname: string; lastname: string } }>;
    }>(`/admin/classes/${classeId}/students`, { params: { per_page: 200 } });

    return (response.data.data ?? []).map((row) => {
      const id = row.student?.id ?? row.student_id ?? row.id;

      const label =
        row.full_name ??
        `${row.student?.firstname ?? row.firstname ?? ''} ${row.student?.lastname ?? row.lastname ?? ''}`.trim();

      return { id, label: label || `Élève #${id}` };
    });
  }

  async createSlot(payload: SlotPayload): Promise<LyceeSlot> {
    const response = await createApiClient().post<{ data: LyceeSlot }>(`${this.baseUrl}/slots`, payload);

    return response.data.data;
  }

  async updateSlot(id: number, payload: Partial<SlotPayload>): Promise<LyceeSlot> {
    const response = await createApiClient().put<{ data: LyceeSlot }>(`${this.baseUrl}/slots/${id}`, payload);

    return response.data.data;
  }

  async deleteSlot(id: number): Promise<void> {
    await createApiClient().delete(`${this.baseUrl}/slots/${id}`);
  }
}

export const lyceeTimetableService = new LyceeTimetableService();

/** Convertit la grille API (par jour) en liste plate. */
export const flattenGrid = (grid: TimetableGridResponse | null | undefined): LyceeSlot[] =>
  grid ? Object.values(grid.data ?? {}).flat() : [];

/** Convertit une liste « portail » (Élève / Parent) au format LyceeSlot minimal pour l'affichage. */
export const portalToSlots = (rows: PortalTimetableSlot[]): LyceeSlot[] =>
  rows.map((row) => ({
    id: row.id,
    day_of_week: (row.day_of_week ?? row.day) as LyceeSlot['day_of_week'],
    start_time: row.start_time,
    end_time: row.end_time,
    time_range: `${row.start_time} - ${row.end_time}`,
    type: (row.type ?? 'CM') as LyceeSlot['type'],
    is_recurring: true,
    notes: null,
    subject_id: null,
    classe_id: null,
    teacher_id: 0,
    room_id: null,
    semester_id: 0,
    subject: row.subject ? { id: 0, code: '', name: row.subject } : null,
    teacher: row.teacher ? { id: 0, name: row.teacher } : null,
    room: row.classroom || row.room ? { id: 0, code: '', name: (row.classroom ?? row.room) as string } : null,
    classe: row.classe ? { id: 0, name: row.classe, classroom: null } : null,
  }));
