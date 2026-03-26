// ──── Enums / Constants ────

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type SessionStatus = 'open' | 'completed' | 'cancelled';
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

export interface TimetableSlotSummary {
  id: number;
  module_id: number;
  teacher_id: number;
  group_id: number;
  room_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  type: string;
  module?: ModuleSummary;
}

export interface AttendanceSession {
  id: number;
  timetable_slot_id: number;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  status: SessionStatus;
  method: SessionMethod;
  created_by: number;
  completed_by: number | null;
  completed_at: string | null;
  notes: string | null;
  timetable_slot?: TimetableSlotSummary;
  creator?: StudentSummary;
  records?: AttendanceRecord[];
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
  student?: StudentSummary;
  created_at: string;
  updated_at: string;
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
  student?: StudentSummary;
  created_at: string;
  updated_at: string;
}

// ──── Request Types ────

export interface CreateSessionRequest {
  timetable_slot_id: number;
  session_date: string;
  method?: SessionMethod;
}

export interface RecordAttendanceRequest {
  session_id: number;
  student_id: number;
  status: AttendanceStatus;
  arrival_time?: string;
}

export interface ModifyRecordRequest {
  status: AttendanceStatus;
  reason: string;
}

export interface SubmitJustificationRequest {
  student_id: number;
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
  status?: SessionStatus;
}

export interface JustificationFilters {
  status?: JustificationStatus;
  student_id?: number;
}

export interface ReportFilters {
  semester_id: number;
  group_id?: number;
}

// ──── Response Types ────

export interface AttendanceRates {
  overall_rate: number;
  by_module: Array<{
    module_id: number;
    module_name: string;
    rate: number;
    total_sessions: number;
  }>;
  by_group: Array<{
    group_id: number;
    group_name: string;
    rate: number;
  }>;
}

export interface AbsenteeEntry {
  student: StudentSummary;
  absence_count: number;
  absence_rate: number;
  last_absence_date: string;
}

export interface DetailedStatistics {
  total_sessions: number;
  total_students: number;
  average_attendance_rate: number;
  by_day: Array<{ day: string; rate: number }>;
  by_module: Array<{ module_name: string; rate: number }>;
  trend: Array<{ week: string; rate: number }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface StudentHistory {
  records: AttendanceRecord[];
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendance_rate: number;
  };
}
