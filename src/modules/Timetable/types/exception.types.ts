// exception.types.ts

export type ExceptionType =
  | 'cancellation'
  | 'room_change'
  | 'teacher_replacement'
  | 'time_change'
  | 'date_change'
  | 'exceptional_session';

export interface TimetableException {
  id: number;
  timetable_slot_id: number;
  exception_date: string;
  exception_type: ExceptionType;
  original_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  reason: string;
  notify_students: boolean;
  created_by: number;
  timetable_slot?: {
    id: number;
    module?: { id: number; name: string };
    teacher?: { id: number; name: string };
    room?: { id: number; name: string };
    group?: { id: number; name: string };
    day_of_week: string;
    start_time: string;
    end_time: string;
  };
  creator?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateExceptionRequest {
  timetable_slot_id: number;
  exception_date: string;
  exception_type: ExceptionType;
  new_values: Record<string, unknown>;
  reason: string;
  notify_students?: boolean;
}

export interface ExceptionFilters {
  schedule_id?: number;
  exception_type?: ExceptionType;
  date_from?: string;
  date_to?: string;
}

export const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  cancellation: 'Annulation',
  room_change: 'Changement de salle',
  teacher_replacement: 'Remplacement enseignant',
  time_change: 'Déplacement horaire',
  date_change: 'Report de séance',
  exceptional_session: 'Séance exceptionnelle',
};

export const EXCEPTION_TYPE_ICONS: Record<ExceptionType, string> = {
  cancellation: '🚫',
  room_change: '🔄',
  teacher_replacement: '👤',
  time_change: '⏰',
  date_change: '📅',
  exceptional_session: '⚡',
};

export const EXCEPTION_TYPE_COLORS: Record<ExceptionType, string> = {
  cancellation: '#f44336',
  room_change: '#ff9800',
  teacher_replacement: '#ff9800',
  time_change: '#2196f3',
  date_change: '#2196f3',
  exceptional_session: '#9c27b0',
};
