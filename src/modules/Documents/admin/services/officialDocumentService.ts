import { createApiClient } from '@/shared/lib/api-client';

export type DocumentCategory = 'certificate' | 'transcript' | 'diploma';

export type GeneratableCertificate =
  | 'enrollment'
  | 'status'
  | 'achievement'
  | 'attendance'
  | 'schooling'
  | 'transfer';

export interface DocumentStudent {
  id: number;
  matricule: string;
  firstname: string;
  lastname: string;
}

export interface OfficialDocument {
  id: number;
  student_id: number;
  document_type: string;
  document_number: string;
  issue_date: string | null;
  status: 'issued' | 'cancelled' | 'replaced' | string;
  verification_code: string;
  cancellation_reason: string | null;
  metadata: Record<string, unknown> | null;
  student?: DocumentStudent | null;
  academic_year?: { id: number; name: string } | null;
}

export interface DocumentRequestItem {
  id: number;
  student_id: number;
  document_type: string;
  quantity: number;
  reason: string;
  urgency: 'normal' | 'urgent';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'delivered' | string;
  request_date: string;
  rejection_reason: string | null;
  generated_document_id: number | null;
  student?: DocumentStudent | null;
}

export interface LaravelPaginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface GenerateCertificatePayload {
  student_id: number;
  academic_year_id: number;
  achievement_title?: string;
  achievement_description?: string;
  achievement_date?: string;
  transfer_destination?: string;
  transfer_reason?: string;
}

export interface VerificationResult {
  valid: boolean;
  message?: string;
  document?: {
    document_number: string;
    document_type: string;
    student_name: string;
    student_matricule: string;
    issue_date: string;
    academic_year: string | null;
    status: string;
  };
  verification?: { verified_at: string; verification_count: number };
}

export interface RegisterFilters {
  document_category?: DocumentCategory;
  document_type?: string;
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

const BASE = '/admin/documents';

/**
 * Service aligné sur les routes réelles du module backend Documents
 * (Modules/Documents/Routes/admin.php).
 */
export const officialDocumentService = {
  async getRegister(filters: RegisterFilters): Promise<LaravelPaginated<OfficialDocument>> {
    const { data } = await createApiClient().get<LaravelPaginated<OfficialDocument>>(
      `${BASE}/verification/register`,
      { params: filters },
    );

    return data;
  },

  async generateCertificate(type: GeneratableCertificate, payload: GenerateCertificatePayload): Promise<OfficialDocument> {
    const { data } = await createApiClient().post<{ document: OfficialDocument }>(
      `${BASE}/certificates/${type}`,
      payload,
    );

    return data.document;
  },

  async verify(mode: 'qr-code' | 'document-number', value: string): Promise<VerificationResult> {
    const payload = mode === 'qr-code' ? { verification_code: value } : { document_number: value };
    const { data } = await createApiClient().post<VerificationResult>(`${BASE}/verification/${mode}`, payload);

    return data;
  },

  async cancelDocument(documentId: number, reason: string): Promise<void> {
    await createApiClient().post(`${BASE}/verification/documents/${documentId}/cancel`, { reason });
  },

  async getRequests(params: { status?: string; page?: number }): Promise<LaravelPaginated<DocumentRequestItem>> {
    const { data } = await createApiClient().get<LaravelPaginated<DocumentRequestItem>>(
      `${BASE}/certificates/requests`,
      { params },
    );

    return data;
  },

  async approveRequest(requestId: number, notes?: string): Promise<void> {
    await createApiClient().post(`${BASE}/certificates/requests/${requestId}/approve`, { notes });
  },

  async rejectRequest(requestId: number, reason: string): Promise<void> {
    await createApiClient().post(`${BASE}/certificates/requests/${requestId}/reject`, { reason });
  },

  async searchStudents(search: string): Promise<DocumentStudent[]> {
    const { data } = await createApiClient().get<{ data: DocumentStudent[] }>('/admin/enrollment/students', {
      params: { search, per_page: 20 },
    });

    return data.data ?? [];
  },

  async getAcademicYears(): Promise<{ id: number; name: string; is_active: boolean }[]> {
    const { data } = await createApiClient().get<{ data: { id: number; name: string; is_active: boolean }[] }>(
      '/admin/academic-years',
    );

    return data.data ?? [];
  },
};
