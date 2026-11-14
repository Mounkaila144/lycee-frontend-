import { createApiClient } from '@/shared/lib/api-client';

import type {
  PortalAccount,
  PortalAccountCredentials,
  StudentClassEnrollment,
  StudentParent,
  StudentParentFormData,
} from '../../types/studentManagement.types';

const baseUrl = '/admin/enrollment';

/**
 * Inscription en classe, parents et comptes de connexion d'un élève (Admin | Manager).
 */
export const studentManagementService = {
  /* ------------------------------ Classe ------------------------------ */

  async getClassEnrollments(studentId: number): Promise<StudentClassEnrollment[]> {
    const { data } = await createApiClient().get<{ data: StudentClassEnrollment[] }>(
      `${baseUrl}/students/${studentId}/class-enrollments`,
    );

    return data.data;
  },

  async enrollInClass(studentId: number, classeId: number, notes?: string): Promise<StudentClassEnrollment> {
    const { data } = await createApiClient().post<{ data: StudentClassEnrollment }>(
      `${baseUrl}/students/${studentId}/class-enrollments`,
      { classe_id: classeId, notes: notes || undefined },
    );

    return data.data;
  },

  async changeClass(studentId: number, classeId: number, reason?: string): Promise<StudentClassEnrollment> {
    const { data } = await createApiClient().post<{ data: StudentClassEnrollment }>(
      `${baseUrl}/students/${studentId}/change-class`,
      { classe_id: classeId, reason: reason || undefined },
    );

    return data.data;
  },

  async cancelClassEnrollment(enrollmentId: number, reason?: string): Promise<StudentClassEnrollment> {
    const { data } = await createApiClient().post<{ data: StudentClassEnrollment }>(
      `${baseUrl}/class-enrollments/${enrollmentId}/cancel`,
      { reason: reason || undefined },
    );

    return data.data;
  },

  /* ------------------------------ Parents ----------------------------- */

  async getParents(studentId: number): Promise<StudentParent[]> {
    const { data } = await createApiClient().get<{ data: StudentParent[] }>(`${baseUrl}/students/${studentId}/parents`);

    return data.data;
  },

  async searchParents(search: string): Promise<StudentParent[]> {
    const { data } = await createApiClient().get<{ data: StudentParent[] }>(`${baseUrl}/parents`, {
      params: { search },
    });

    return data.data;
  },

  async createParent(studentId: number, payload: StudentParentFormData): Promise<StudentParent> {
    const { data } = await createApiClient().post<{ data: StudentParent }>(
      `${baseUrl}/students/${studentId}/parents`,
      payload,
    );

    return data.data;
  },

  async linkParent(
    studentId: number,
    parentId: number,
    flags: { is_primary_contact?: boolean; is_financial_responsible?: boolean } = {},
  ): Promise<StudentParent> {
    const { data } = await createApiClient().post<{ data: StudentParent }>(
      `${baseUrl}/students/${studentId}/parents/link`,
      { parent_id: parentId, ...flags },
    );

    return data.data;
  },

  async unlinkParent(studentId: number, parentId: number): Promise<void> {
    await createApiClient().delete(`${baseUrl}/students/${studentId}/parents/${parentId}`);
  },

  /* ------------------------- Comptes de connexion ------------------------- */

  async getStudentAccount(studentId: number): Promise<PortalAccount | null> {
    const { data } = await createApiClient().get<{ data: PortalAccount | null }>(
      `${baseUrl}/students/${studentId}/account`,
    );

    return data.data;
  },

  async createStudentAccount(studentId: number, username?: string): Promise<PortalAccountCredentials> {
    const { data } = await createApiClient().post<{ data: PortalAccountCredentials }>(
      `${baseUrl}/students/${studentId}/account`,
      { username: username || undefined },
    );

    return data.data;
  },

  async resetStudentPassword(studentId: number): Promise<PortalAccountCredentials> {
    const { data } = await createApiClient().post<{ data: PortalAccountCredentials }>(
      `${baseUrl}/students/${studentId}/account/reset-password`,
    );

    return data.data;
  },

  async setStudentAccountActive(studentId: number, isActive: boolean): Promise<PortalAccount> {
    const { data } = await createApiClient().patch<{ data: PortalAccount }>(
      `${baseUrl}/students/${studentId}/account/status`,
      { is_active: isActive },
    );

    return data.data;
  },

  async createParentAccount(parentId: number, username?: string): Promise<PortalAccountCredentials> {
    const { data } = await createApiClient().post<{ data: PortalAccountCredentials }>(
      `${baseUrl}/parents/${parentId}/account`,
      { username: username || undefined },
    );

    return data.data;
  },

  async resetParentPassword(parentId: number): Promise<PortalAccountCredentials> {
    const { data } = await createApiClient().post<{ data: PortalAccountCredentials }>(
      `${baseUrl}/parents/${parentId}/account/reset-password`,
    );

    return data.data;
  },

  async setParentAccountActive(parentId: number, isActive: boolean): Promise<PortalAccount> {
    const { data } = await createApiClient().patch<{ data: PortalAccount }>(
      `${baseUrl}/parents/${parentId}/account/status`,
      { is_active: isActive },
    );

    return data.data;
  },
};
