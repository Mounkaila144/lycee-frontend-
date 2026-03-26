// ──── Enums / Constants ────

export type TranscriptType = 'semester' | 'global' | 'provisional';
export type TranscriptStatus = 'pending' | 'generated' | 'validated' | 'error';
export type DiplomaType = 'licence' | 'master' | 'doctorat' | 'ingenieur' | 'bts' | 'dut';
export type DiplomaStatus = 'generated' | 'signed' | 'delivered' | 'revoked';
export type DiplomaMention = 'passable' | 'assez_bien' | 'bien' | 'tres_bien' | 'excellent';
export type CertificateType = 'enrollment' | 'status' | 'achievement' | 'attendance' | 'schooling' | 'transfer';
export type CertificateRequestStatus = 'pending' | 'approved' | 'rejected';
export type CardStatus = 'active' | 'suspended' | 'expired' | 'lost' | 'replaced';
export type BadgeStatus = 'active' | 'suspended' | 'expired';
export type DocumentVerificationStatus = 'valid' | 'invalid' | 'expired' | 'revoked';
export type SignatureStatus = 'pending' | 'signed' | 'rejected' | 'expired';
export type ArchiveStatus = 'active' | 'archived' | 'cold_storage';

export const TRANSCRIPT_TYPE_LABELS: Record<TranscriptType, string> = {
  semester: 'Semestriel',
  global: 'Global',
  provisional: 'Provisoire',
};

export const TRANSCRIPT_TYPE_COLORS: Record<TranscriptType, string> = {
  semester: '#1976d2',
  global: '#4caf50',
  provisional: '#ff9800',
};

export const TRANSCRIPT_STATUS_LABELS: Record<TranscriptStatus, string> = {
  pending: 'En attente',
  generated: 'Généré',
  validated: 'Validé',
  error: 'Erreur',
};

export const TRANSCRIPT_STATUS_COLORS: Record<TranscriptStatus, string> = {
  pending: '#9e9e9e',
  generated: '#1976d2',
  validated: '#4caf50',
  error: '#f44336',
};

export const DIPLOMA_TYPE_LABELS: Record<DiplomaType, string> = {
  licence: 'Licence',
  master: 'Master',
  doctorat: 'Doctorat',
  ingenieur: 'Ingénieur',
  bts: 'BTS',
  dut: 'DUT',
};

export const DIPLOMA_STATUS_LABELS: Record<DiplomaStatus, string> = {
  generated: 'Généré',
  signed: 'Signé',
  delivered: 'Délivré',
  revoked: 'Révoqué',
};

export const DIPLOMA_STATUS_COLORS: Record<DiplomaStatus, string> = {
  generated: '#1976d2',
  signed: '#ff9800',
  delivered: '#4caf50',
  revoked: '#f44336',
};

export const DIPLOMA_MENTION_LABELS: Record<DiplomaMention, string> = {
  passable: 'Passable',
  assez_bien: 'Assez Bien',
  bien: 'Bien',
  tres_bien: 'Très Bien',
  excellent: 'Excellent',
};

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  enrollment: 'Inscription',
  status: 'Statut',
  achievement: 'Réussite',
  attendance: 'Assiduité',
  schooling: 'Scolarité',
  transfer: 'Transfert',
};

export const CERTIFICATE_TYPE_COLORS: Record<CertificateType, string> = {
  enrollment: '#1976d2',
  status: '#9c27b0',
  achievement: '#4caf50',
  attendance: '#ff9800',
  schooling: '#00bcd4',
  transfer: '#795548',
};

export const CERTIFICATE_REQUEST_STATUS_LABELS: Record<CertificateRequestStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
};

export const CERTIFICATE_REQUEST_STATUS_COLORS: Record<CertificateRequestStatus, string> = {
  pending: '#ff9800',
  approved: '#4caf50',
  rejected: '#f44336',
};

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  active: 'Active',
  suspended: 'Suspendue',
  expired: 'Expirée',
  lost: 'Perdue',
  replaced: 'Remplacée',
};

export const CARD_STATUS_COLORS: Record<CardStatus, string> = {
  active: '#4caf50',
  suspended: '#ff9800',
  expired: '#9e9e9e',
  lost: '#f44336',
  replaced: '#1976d2',
};

