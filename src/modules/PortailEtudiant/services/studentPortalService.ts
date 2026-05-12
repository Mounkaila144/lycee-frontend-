import { createApiClient } from '@/shared/lib/api-client';

interface StudentPortalResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export const studentPortalService = {
  async me() {
    const { data } = await createApiClient().get<StudentPortalResponse<any>>(
      '/frontend/student/me'
    );
    return data.data;
  },
  async dashboard() {
    const { data } = await createApiClient().get<StudentPortalResponse<any>>(
      '/frontend/student/dashboard'
    );
    return data.data;
  },
  async myGrades() {
    const { data } = await createApiClient().get<StudentPortalResponse<any[]>>(
      '/frontend/student/my-grades'
    );
    return data.data;
  },
  async myAttendance() {
    const { data } = await createApiClient().get<StudentPortalResponse<any[]>>(
      '/frontend/student/my-attendance'
    );
    return data.data;
  },
  async myInvoices() {
    const { data } = await createApiClient().get<StudentPortalResponse<any[]>>(
      '/frontend/student/my-invoices'
    );
    return data.data;
  },
  async myDocuments() {
    const { data } = await createApiClient().get<StudentPortalResponse<any[]>>(
      '/frontend/student/my-documents'
    );
    return data.data;
  },
  async myTimetable() {
    const { data } = await createApiClient().get<StudentPortalResponse<any[]>>(
      '/frontend/student/my-timetable'
    );
    return data.data;
  },
  async myCard() {
    const { data } = await createApiClient().get<StudentPortalResponse<any>>(
      '/frontend/student/my-card'
    );
    return data.data;
  },
  async reenrollment() {
    const { data } = await createApiClient().get<StudentPortalResponse<any>>(
      '/frontend/student/reenrollment'
    );
    return data.data;
  },
};
