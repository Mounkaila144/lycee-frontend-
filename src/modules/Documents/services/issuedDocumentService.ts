import { createApiClient } from '@/shared/lib/api-client';

/**
 * Document officiel émis (certificat, attestation, relevé...) tel que renvoyé par
 * GET /admin/documents/students/{student}.
 */
export interface IssuedDocument {
  id: number;
  student_id: number;
  document_type: string;
  document_number: string;
  issue_date: string | null;
  status: string;
  academic_year: string | null;
  verification_code: string;
  download_url: string;
}

export const ISSUED_DOCUMENT_TYPE_LABELS: Record<string, string> = {
  certificate_enrollment: "Certificat d'inscription",
  certificate_status: 'Attestation de statut',
  certificate_achievement: 'Attestation de réussite',
  certificate_attendance: "Attestation d'assiduité",
  certificate_schooling: 'Certificat de scolarité',
  certificate_transfer: 'Certificat de transfert (exeat)',
  transcript_semester: 'Relevé de notes',
  transcript_provisional: 'Relevé de notes provisoire',
  transcript_global: 'Relevé de notes global',
  diploma: "Certificat de fin d'études",
};

export const issuedDocumentLabel = (type: string): string => ISSUED_DOCUMENT_TYPE_LABELS[type] ?? type;

/**
 * Accès aux documents émis — partagé Admin/Manager, Élève (ses documents) et
 * Parent (documents de ses enfants). L'ownership est vérifié côté backend.
 */
export const issuedDocumentService = {
  async listForStudent(studentId: number): Promise<IssuedDocument[]> {
    const { data } = await createApiClient().get<{ data: IssuedDocument[] }>(
      `/admin/documents/students/${studentId}`,
    );

    return data.data ?? [];
  },

  async download(documentId: number, fileName: string): Promise<void> {
    const response = await createApiClient().get<Blob>(`/admin/documents/files/${documentId}/download`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
