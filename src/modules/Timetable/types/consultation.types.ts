// consultation.types.ts - Types for EDT consultation views (Stories 06-09)

import type { DayOfWeek, SessionType, TimetableSlot, GroupRef, TeacherRef, RoomRef } from './timetable.types';

// ──── Common Consultation Types ────

export type ViewMode = 'grid' | 'list';

export type LoadStatus = 'normal' | 'elevated' | 'high';

export type UrgencyLevel = 'later' | 'soon' | 'urgent';

export interface TimetableStatistics {
  total_hours: number;
  total_sessions: number;
  hours_by_type: Record<SessionType, number>;
  load_status: LoadStatus;
}

export interface GapInfo {
  day: string;
  start: string;
  end: string;
  duration_minutes: number;
  duration_display: string;
}

export interface SlotWithException extends TimetableSlot {
  has_exception?: boolean;
  exception_type?: string;
  exception_reason?: string;
  is_cancelled?: boolean;
  color?: string;
  duration_hours?: number;
}

export interface WeekRange {
  week_start: string;
  week_end: string;
}

// ──── Story 06: Group Timetable View ────

export interface GroupTimetableResponse extends WeekRange {
  schedule_exists: boolean;
  message?: string;
  timetable_by_day: Record<string, SlotWithException[]>;
  statistics: TimetableStatistics;
  gaps: GapInfo[];
}

// ──── Story 07: Teacher Timetable View ────

export interface NextClassInfo {
  module: string;
  teacher?: string;
  room: string;
  building?: string;
  day: string;
  date: string;
  start_time: string;
  end_time?: string;
  group: string;
  has_exception: boolean;
  exception_type?: string;
  minutes_until: number;
  urgency: UrgencyLevel;
}

export interface RecentChange {
  id: number;
  type: 'cancellation' | 'room_change' | 'teacher_replacement' | 'time_change';
  module: string;
  day: string;
  date: string;
  description: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  is_read: boolean;
}

export interface TeacherTimetableResponse extends WeekRange {
  timetable_by_day: Record<string, SlotWithException[]>;
  statistics: TimetableStatistics;
  groups_count: number;
  groups: GroupRef[];
  recent_changes: RecentChange[];
}

// ──── Story 08: Room Occupation View ────

export interface AvailableSlot {
  day: string;
  start: string;
  end: string;
}

export interface RoomOccupationResponse extends WeekRange {
  room: RoomRef & {
    type?: string;
    building?: string;
    floor?: string;
    capacity?: number;
    equipment?: string[];
  };
  timetable_by_day: Record<string, SlotWithException[]>;
  available_slots: AvailableSlot[];
  occupation_rate: number;
  total_hours_occupied: number;
  total_hours_available: number;
  daily_occupation: Record<string, number>;
}

// ──── Story 09: Student Timetable View ────

export interface StudentTimetableResponse extends WeekRange {
  has_timetable: boolean;
  message?: string;
  groups_count: number;
  timetable_by_day: Record<string, SlotWithException[]>;
  statistics: {
    total_hours: number;
    total_sessions: number;
  };
  recent_changes: RecentChange[];
}

// ──── Load Status Helpers ────

export const LOAD_STATUS_CONFIG: Record<LoadStatus, { label: string; color: string }> = {
  normal: { label: 'Normal', color: '#4caf50' },
  elevated: { label: 'Élevée', color: '#ff9800' },
  high: { label: 'Très élevée', color: '#f44336' },
};

export const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; color: string }> = {
  later: { label: '> 2h', color: '#1976d2' },
  soon: { label: '< 2h', color: '#ff9800' },
  urgent: { label: '< 30min', color: '#f44336' },
};
