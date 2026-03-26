import { createApiClient } from '@/shared/lib/api-client';

import type {
  AbsenceJustification,
  SubmitJustificationRequest,
  ValidateJustificationRequest,
  JustificationFilters,
  PaginatedResponse,
} from '../../types';

class JustificationService {
  private baseUrl = '/admin/justifications';

  async getAll(
    filters?: JustificationFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<AbsenceJustification>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<AbsenceJustification>>(
      this.baseUrl,
      { params: filters },
    );

    return response.data;
  }

  async getPending(tenantId?: string): Promise<AbsenceJustification[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<AbsenceJustification[]>(
      `${this.baseUrl}/pending`,
    );

    return response.data;
  }

  async submit(
    data: SubmitJustificationRequest,
    tenantId?: string,
  ): Promise<AbsenceJustification> {
    const client = createApiClient(tenantId);
    const formData = new FormData();
    formData.append('student_id', String(data.student_id));
    formData.append('absence_date_from', data.absence_date_from);
    formData.append('absence_date_to', data.absence_date_to);
    formData.append('type', data.type);
    formData.append('reason', data.reason);

    if (data.document) {
      formData.append('document', data.document);
    }

    const response = await client.post<AbsenceJustification>(this.baseUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  }

  async validate(
    justificationId: number,
    data: ValidateJustificationRequest,
    tenantId?: string,
  ): Promise<{ message: string; justification: AbsenceJustification }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; justification: AbsenceJustification }>(
      `${this.baseUrl}/${justificationId}/validate`,
      data,
    );

    return response.data;
  }

  async getStudentJustifications(
    studentId: number,
    tenantId?: string,
  ): Promise<AbsenceJustification[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<AbsenceJustification[]>(
      `${this.baseUrl}/students/${studentId}`,
    );

    return response.data;
  }

  getDownloadUrl(justificationId: number): string {
    return `${this.baseUrl}/${justificationId}/download`;
  }
}

export const justificationService = new JustificationService();
