// ──── Enums / Constants ────

export type ExamType = 'written' | 'oral' | 'practical';
export type ExamSessionStatus = 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type SupervisorRole = 'chief' | 'regular';
export type ExamAttendanceStatus = 'present' | 'absent' | 'late';
export type SubmissionStatus = 'pending' | 'submitted' | 'not_submitted';
export type IncidentType = 'cheating' | 'disruption' | 'medical' | 'material' | 'other';
export type IncidentSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'escalated';

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  written: 'Écrit',
  oral: 'Oral',
  practical: 'Pratique',
};

export const EXAM_TYPE_COLORS: Record<ExamType, string> = {
  written: '#1976d2',
  oral: '#9c27b0',
  practical: '#ff9800',
};

export const EXAM_SESSION_STATUS_LABELS: Record<ExamSessionStatus, string> = {
  draft: 'Brouillon',
  scheduled: 'Planifié',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const EXAM_SESSION_STATUS_COLORS: Record<ExamSessionStatus, string> = {
  draft: '#9e9e9e',
  scheduled: '#1976d2',
  ongoing: '#ff9800',
  completed: '#4caf50',
  cancelled: '#f44336',
};

export const SUPERVISOR_ROLE_LABELS: Record<SupervisorRole, string> = {
  chief: 'Chef de salle',
  regular: 'Surveillant',
};

export const EXAM_ATTENDANCE_STATUS_LABELS: Record<ExamAttendanceStatus, string> = {
  present: 'Présent',
  absent: 'Absent',
  late: 'En retard',
};

export const EXAM_ATTENDANCE_STATUS_COLORS: Record<ExamAttendanceStatus, string> = {
  present: '#4caf50',
  absent: '#f44336',
  late: '#ff9800',
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'En attente',
  submitted: 'Remise',
  not_submitted: 'Non remise',
};

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  cheating: 'Fraude',
  disruption: 'Perturbation',
  medical: 'Médical',
  material: 'Matériel',
  other: 'Autre',
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  minor: 'Mineur',
  moderate: 'Modéré',
  major: 'Majeur',
  critical: 'Critique',
};

export const INCIDENT_SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  minor: '#4caf50',
  moderate: '#ff9800',
  major: '#f44336',
  critical: '#d32f2f',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  reported: 'Signalé',
  investigating: 'En investigation',
  resolved: 'Résolu',
  escalated: 'Escaladé',
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

export interface ModuleSummary {
  id: number;
  name: string;
  code: string;
}

export interface TeacherSummary {
  id: number;
  firstname: string;
  lastname: string;
  email?: string;
}

export interface RoomSummary {
  id: number;
  name: string;
  building?: string;
  capacity: number;
}

// ──── Core Models ────

export interface ExamSession {
  id: number;
  module_id: number;
  evaluation_period_id: number;
  academic_year_id: number;
  title: string;
  description: string | null;
  type: ExamType;
  exam_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_capacity: number;
  status: ExamSessionStatus;
  instructions: string | null;
  allowed_materials: string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: number;
  module?: ModuleSummary;
  creator?: TeacherSummary;
  room_assignments?: ExamRoomAssignment[];
  supervisors?: ExamSupervisor[];
  created_at: string;
  updated_at: string;
}

export interface ExamRoomAssignment {
  id: number;
  exam_session_id: number;
  room_id: number;
  capacity: number;
  seat_layout: string | null;
  room?: RoomSummary;
  exam_session?: ExamSession;
  created_at: string;
  updated_at: string;
}

export interface ExamSupervisor {
  id: number;
  exam_session_id: number;
  teacher_id: number;
  role: SupervisorRole;
  room_id: number | null;
  is_present: boolean;
  teacher?: TeacherSummary;
  room?: RoomSummary;
  exam_session?: ExamSession;
  created_at: string;
  updated_at: string;
}

export interface ExamAttendanceSheet {
  id: number;
  exam_session_id: number;
  student_id: number;
  room_id: number | null;
  seat_number: string | null;
  attendance_status: ExamAttendanceStatus;
  submission_status: SubmissionStatus;
  submission_time: string | null;
  student?: StudentSummary;
  room?: RoomSummary;
  exam_session?: ExamSession;
  created_at: string;
  updated_at: string;
}

export interface ExamIncident {
  id: number;
  exam_session_id: number;
  student_id: number | null;
  type: IncidentType;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  occurred_at_time: string;
  status: IncidentStatus;
  action_taken: string | null;
  witnesses: string | null;
  evidence_path: string | null;
  reported_by: number;
  student?: StudentSummary;
  reporter?: TeacherSummary;
  exam_session?: ExamSession;
  created_at: string;
  updated_at: string;
}

// ──── Request Types ────

export interface CreateExamSessionRequest {
  module_id: number;
  evaluation_period_id: number;
  academic_year_id: number;
  title: string;
  description?: string;
  type: ExamType;
  exam_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_capacity: number;
  instructions?: string;
  allowed_materials?: string;
}

export interface UpdateExamSessionRequest extends Partial<CreateExamSessionRequest> {}

export interface AssignRoomRequest {
  room_id: number;
  capacity: number;
  seat_layout?: string;
}

export interface AssignSupervisorRequest {
  teacher_id: number;
  role: SupervisorRole;
  room_id?: number;
}

export interface AssignStudentsRequest {
  student_ids: number[];
}

export interface MarkAttendanceRequest {
  student_id: number;
  attendance_status: ExamAttendanceStatus;
  submission_status?: SubmissionStatus;
  submission_time?: string;
}

export interface ReportIncidentRequest {
  student_id?: number;
  type: IncidentType;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  occurred_at_time: string;
  witnesses?: string;
  evidence?: File;
}

// ──── Filter Types ────

export interface ExamSessionFilters {
  academic_year_id?: number;
  evaluation_period_id?: number;
  module_id?: number;
  status?: ExamSessionStatus;
  type?: ExamType;
  exam_date?: string;
}

export interface IncidentFilters {
  exam_session_id?: number;
  type?: IncidentType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
}

// ──── Response Types ────

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ExamStatistics {
  total_sessions: number;
  total_students: number;
  average_attendance_rate: number;
  total_incidents: number;
  by_type: Array<{ type: ExamType; count: number }>;
  by_status: Array<{ status: ExamSessionStatus; count: number }>;
}

export interface AttendanceReport {
  exam_session_id: number;
  exam_title: string;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  attendance_rate: number;
  submission_rate: number;
}

export interface IncidentReport {
  total_incidents: number;
  by_type: Array<{ type: IncidentType; count: number }>;
  by_severity: Array<{ severity: IncidentSeverity; count: number }>;
  recent_incidents: ExamIncident[];
}

export interface SupervisorWorkload {
  teacher: TeacherSummary;
  total_sessions: number;
  as_chief: number;
  as_regular: number;
  upcoming_sessions: number;
}

export interface RoomUtilization {
  room: RoomSummary;
  total_exams: number;
  total_hours: number;
  average_occupancy_rate: number;
}

export interface ScheduleValidation {
  is_valid: boolean;
  conflicts: Array<{
    type: string;
    message: string;
    session_ids: number[];
  }>;
}

export interface PreparationChecklist {
  exam_session_id: number;
  items: Array<{
    key: string;
    label: string;
    is_completed: boolean;
    completed_at: string | null;
  }>;
  completion_rate: number;
}
