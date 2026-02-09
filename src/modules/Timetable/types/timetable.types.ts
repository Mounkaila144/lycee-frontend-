// timetable.types.ts

export type DayOfWeek = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';

export type SessionType = 'CM' | 'TD' | 'TP';

export type ScheduleStatus = 'draft' | 'published' | 'archived';

export interface TimetableSlot {
  id: number;
  schedule_id: number;
  module_id: number;
  teacher_id: number | null;
  group_id: number;
  room_id: number | null;
  semester_id: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  type: SessionType;
  is_recurring: boolean;
  notes?: string;
  module?: ModuleRef;
  teacher?: TeacherRef;
  group?: GroupRef;
  room?: RoomRef;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  semester_id: number;
  group_id: number;
  status: ScheduleStatus;
  duplicated_from_id?: number | null;
  duplication_report?: DuplicationReport | null;
  created_by: number;
  slots?: TimetableSlot[];
  semester?: SemesterRef;
  group?: GroupRef;
  created_at: string;
  updated_at: string;
}

export interface ModuleRef {
  id: number;
  name: string;
  code: string;
}

export interface TeacherRef {
  id: number;
  name: string;
  email?: string;
}

export interface GroupRef {
  id: number;
  name: string;
  student_count?: number;
}

export interface RoomRef {
  id: number;
  name: string;
  code: string;
  capacity?: number;
  type?: string;
}

export interface SemesterRef {
  id: number;
  name: string;
  is_current: boolean;
}

export interface Conflict {
  type: 'teacher' | 'room' | 'group' | 'student';
  severity: 'error' | 'warning';
  message: string;
  conflicting_slot?: TimetableSlot;
}

export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: Conflict[];
}

export interface AlternativeSlot {
  day: DayOfWeek;
  start: string;
  end: string;
}

export interface CreateSlotRequest {
  schedule_id?: number;
  module_id: number;
  teacher_id: number;
  group_id: number;
  room_id: number;
  semester_id: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  type: SessionType;
  is_recurring?: boolean;
  notes?: string;
}

export interface UpdateSlotRequest extends Partial<CreateSlotRequest> {
  id: number;
}

export interface TimetableFilters {
  semester_id?: number;
  group_id?: number;
  teacher_id?: number;
  room_id?: number;
  day_of_week?: DayOfWeek;
  type?: SessionType;
}

export interface CheckConflictRequest {
  module_id: number;
  teacher_id: number;
  group_id: number;
  room_id: number;
  semester_id: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  exclude_slot_id?: number;
}

export interface DuplicationReport {
  total_slots: number;
  duplicated_successfully: number;
  missing_teachers: Array<{
    slot: number;
    module: string;
    original_teacher: string;
  }>;
  missing_rooms: Array<{
    slot: number;
    module: string;
    original_room: string;
  }>;
  conflicts: Array<{
    slot_id: number;
    conflicts: Conflict[];
  }>;
}

export const DAYS: DayOfWeek[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const TIME_SLOTS = [
  { start: '08:00', end: '10:00' },
  { start: '10:00', end: '12:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
];

export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  CM: '#1976d2',
  TD: '#2e7d32',
  TP: '#ed6c02',
};
