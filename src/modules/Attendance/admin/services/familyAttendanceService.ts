import { createApiClient } from '@/shared/lib/api-client';

import type {
  AbsenceJustification,
  AttendanceRecord,
  AttendanceSession,
  FamilyStudent,
  SubmitJustificationRequest,
} from '../../types';

/**
 * Portail familles (rôles Parent / Élève) : `student_id` = fiche élève (students.id).
 * Un Parent n'agit que pour ses enfants, un Élève que pour lui-même (contrôlé côté API).
 */
class FamilyAttendanceService {
  private baseUrl = '/admin/attendance/my';

  async getStudents(tenantId?: string): Promise<FamilyStudent[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: FamilyStudent[] }>(`${this.baseUrl}/students`);

    return response.data.data;
  }

  async getAbsences(
    studentId?: number,
    tenantId?: string,
  ): Promise<Array<AttendanceRecord & { session?: AttendanceSession }>> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: Array<AttendanceRecord & { session?: AttendanceSession }> }>(
      `${this.baseUrl}/absences`,
      { params: { student_id: studentId } },
    );

    return response.data.data;
  }

  async getJustifications(studentId?: number, tenantId?: string): Promise<AbsenceJustification[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: AbsenceJustification[] }>(
      `${this.baseUrl}/justifications`,
      { params: { student_id: studentId } },
    );

    return response.data.data;
  }

  async submit(data: SubmitJustificationRequest, tenantId?: string): Promise<AbsenceJustification> {
    const client = createApiClient(tenantId);
    const formData = new FormData();

    if (data.student_id) {
      formData.append('student_id', String(data.student_id));
    }

    formData.append('absence_date_from', data.absence_date_from);
    formData.append('absence_date_to', data.absence_date_to);
    formData.append('type', data.type);
    formData.append('reason', data.reason);

    if (data.document) {
      formData.append('document', data.document);
    }

    const response = await client.post<{ message: string; data: AbsenceJustification }>(
      `${this.baseUrl}/justifications`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return response.data.data;
  }

  getDownloadUrl(justificationId: number): string {
    return `${this.baseUrl}/justifications/${justificationId}/download`;
  }
}

export const familyAttendanceService = new FamilyAttendanceService();
