// ──── Enums / Constants ────
// Valeurs alignées sur le backend (Modules/Exams, migrations tenant).

/** Backend : normal | rattrapage | special — libellés lycée : composition, rattrapage, examen blanc. */
export type ExamType = 'normal' | 'rattrapage' | 'special';
export type ExamSessionStatus = 'draft' | 'planned' | 'ongoing' | 'completed' | 'cancelled';
export type SupervisorRole = 'principal' | 'assistant' | 'reserve';
export type SupervisorStatus = 'assigned' | 'confirmed' | 'present' | 'absent' | 'replaced';
export type ExamAttendanceStatus = 'present' | 'absent' | 'late' | 'excluded';
export type IncidentType = 'cheating' | 'disturbance' | 'technical' | 'medical' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'under_review' | 'resolved' | 'escalated';

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  normal: 'Composition',
  rattrapage: 'Rattrapage',
  special: 'Examen blanc',
};

export const EXAM_TYPE_COLORS: Record<ExamType, string> = {
  normal: '#1976d2',
  rattrapage: '#ff9800',
  special: '#9c27b0',
};

export const EXAM_SESSION_STATUS_LABELS: Record<ExamSessionStatus, string> = {
  draft: 'Brouillon',
  planned: 'Planifiée',
  ongoing: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export const EXAM_SESSION_STATUS_COLORS: Record<ExamSessionStatus, string> = {
  draft: '#9e9e9e',
  planned: '#1976d2',
  ongoing: '#ff9800',
  completed: '#4caf50',
  cancelled: '#f44336',
};

export const SUPERVISOR_ROLE_LABELS: Record<SupervisorRole, string> = {
  principal: 'Chef de salle',
  assistant: 'Surveillant',
  reserve: 'Réserve',
};

export const SUPERVISOR_STATUS_LABELS: Record<SupervisorStatus, string> = {
  assigned: 'Affecté',
  confirmed: 'Confirmé',
  present: 'Présent',
  absent: 'Absent',
  replaced: 'Remplacé',
};

export const EXAM_ATTENDANCE_STATUS_LABELS: Record<ExamAttendanceStatus, string> = {
  present: 'Présent',
  absent: 'Absent',
  late: 'En retard',
  excluded: 'Exclu',
};

export const EXAM_ATTENDANCE_STATUS_COLORS: Record<ExamAttendanceStatus, string> = {
  present: '#4caf50',
  absent: '#f44336',
  late: '#ff9800',
  excluded: '#6d4c41',
};

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  cheating: 'Fraude',
  disturbance: 'Perturbation',
  technical: 'Technique / matériel',
  medical: 'Médical',
  other: 'Autre',
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: 'Mineur',
  medium: 'Modéré',
  high: 'Majeur',
  critical: 'Critique',
};

export const INCIDENT_SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  critical: '#b71c1c',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  reported: 'Signalé',
  under_review: 'En examen',
  resolved: 'Résolu',
  escalated: 'Escaladé',
};

// ──── Summary Models ────

export interface StudentSummary {
  id: number;
  firstname: string;
  lastname: string;
  matricule?: string | null;

  /** Classe de l'élève (liste des éligibles) */
  classe_name?: string | null;
}

export interface ModuleSummary {
  id: number;
  name: string;
  code: string;
}

export interface SubjectSummary {
  id: number;
  name: string;
  code?: string | null;
}

export interface ClasseSummary {
  id: number;
  name: string;
  level_id?: number | null;
  academic_year_id?: number;
}

export interface LevelSummary {
  id: number;
  code?: string;
  name: string;
}

export interface SemesterSummary {
  id: number;
  name: string;
  academic_year_id?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface TeacherSummary {
  id: number;
  firstname: string;
  lastname: string;
}

export interface RoomSummary {
  id: number;
  name: string;
  code?: string | null;
  building?: string | null;
  capacity: number;
}

export interface AcademicYearSummary {
  id: number;
  name: string;
  is_active: boolean;
}

// ──── Core Models ────

export interface ExamRoomAssignment {
  id: number;
  exam_session_id: number;
  room_id: number;
  capacity: number;
  assigned_students: number;
  seat_start_number: number | null;
  seat_end_number: number | null;
  room?: RoomSummary;
}

export interface ExamSupervisor {
  id: number;
  exam_session_id: number;
  exam_room_assignment_id: number | null;
  teacher_id: number;
  role: SupervisorRole;
  status: SupervisorStatus;
  actual_start_time: string | null;
  teacher?: TeacherSummary;
  room_assignment?: ExamRoomAssignment | null;
}

export interface ExamAttendanceSheet {
  id: number;
  exam_session_id: number;
  exam_room_assignment_id: number | null;
  student_id: number;
  seat_number: string | null;
  status: ExamAttendanceStatus;
  arrival_time: string | null;
  submission_time: string | null;
  has_submitted: boolean;
  notes: string | null;
  verified_by: number | null;
  verified_at: string | null;
  student?: StudentSummary;
  room_assignment?: ExamRoomAssignment | null;
}

export interface ExamSession {
  id: number;
  module_id: number | null;
  subject_id?: number | null;
  classe_id?: number | null;
  level_id?: number | null;
  semester_id?: number | null;
  evaluation_period_id: number | null;
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
  cancellation_reason?: string | null;
  class_evaluation_ids?: number[] | null;
  instructions: string | null;
  allowed_materials: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_by: number | null;
  module?: ModuleSummary | null;
  subject?: SubjectSummary | null;
  classe?: ClasseSummary | null;
  level?: LevelSummary | null;
  semester?: SemesterSummary | null;
  room_assignments?: ExamRoomAssignment[];
  supervisors?: ExamSupervisor[];
  attendance_sheets?: ExamAttendanceSheet[];
  room_assignments_count?: number;
  supervisors_count?: number;
  attendance_sheets_count?: number;
  incidents_count?: number;
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
  witnesses: string[] | null;
  evidence_path: string | null;
  reported_by: number;
  resolution_notes: string | null;
  student?: StudentSummary | null;
  reporter?: TeacherSummary | null;
  created_at: string;
  updated_at: string;
}

/** GET /admin/exams/sessions/options */
export interface ExamOptions {
  lycee_ready: boolean;
  grades_link_available: boolean;
  academic_year_id: number | null;
  academic_years: AcademicYearSummary[];
  classes: ClasseSummary[];
  levels: LevelSummary[];
  subjects: SubjectSummary[];
  semesters: SemesterSummary[];
  rooms: RoomSummary[];
  teachers: TeacherSummary[];
}

// ──── Request Types ────

export interface CreateExamSessionRequest {
  subject_id: number;