export const BADGE_STATUS_LABELS: Record<BadgeStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  expired: 'Expiré',
};

export const VERIFICATION_STATUS_LABELS: Record<DocumentVerificationStatus, string> = {
  valid: 'Valide',
  invalid: 'Invalide',
  expired: 'Expiré',
  revoked: 'Révoqué',
};

export const VERIFICATION_STATUS_COLORS: Record<DocumentVerificationStatus, string> = {
  valid: '#4caf50',
  invalid: '#f44336',
  expired: '#9e9e9e',
  revoked: '#d32f2f',
};

export const SIGNATURE_STATUS_LABELS: Record<SignatureStatus, string> = {
  pending: 'En attente',
  signed: 'Signé',
  rejected: 'Rejeté',
  expired: 'Expiré',
};

export const ARCHIVE_STATUS_LABELS: Record<ArchiveStatus, string> = {
  active: 'Actif',
  archived: 'Archivé',
  cold_storage: 'Stockage froid',
};

// ──── Summary Models ────

export interface StudentSummary {
  id: number;
  firstname: string;
  lastname: string;
  matricule?: string;
  email?: string;
  photo?: string;
}

export interface SemesterSummary {
  id: number;
  name: string;
  code: string;
}

export interface ProgrammeSummary {
  id: number;
  name: string;
  code: string;
}

// ──── Core Models ────

export interface Transcript {
  id: number;
  student_id: number;
  semester_id: number | null;
  academic_year_id: number;
  type: TranscriptType;
  generated_at: string;
  document_path: string | null;
  status: TranscriptStatus;
  qr_code: string | null;
  document_number: string | null;
  student?: StudentSummary;
  semester?: SemesterSummary;
  created_at: string;
  updated_at: string;
}

export interface Diploma {
  id: number;
  student_id: number;
  programme_id: number;
  academic_year_id: number;
  type: DiplomaType;
  registration_number: string;
  mention: DiplomaMention;
  status: DiplomaStatus;
  document_path: string | null;
  supplement_path: string | null;
  delivered_at: string | null;
  delivered_by: number | null;
  signed_at: string | null;
  signed_by: number | null;
  qr_code: string | null;
  student?: StudentSummary;
  programme?: ProgrammeSummary;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: number;
  student_id: number;
  academic_year_id: number;
  type: CertificateType;
  purpose: string | null;
  document_path: string | null;
  document_number: string | null;
  generated_at: string;
  valid_until: string | null;
  qr_code: string | null;
  student?: StudentSummary;
  created_at: string;
  updated_at: string;
}

export interface CertificateRequest {
  id: number;
  student_id: number;
  certificate_type: CertificateType;
  reason: string | null;
  status: CertificateRequestStatus;
  approved_by: number | null;
  rejected_reason: string | null;
  certificate_id: number | null;
  student?: StudentSummary;
  certificate?: Certificate;
  created_at: string;
  updated_at: string;
}

export interface StudentCard {
  id: number;
  student_id: number;
  academic_year_id: number;
  card_number: string;
  status: CardStatus;
  issued_at: string;
  expires_at: string;
  photo_path: string | null;
  qr_code: string | null;
  replaced_by: number | null;
  student?: StudentSummary;
  created_at: string;
  updated_at: string;
}

export interface AccessBadge {
  id: number;
  student_id: number;
  badge_number: string;
  status: BadgeStatus;
  access_level: string;
  issued_at: string;
  expires_at: string;
  permissions: string[];
  student?: StudentSummary;
  created_at: string;
  updated_at: string;
}

