import { createApiClient } from '@/shared/lib/api-client';
import type {
  Announcement,
  ChildAttendanceRecord,
  ChildDocument,
  ChildGrade,
  ChildInvoice,
  ChildSummary,
  ChildTimetableSlot,
  OnlinePaymentInitResponse,
  OnlinePaymentStatus,
  ParentProfile,
} from '../types/portail-parent.types';

/**
 * Portail Parent — appels API back-end.
 * Tous les endpoints sont sous `/api/admin/parent/*` (cf. backend
 * `Modules/PortailParent/Routes/admin.php`).
 */
export const parentService = {
  async me(): Promise<ParentProfile> {
    const { data } = await createApiClient().get<{ data: ParentProfile }>(
      '/admin/parent/me'
    );
    return data.data;
  },

  async myChildren(): Promise<ChildSummary[]> {
    const { data } = await createApiClient().get<{ data: ChildSummary[] }>(
      '/admin/parent/me/children'
    );
    return data.data;
  },

  async getChild(studentId: number): Promise<ChildSummary> {
    const { data } = await createApiClient().get<{ data: ChildSummary }>(
      `/admin/parent/children/${studentId}`
    );
    return data.data;
  },

  async childGrades(studentId: number): Promise<ChildGrade[]> {
    const { data } = await createApiClient().get<{ data: ChildGrade[] }>(
      `/admin/parent/children/${studentId}/grades`
    );
    return data.data;
  },

  async childAttendance(studentId: number): Promise<ChildAttendanceRecord[]> {
    const { data } = await createApiClient().get<{ data: ChildAttendanceRecord[] }>(
      `/admin/parent/children/${studentId}/attendance`
    );
    return data.data;
  },

  async childInvoices(studentId: number): Promise<ChildInvoice[]> {
    const { data } = await createApiClient().get<{ data: ChildInvoice[] }>(
      `/admin/parent/children/${studentId}/invoices`
    );
    return data.data;
  },

  async childTimetable(studentId: number): Promise<ChildTimetableSlot[]> {
    const { data } = await createApiClient().get<{ data: ChildTimetableSlot[] }>(
      `/admin/parent/children/${studentId}/timetable`
    );
    return data.data;
  },

  async childDocuments(studentId: number): Promise<ChildDocument[]> {
    const { data } = await createApiClient().get<{ data: ChildDocument[] }>(
      `/admin/parent/children/${studentId}/documents`
    );
    return data.data;
  },

  async announcements(): Promise<Announcement[]> {
    const { data } = await createApiClient().get<{ data: Announcement[] }>(
      '/admin/parent/announcements'
    );
    return data.data;
  },

  async initiatePayment(
    studentId: number,
    invoiceId: number,
    params: { method: 'mobile_money' | 'card'; amount: number; phone?: string }
  ): Promise<OnlinePaymentInitResponse> {
    const { data } = await createApiClient().post<{ data: OnlinePaymentInitResponse }>(
      `/admin/parent/children/${studentId}/invoices/${invoiceId}/pay`,
      params
    );
    return data.data;
  },

  async paymentStatus(paymentId: number): Promise<OnlinePaymentStatus> {
    const { data } = await createApiClient().get<{ data: OnlinePaymentStatus }>(
      `/admin/parent/payments/${paymentId}/status`
    );
    return data.data;
  },
};
