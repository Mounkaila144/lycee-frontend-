// ──── Enums / Constants ────

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type SessionStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';
export type SessionMethod = 'manual' | 'mobile' | 'qr_code' | 'imported';
export type JustificationType = 'medical' | 'family' | 'administrative' | 'other';
export type JustificationStatus = 'pending' | 'approved' | 'rejected';
export type AlertType = 'threshold_warning' | 'threshold_critical' | 'repeated_absences';
export type AlertStatus = 'pending' | 'notified' | 'acknowledged';

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Présent',
  absent: 'Absent',
  late: 'En retard',
  excused: 'Excusé',
};

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: '#4caf50',
  absent: '#f44336',
  late: '#ff9800',
  excused: '#2196f3',
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  draft: 'En cours',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export const JUSTIFICATION_STATUS_LABELS: Record<JustificationStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};

export const JUSTIFICATION_TYPE_LABELS: Record<JustificationType, string> = {
  medical: 'Médical',
  family: 'Familial',
  administrative: 'Administratif',
  other: 'Autre',
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  threshold_warning: 'Avertissement seuil',
  threshold_critical: 'Seuil critique',
  repeated_absences: 'Absences répétées',
};

// ──── Core Models ────

export interface StudentSummary {
  id: number;
  firstname: string;
  lastname: string;
  matricule?: string;
  email?: string;
  photo?: string;
}

export interface ModuleSummary {
  id: number;
  name: string;
  code: string;
}

export interface ClasseSummary {
  id: number;
  name: string;
  academic_year_id?: number;
  head_teacher_id?: number | null;
  active_enrollments_count?: number;
}

export interface SubjectSummary {
  id: number;
  name: string;
  code?: string;
}

export interface TimetableSlotSummary {
  id: number;
  module_id: number | null;
  teacher_id: number;
  group_id: number | null;
  room_id: number | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  type: string;
  module?: ModuleSummary;
}

export interface AttendanceSession {
  id: number;
  timetable_slot_id: number | null;
  classe_id: number | null;
  subject_id: number | null;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  status: SessionStatus;
  method: SessionMethod;
  created_by: number;
  completed_by: number | null;
  completed_at: string | null;
  notes: string | null;
  timetable_slot?: TimetableSlotSummary | null;
  classe?: ClasseSummary | null;
  subject?: SubjectSummary | null;
  creator?: StudentSummary;
  records?: AttendanceRecord[];
  records_count?: number;
  present_count?: number;
  absent_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: number;
  attendance_session_id: number;
  student_id: number;
  status: AttendanceStatus;
  arrival_time: string | null;
  delay_minutes: number | null;
  notes: string | null;
  recorded_by: number | null;
  modified_by: number | null;
  modification_reason: string | null;

  /** Auteur de la dernière correction (PUT /records/{id}), si l'enregistrement a été corrigé. */
  modifier?: StudentSummary | null;
  student?: StudentSummary;
  student_profile?: StudentSummary | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSheet {
  session: AttendanceSession;
  records: AttendanceRecord[];
  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}

export interface AbsenceJustification {
  id: number;
  student_id: number;
  absence_date_from: string;
  absence_date_to: string;
  type: JustificationType;
  reason: string;
  document_path: string | null;
  status: JustificationStatus;
  submitted_by: number;
  validated_by: number | null;
  validated_at: string | null;
  validation_notes: string | null;
  student?: StudentSummary;
  submitter?: StudentSummary;
  validator?: StudentSummary;
  created_at: string;
  updated_at: string;
}

export interface AttendanceAlert {
  id: number;
  student_id: number;
  semester_id: number;
  alert_type: AlertType;
  absence_count: number;
  absence_rate: number;
  threshold_value: number;
  message: string;
  status: AlertStatus;
  notified_at: string | null;
  acknowledged_at: string | null;
  acknowledged_by: number | null;
  student?: StudentSummary | null;
  created_at: string;
  updated_at: string;
}

// ──── Request Types ────

export interface CreateSessionRequest {
  classe_id?: number;
  timetable_slot_id?: number;
  subject_id?: number;
  session_date: string;
  start_time?: string;
  end_time?: string;
  method?: SessionMethod;
  notes?: string;
}

export interface RecordAttendanceRequest {
  session_id: number;
  student_id: number;
  status: AttendanceStatus;
  arrival_time?: string;
}

/** Saisie en lot : même statut pour toute la séance (ou les élèves listés, users.id). */
export interface BulkRecordAttendanceRequest {
  status: AttendanceStatus;
  student_ids?: number[];
}

export interface ModifyRecordRequest {
  status: AttendanceStatus;
  reason: string;
}

/**
 * Côté administration, `student_id` = compte utilisateur de l'élève (users.id).
 * Côté portail Parent / Élève, `student_id` = fiche élève (students.id), facultatif pour un Élève.
 */
export interface SubmitJustificationRequest {
  student_id?: number;
  absence_date_from: string;
  absence_date_to: string;
  type: JustificationType;
  reason: string;
  document?: File;
}

export interface ValidateJustificationRequest {
  decision: 'approved' | 'rejected';
  notes?: string;
}

export interface QRCodeAttendanceRequest {
  session_id: number;
  student_id: number;
  qr_token: string;
}

// ──── Filter Types ────

export interface SessionFilters {
  semester_id?: number;
  classe_id?: number;
  session_date?: string;
  status?: SessionStatus;
  page?: number;
  per_page?: number;
}

export interface JustificationFilters {
  status?: JustificationStatus;
  student_id?: number;
  type?: JustificationType;
  page?: number;
  per_page?: number;
}

export interface ReportFilters {
  semester_id: number;
  classe_id?: number;
  date_from?: string;
  date_to?: string;
}

export type AlertStatusFilter = 'active' | 'acknowledged' | 'all';

export interface AlertFilters {
  semester_id: number;
  classe_id?: number;
  status?: AlertStatusFilter;
}

export type ExportType = 'students' | 'modules';

export interface StudentExportRow extends AttendanceRates {
  student_id: number;
  name: string;
  email: string | null;
}

// ──── Response Types ────

export interface AttendanceRates {
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  presence_rate: number;
  absence_rate: number;
}

export interface AbsenteeEntry {
  student_id: number;
  student_name: string;
  student_email: string;
  statistics: AttendanceRates;
}

export interface DetailedStatistics {
  global: AttendanceRates;
  by_module: Array<{
    module_id: number | null;
    module_name: string;
    total_records: number;
    present_count: number;
    absent_count: number;
    late_count: number;
  }>;
  by_classe: Array<{
    classe_id: number | null;
    classe_name: string;
    total_records: number;
    present_count: number;
    absent_count: number;
  }>;
  /** day_of_week : 1 = dimanche … 7 = samedi (DAYOFWEEK MySQL). */
  by_day: Array<{ day_of_week: number; total_records: number; absent_count: number }>;
  semester_id: number;
}

export interface SemesterSummary {
  id: number;
  name: string;
  academic_year_id: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_current?: boolean;
}

export interface FamilyStudent {
  id: number;
  user_id: number | null;
  matricule: string | null;
  firstname: string;
  lastname: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface StudentHistory {
  records: Array<AttendanceRecord & { session?: AttendanceSession }>;
  statistics: AttendanceRates;
}