export interface AccessPermission {
  id: number;
  badge_id: number;
  zone: string;
  access_type: string;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface DocumentVerification {
  id: number;
  document_type: string;
  document_number: string;
  verification_code: string;
  verified_at: string;
  is_valid: boolean;
  status: DocumentVerificationStatus;
  verified_by: string | null;
  document_data: Record<string, unknown> | null;
  created_at: string;
}

export interface ElectronicSignature {
  id: number;
  document_type: string;
  document_id: number;
  signer_name: string;
  signer_role: string;
  status: SignatureStatus;
  signed_at: string | null;
  certificate_path: string | null;
  hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface Archive {
  id: number;
  document_type: string;
  document_id: number;
  document_number: string;
  status: ArchiveStatus;
  archived_at: string;
  storage_location: string;
  retention_until: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRegister {
  id: number;
  document_type: string;
  document_number: string;
  student_name: string;
  issued_at: string;
  status: string;
  verified_count: number;
  last_verified_at: string | null;
}

// ──── Request Types ────

export interface GenerateTranscriptRequest {
  student_id: number;
  semester_id?: number;
  academic_year_id: number;
  type: TranscriptType;
}

export interface BatchTranscriptRequest {
  student_ids: number[];
  semester_id?: number;
  academic_year_id: number;
  type: TranscriptType;
}

export interface CreateDiplomaRequest {
  student_id: number;
  programme_id: number;
  academic_year_id: number;
  type: DiplomaType;
  mention: DiplomaMention;
}

export interface UpdateDiplomaRequest extends Partial<CreateDiplomaRequest> {}

export interface DeliverDiplomaRequest {
  delivered_by: number;
  delivery_date: string;
  notes?: string;
}

export interface GenerateCertificateRequest {
  student_id: number;
  academic_year_id: number;
  type: CertificateType;
  purpose?: string;
}

export interface CreateCertificateRequestPayload {
  student_id: number;
  certificate_type: CertificateType;
  reason?: string;
}

export interface ApproveCertificateRequestPayload {
  approved_by: number;
}

export interface RejectCertificateRequestPayload {
  rejected_reason: string;
}

export interface CreateStudentCardRequest {
  student_id: number;
  academic_year_id: number;
}

export interface BatchCardRequest {
  student_ids: number[];
  academic_year_id: number;
}

export interface ReplaceCardRequest {
  reason: string;
}

export interface CreateAccessBadgeRequest {
  student_id: number;
  access_level: string;
  permissions: string[];
  expires_at: string;
}

export interface VerifyDocumentRequest {
  document_number?: string;
  qr_code?: string;
}

export interface CreateSignatureRequest {
  document_type: string;
  document_id: number;
  signer_name: string;
  signer_role: string;
}

// ──── Filter Types ────

export interface TranscriptFilters {
  academic_year_id?: number;
  semester_id?: number;
  student_id?: number;
  type?: TranscriptType;
  status?: TranscriptStatus;
}

export interface DiplomaFilters {
  academic_year_id?: number;
  programme_id?: number;
  student_id?: number;
  type?: DiplomaType;
  status?: DiplomaStatus;
}

export interface CertificateFilters {
  academic_year_id?: number;
  student_id?: number;
  type?: CertificateType;
}

export interface CertificateRequestFilters {
  status?: CertificateRequestStatus;
  certificate_type?: CertificateType;
  student_id?: number;
}

export interface CardFilters {
  academic_year_id?: number;
  student_id?: number;
  status?: CardStatus;
}

export interface VerificationFilters {
  document_type?: string;
  status?: DocumentVerificationStatus;
  date_from?: string;
  date_to?: string;
}

// ──── Response Types ────

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface TranscriptStatistics {
  total_generated: number;
  total_validated: number;
  total_pending: number;
  total_errors: number;
  by_type: Array<{ type: TranscriptType; count: number }>;
}

export interface DiplomaStatistics {
  total_diplomas: number;
  total_delivered: number;
  total_signed: number;
  total_pending: number;
  by_type: Array<{ type: DiplomaType; count: number }>;
  by_mention: Array<{ mention: DiplomaMention; count: number }>;
}

export interface CertificateStatistics {
  total_certificates: number;
  total_requests: number;
  pending_requests: number;
  by_type: Array<{ type: CertificateType; count: number }>;
}

export interface CardStatistics {
  total_cards: number;
  active_cards: number;
  suspended_cards: number;
  expired_cards: number;
  total_badges: number;
}

export interface VerificationStatistics {
  total_verifications: number;
  valid_count: number;
  invalid_count: number;
  total_documents: number;
  total_archives: number;
  total_cold_storage: number;
  total_signatures: number;
  pending_signatures: number;
}
