import { createApiClient } from '@/shared/lib/api-client';
import type {
  StudentAttendanceRecord,
  StudentCard,
  StudentDashboard,
  StudentDocument,
  StudentInvoice,
  StudentProfile,
  StudentReenrollment,
  StudentReenrollmentIntention,
} from '../types';
import type { PortalTimetableSlot } from '@/modules/Timetable/types/lycee.types';
import type { StudentResultsResponse } from '@/modules/Grades/lycee/types';

interface StudentPortalResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

const get = async <T>(path: string): Promise<T> => {
  const { data } = await createApiClient().get<StudentPortalResponse<T>>(`/frontend/student${path}`);

  return data.data;
};

export const studentPortalService = {
  me: () => get<StudentProfile>('/me'),
  dashboard: () => get<StudentDashboard>('/dashboard'),

  /** Relevé lycée (évaluations publiées) ; `meta.semesters` liste les semestres de l'année. */
  myGrades: async (semesterId?: number): Promise<StudentResultsResponse> => {
    const { data } = await createApiClient().get<StudentResultsResponse>('/frontend/student/my-grades', {
      params: semesterId ? { semester_id: semesterId } : undefined,
    });

    return data;
  },
  myAttendance: () => get<StudentAttendanceRecord[]>('/my-attendance'),
  myInvoices: () => get<StudentInvoice[]>('/my-invoices'),
  myDocuments: () => get<StudentDocument[]>('/my-documents'),
  myTimetable: () => get<PortalTimetableSlot[]>('/my-timetable'),
  myCard: () => get<StudentCard>('/my-card'),
  reenrollment: () => get<StudentReenrollment>('/reenrollment'),

  /** Intention de réinscription (oui / non) pour une campagne ouverte. */
  saveReenrollmentIntention: async (
    campaignId: number,
    wantsToReenroll: boolean,
    comment?: string,
  ): Promise<StudentReenrollmentIntention> => {
    const { data } = await createApiClient().post<StudentPortalResponse<StudentReenrollmentIntention>>(
      '/frontend/student/reenrollment/intention',
      { campaign_id: campaignId, wants_to_reenroll: wantsToReenroll, comment: comment || null },
    );

    return data.data;
  },
};
