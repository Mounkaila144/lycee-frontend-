// lycee.types.ts — contrats réels de l'API Timetable (créneaux par classe / matière)

import type { DayOfWeek, SessionType } from './timetable.types';

export interface LyceeSlot {
  id: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  time_range: string;
  type: SessionType;
  is_recurring: boolean;
  notes: string | null;
  subject_id: number | null;
  classe_id: number | null;
  teacher_id: number;
  room_id: number | null;
  semester_id: number;
  subject?: { id: number; code: string; name: string } | null;
  classe?: { id: number; name: string; classroom: string | null } | null;
  module?: { id: number; code: string; name: string } | null;
  teacher?: { id: number; name: string } | null;
  room?: { id: number; code: string; name: string; capacity?: number } | null;
}

export interface TimetableGridResponse {
  data: Record<DayOfWeek, LyceeSlot[]>;
  total_slots: number;
  semester_id?: number | null;
  classe?: { id: number; name: string } | null;
  teacher?: { id: number; name: string } | null;
}

/** Format « liste plate » des portails Élève / Parent. */
export interface PortalTimetableSlot {
  id: number;
  day?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string | null;
  teacher: string | null;
  classroom?: string | null;
  room?: string | null;
  classe?: string | null;
  type?: string;
}

export interface SlotPayload {
  classe_id: number;
  subject_id: number;
  teacher_id: number;
  room_id?: number | null;
  semester_id: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  type?: SessionType;
  notes?: string | null;
}

export interface SlotConflict {
  type: 'teacher' | 'room' | 'group' | 'classe' | string;
  severity: 'error' | 'warning';
  message: string;
}

export interface SlotConflictError {
  message: string;
  conflicts: SlotConflict[];
  warnings: SlotConflict[];
  alternatives?: Array<{ day_of_week: DayOfWeek; start_time: string; end_time: string }>;
}

export interface RefOption {
  id: number;
  label: string;
}

export interface SemesterOption extends RefOption {
  is_active: boolean;
  academic_year_id: number;
}

export interface TimetableReferenceData {
  semesters: SemesterOption[];
  classes: RefOption[];
  subjects: RefOption[];
  teachers: RefOption[];
  rooms: RefOption[];
}
