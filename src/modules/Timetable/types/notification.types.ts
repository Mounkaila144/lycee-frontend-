// ──── Notification Priority ────

export type NotificationPriority = 'urgent' | 'important' | 'normal';

export const NOTIFICATION_PRIORITY_CONFIG: Record<NotificationPriority, { label: string; color: string; icon: string }> = {
  urgent: { label: 'Urgent', color: '#f44336', icon: '🔴' },
  important: { label: 'Important', color: '#ff9800', icon: '🟠' },
  normal: { label: 'Normal', color: '#2196f3', icon: '🔵' },
};

// ──── Notification Types ────

export type NotificationType =
  | 'cancellation'
  | 'room_change'
  | 'teacher_replacement'
  | 'time_change'
  | 'date_change'
  | 'exceptional_session'
  | 'slot_updated'
  | 'slot_deleted'
  | 'restoration'
  | 'cancellation_confirmation'
  | 'replacement_request'
  | 'reminder';

export const NOTIFICATION_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  cancellation: { label: 'Cours annulé', icon: '🚫', color: '#f44336' },
  room_change: { label: 'Changement de salle', icon: '🏫', color: '#ff9800' },
  teacher_replacement: { label: 'Remplacement enseignant', icon: '👤', color: '#9c27b0' },
  time_change: { label: 'Changement d\'horaire', icon: '🕐', color: '#2196f3' },
  date_change: { label: 'Report de cours', icon: '📅', color: '#ff9800' },
  exceptional_session: { label: 'Séance exceptionnelle', icon: '⭐', color: '#4caf50' },
  slot_updated: { label: 'Modification emploi du temps', icon: '✏️', color: '#2196f3' },
  slot_deleted: { label: 'Séance supprimée', icon: '🗑️', color: '#f44336' },
  restoration: { label: 'Cours rétabli', icon: '✅', color: '#4caf50' },
  cancellation_confirmation: { label: 'Annulation confirmée', icon: '✔️', color: '#607d8b' },
  replacement_request: { label: 'Demande de remplacement', icon: '🔄', color: '#9c27b0' },
  reminder: { label: 'Rappel de cours', icon: '⏰', color: '#2196f3' },
};

// ──── Notification Channel ────

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

// ──── Notification Model ────

export interface TimetableNotification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data: Record<string, unknown>;
  read_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

// ──── Notification Preferences ────

export type NotificationFrequency = 'instant' | 'daily_digest' | 'weekly_digest';

export interface NotificationPreferences {
  channels: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  frequency: NotificationFrequency;
  do_not_disturb: {
    enabled: boolean;
    start_time: string; // "22:00"
    end_time: string;   // "07:00"
  };
  types: {
    cancellation: boolean;
    room_change: boolean;
    teacher_replacement: boolean;
    time_change: boolean;
    date_change: boolean;
    exceptional_session: boolean;
    reminder: boolean;
  };
}

// ──── Cancellation ────

export interface CancellationRequest {
  timetable_slot_id: number;
  cancellation_date: string;
  reason: string;
  notify_users: boolean;
  reschedule?: {
    date: string;
    start_time: string;
    end_time: string;
    room_id: number;
  };
}

export interface CancellationRecord {
  id: number;
  exception_id: number;
  slot: {
    id: number;
    module: string;
    teacher: string;
    group: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
  };
  cancellation_date: string;
  reason: string;
  status: 'active' | 'restored' | 'rescheduled';
  rescheduled_to?: {
    date: string;
    start_time: string;
    end_time: string;
    room: string;
  };
  created_by: string;
  created_at: string;
  restored_at?: string;
}

export interface CancellationStats {
  total_cancellations: number;
  cancellations_this_month: number;
  rescheduled_count: number;
  restored_count: number;
  top_reasons: { reason: string; count: number }[];
  by_module: { module: string; count: number }[];
  by_teacher: { teacher: string; count: number }[];
}

// ──── Teacher Replacement ────

export type ReplacementStatus = 'active' | 'ended' | 'pending';

export interface TeacherReplacement {
  id: number;
  timetable_slot_id: number;
  original_teacher: { id: number; name: string };
  replacement_teacher: { id: number; name: string };
  start_date: string;
  end_date: string | null;
  reason: string | null;
  status: ReplacementStatus;
  slot: {
    module: string;
    group: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    type: string;
  };
  created_by: string;
  created_at: string;
}

export interface ReplacementSuggestion {
  id: number;
  name: string;
  is_available: boolean;
  current_load: number; // hours/week
  priority: 'high' | 'medium' | 'low';
  department: string;
  speciality: string;
}

export interface ReplacementStats {
  active_replacements: number;
  total_this_semester: number;
  total_hours_replaced: number;
  most_replaced_teachers: { name: string; count: number }[];
  most_active_replacers: { name: string; count: number; hours: number }[];
}

// ──── Reminder Preferences ────

export type ReminderTiming = '15min' | '30min' | '1h' | '2h' | '24h';

export interface ReminderPreferences {
  enabled: boolean;
  timings: ReminderTiming[];
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  do_not_disturb: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
  weekly_summary: boolean;
  daily_summary: boolean;
}

export interface WeeklySummaryDay {
  day: string;
  date: string;
  slots: {
    module: string;
    type: string;
    start_time: string;
    end_time: string;
    room: string;
    teacher: string;
    has_exception: boolean;
    exception_type?: string;
  }[];
  total_hours: number;
}

export interface WeeklySummary {
  week_label: string;
  days: WeeklySummaryDay[];
  total_hours: number;
  total_sessions: number;
  exceptions_count: number;
}
