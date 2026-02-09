// duplication.types.ts

import type { Schedule, DuplicationReport, TimetableSlot } from './timetable.types';

export type DuplicationMode = 'full' | 'structure';

export interface DuplicationOptions {
  mode: DuplicationMode;
  duplicate_rooms: boolean;
  selected_modules?: number[];
}

export interface DuplicationPreview {
  source_schedule: Schedule;
  total_slots: number;
  modules: Array<{
    id: number;
    name: string;
    slots_count: number;
    teacher: string;
  }>;
  teachers_count: number;
  rooms_count: number;
}

export interface DuplicationRequest {
  source_schedule_id: number;
  target_semester_id: number;
  target_group_id: number;
  options: DuplicationOptions;
}

export interface DuplicationResult {
  success: boolean;
  new_schedule: Schedule;
  report: DuplicationReport;
}

export interface SlotSuggestions {
  teachers: Array<{
    id: number;
    name: string;
    is_available: boolean;
  }>;
  rooms: Array<{
    id: number;
    name: string;
    capacity: number;
    type: string;
  }>;
}

export interface QuickAssignRequest {
  slot_id: number;
  teacher_id?: number;
  room_id?: number;
}

export type SlotStatus = 'ok' | 'incomplete' | 'conflict';

export interface SlotWithStatus extends TimetableSlot {
  status: SlotStatus;
  suggestions?: SlotSuggestions;
}
