// ──── Enums / Constants ────

/** Backend : normal | rattrapage | special (written/oral/practical : anciennes valeurs de démo). */
export type ExamType = 'normal' | 'rattrapage' | 'special' | 'written' | 'oral' | 'practical';
/** Backend : draft | planned | ongoing | completed | cancelled ('scheduled' : ancienne valeur de démo). */
export type ExamSessionStatus = 'draft' | 'planned' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type SupervisorRole = 'chief' | 'regular';
export type ExamAttendanceStatus = 'present' | 'absent' | 'late';
export type SubmissionStatus = 'pending' | 'submitted' | 'not_submitted';
export type IncidentType = 'cheating' | 'disruption' | 'medical' | 'material' | 'other';
export type IncidentSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'escalated';

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  normal: 'Session normale',
  rattrapage: 'Rattrapage',
  special: 'Session spéciale',
  written: 'Écrit',
  oral: 'Oral',
  practical: 'Pratique',
};

export const EXAM_TYPE_COLORS: Record<ExamType, string> = {
  normal: '#1976d2',
  rattrapage: '#ff9800',
  special: '#9c27b0',
  written: '#1976d2',
  oral: '#9c27b0',
  practical: '#ff9800',
};

export const EXAM_SESSION_STATUS_LABELS: Record<ExamSessionStatus, string> = {
  draft: 'Brouillon',
  planned: 'Planifié',
  scheduled: 'Planifié',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const EXAM_SESSION_STATUS_COLORS: Record<ExamSessionStatus, string> = {
  draft: '#9e9e9e',
  planned: '#1976d2',
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
  allowed_materials: string[] | string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: number | null;
  module?: ModuleSummary | null;
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
  evaluation_period_id?: number | null;
  academic_year_id: number;
  title: string;
  description?: string;
  type: 'normal' | 'rattrapage' | 'special';
  exam_date: string;
  start_time: string;
  end_time: string;
  instructions?: string;
  allowed_materials?: string[];
}

export interface UpdateExamSessionRequest extends Partial<CreateExamSessionRequest> {}

export interface AssignRoomRequest {
  rooms: Array<{
    room_id: number;
    capacity?: number;
    seat_start_number?: number;
    seat_end_number?: number;
  }>;
}

export interface AssignSupervisorRequest {
  /** id utilisateur (users) du professeur */
  teacher_id: number;
  room_assignment_id?: number | null;
  role?: 'principal' | 'assistant' | 'reserve';
}

export interface AssignStudentsRequest {
  student_ids: number[];
}

export interface MarkAttendanceRequest {
  status: 'present' | 'absent' | 'late' | 'excluded';
  notes?: string;
}

export interface ReportIncidentRequest {
  student_id?: number;
  type: 'cheating' | 'disturbance' | 'technical' | 'medical' | 'other';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurred_at_time: string;
  witnesses?: string[];
}

export interface ValidateScheduleRequest {
  exam_date: string;
  start_time: string;
  end_time: string;
  module_id?: number;
  room_ids?: number[];
  exclude_session_id?: number;
}

// ──── Filter Types ────

/** Filtres supportés par GET /admin/exams/sessions (backend : status, module_id, page). */
export interface ExamSessionFilters {
  module_id?: number;
  status?: ExamSessionStatus;
  page?: number;
}

export interface ExamReportPeriodFilters {
  start_date?: string;
  end_date?: string;
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

/** GET /admin/exams/reports/statistics */
export interface ExamStatistics {
  period: { start_date: string | null; end_date: string | null };
  overview: {
    total_sessions: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    total_students_examined: number;
  };
  attendance_stats: {
    total_attendance_records: number;
    present: number;
    absent: number;
    late: number;
  };
  incident_stats: {
    total_incidents: number;
    by_type: Record<string, number>;
    by_severity: Record<string, number>;
  };
  by_module: Array<{
    module_id: number;
    module_name: string | null;
    total_sessions: number;
    total_students: number;
  }>;
}

/** GET /admin/exams/reports/sessions/{id}/attendance */
export interface AttendanceReport {
  session: { id: number; title: string; module: string | null; date: string; time: string };
  summary: {
    total_registered: number;
    present: number;
    absent: number;
    late: number;
    excluded: number;
    submitted: number;
  };
  by_room: Array<{ room_name: string | null; total: number; present: number; absent: number }>;
  students: Array<{
    student_id: number;
    student_name: string | null;
    room: string | null;
    seat: string | null;
    status: string;
    arrival_time: string | null;
    submission_time: string | null;
    has_submitted: boolean;
  }>;
}

/** GET /admin/exams/reports/sessions/{id}/incidents */
export interface IncidentReport {
  session: { id: number; title: string; date: string };
  summary: {
    total_incidents: number;
    by_type: Record<string, number>;
    by_severity: Record<string, number>;
    by_status: Record<string, number>;
  };
  incidents: Array<{
    id: number;
    type: string;
    severity: string;
    title: string;
    description: string;
    student: { id: number; name: string } | null;
    occurred_at: string;
    status: string;
    reported_by: string | null;
    action_taken: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
  }>;
}

/** GET /admin/exams/reports/supervisor-workload */
export interface SupervisorWorkload {
  teacher_id: number;
  first_name: string;
  last_name: string;
  total_supervisions: number;
  completed: number | string;
  total_minutes: number | string;
}

/** GET /admin/exams/reports/room-utilization */
export interface RoomUtilization {
  room_id: number;
  room_name: string;
  room_capacity: number;
  times_used: number;
  avg_students: number | string;
  total_students: number | string;
}

export interface ScheduleValidation {
  valid: boolean;
  conflicts: Array<{
    type: 'room_conflict' | 'module_conflict';
    conflicting_session: string;
    date: string;
    time: string;
    room_id?: number;
    room_name?: string;
    module_id?: number;
  }>;
}

export interface AttendanceStatistics {
  total_students: number;
  present: number;
  absent: number;
  late: number;
  submitted: number;
  present_percentage: number;
  submission_percentage: number;
}

export interface IncidentsSummary {
  total: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
  by_status: Record<string, number>;
  pending: number;
  resolved: number;
}

/** GET /admin/exams/management/sessions/{id}/preparation-checklist */
export interface PreparationChecklist {
  session_details: {
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    duration: string;
  };
  rooms: Array<{ room: string; capacity: number; assigned: number; seats: string }>;
  supervisors_needed: number;
  students_count: number;
  materials_needed: string[];
  instructions: string | null;
  checklist_items: Record<string, boolean>;
}
