import { createApiClient } from '@/shared/lib/api-client';
import type {
  StudentAttendanceRecord,
  StudentCard,
  StudentDashboard,
  StudentDocument,
  StudentGrade,
  StudentInvoice,
  StudentProfile,
  StudentReenrollment,
} from '../types';
import type { PortalTimetableSlot } from '@/modules/Timetable/types/lycee.types';

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
  myGrades: () => get<StudentGrade[]>('/my-grades'),
  myAttendance: () => get<StudentAttendanceRecord[]>('/my-attendance'),
  myInvoices: () => get<StudentInvoice[]>('/my-invoices'),
  myDocuments: () => get<StudentDocument[]>('/my-documents'),
  myTimetable: () => get<PortalTimetableSlot[]>('/my-timetable'),
  myCard: () => get<StudentCard>('/my-card'),
  reenrollment: () => get<StudentReenrollment>('/reenrollment'),
};