  /** Composition d'une classe… */
  classe_id?: number | null;

  /** …ou examen commun à tout un niveau (avec academic_year_id). */
  level_id?: number | null;
  academic_year_id?: number | null;
  semester_id?: number | null;
  title: string;
  description?: string;
  type: ExamType;
  exam_date: string;
  start_time: string;
  end_time: string;
  instructions?: string;
  allowed_materials?: string[];
  room_ids?: number[];
}

export type UpdateExamSessionRequest = Partial<Omit<CreateExamSessionRequest, 'room_ids'>>;

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
  role?: SupervisorRole;
}

export interface AssignStudentsRequest {
  student_ids: number[];
}

export interface MarkAttendanceRequest {
  status: ExamAttendanceStatus;
  notes?: string;
}

export interface ReportIncidentRequest {
  student_id?: number | null;
  type: IncidentType;
  title: string;
  description: string;
  severity: IncidentSeverity;
  occurred_at_time: string;
  witnesses?: string[];
}

export interface ValidateScheduleRequest {
  exam_date: string;
  start_time: string;
  end_time: string;
  classe_id?: number | null;
  level_id?: number | null;
  academic_year_id?: number | null;
  room_ids?: number[];
  exclude_session_id?: number;
}

export interface CreateEvaluationsRequest {
  semester_id?: number | null;
  title?: string;
  max_score?: number;
  weight?: number;
}

export interface CreateEvaluationsResponse {
  data: Array<{
    id: number;
    classe_id: number;
    subject_id: number;
    semester_id: number;
    title: string;
    type: string;
    status: string;
  }>;
  message: string;
}

// ──── Filter Types ────

/** Filtres supportés par GET /admin/exams/sessions. */
export interface ExamSessionFilters {
  status?: ExamSessionStatus;
  academic_year_id?: number;
  subject_id?: number;
  classe_id?: number;
  level_id?: number;
  semester_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface ExamReportPeriodFilters {
  start_date?: string;
  end_date?: string;
}

export interface ExamStatisticsFilters extends ExamReportPeriodFilters {
  subject_id?: number;
  classe_id?: number;
  level_id?: number;
  academic_year_id?: number;
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
  by_subject: Array<{
    subject_id: number;
    subject_name: string | null;
    total_sessions: number;
    total_students: number;
    absent: number;
    incidents: number;
  }>;
  by_module: Array<{
    module_id: number;
    module_name: string | null;
    total_sessions: number;
    total_students: number;
  }>;
}

/** GET /admin/exams/reports/sessions/{id}/attendance */
export interface AttendanceReport {
  session: {
    id: number;
    title: string;
    module: string | null;
    subject?: string | null;
    classe?: string | null;
    date: string;
    time: string;
  };
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
    type: 'room_conflict' | 'module_conflict' | 'class_conflict';
    conflicting_session: string;
    date: string;
    time: string;
    room_id?: number;
    room_name?: string;
    classe?: string | null;
    subject?: string | null;
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

// ──── Helpers ────

export const personName = (person?: { firstname?: string | null; lastname?: string | null } | null): string =>
  person ? `${person.lastname ?? ''} ${person.firstname ?? ''}`.trim() : '';

/** Nom de la classe, ou « Niveau … » pour un examen commun à un niveau. */
export const sessionTargetLabel = (session: Pick<ExamSession, 'classe' | 'level'>): string => {
  if (session.classe) {
    return session.classe.name;
  }

  if (session.level) {
    return `Niveau ${session.level.name}`;
  }

  return '—';
};

/** Heure « HH:MM » quelle que soit la forme renvoyée (« 08:00 », « 08:00:00 », ISO). */
export const formatTime = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const match = value.match(/(\d{2}):(\d{2})/);

  return match ? `${match[1]}:${match[2]}` : value;
};

export const formatDate = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
};

export const sessionLabel = (session: ExamSession): string =>
  `${session.title} — ${sessionTargetLabel(session)} — ${formatDate(session.exam_date)}`;

/** Message d'erreur API (message Laravel ou première erreur de validation). */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
  const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;

  return firstError || data?.message || fallback;
};
