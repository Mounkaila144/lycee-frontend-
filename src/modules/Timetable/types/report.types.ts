// ──── PDF Export Types ────

export type PdfExportType = 'group' | 'teacher' | 'room' | 'level' | 'semester';

export type PdfOrientation = 'portrait' | 'landscape';

export interface PdfExportOptions {
  type: PdfExportType;
  entity_id: number;
  semester_id: number;
  week_start?: string;
  week_end?: string;
  include_exceptions: boolean;
  include_notes: boolean;
  compact_mode: boolean;
  orientation: PdfOrientation;
}

export interface PdfExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  file_url?: string;
  file_name?: string;
  error?: string;
  created_at: string;
}

export interface PdfExportHistory {
  id: number;
  type: PdfExportType;
  entity_name: string;
  period: string;
  file_name: string;
  file_size: string;
  generated_at: string;
  downloaded_at?: string;
}

// ──── Occupancy Statistics Types ────

export type OccupancyStatus = 'sous-utilise' | 'normal' | 'optimal' | 'sature';

export interface OccupancyKPIs {
  occupancy_rate: number;
  total_available_hours: number;
  total_used_hours: number;
  total_free_hours: number;
  underused_rooms_count: number;
  saturated_rooms_count: number;
  overloaded_teachers_count: number;
  status: OccupancyStatus;
}

export interface OccupancyByDay {
  day: string;
  total_hours: number;
  average_per_week: number;
  session_count: number;
}

export interface SessionTypeDistribution {
  type: string;
  count: number;
  hours: number;
  percentage: number;
  color: string;
}

export type HeatmapIntensity = 'empty' | 'low' | 'medium' | 'high' | 'very_high';

export interface HeatmapCell {
  day: string;
  timeslot: string;
  count: number;
  intensity: HeatmapIntensity;
}

export interface RoomOccupancyStat {
  id: number;
  name: string;
  type: string;
  capacity: number;
  used_hours: number;
  available_hours: number;
  free_hours: number;
  occupancy_rate: number;
  status: OccupancyStatus;
}

export interface TeacherOccupancyStat {
  id: number;
  name: string;
  department: string;
  total_hours: number;
  weekly_hours: number;
  cm_hours: number;
  td_hours: number;
  tp_hours: number;
  workload_percentage: number;
  status: 'sous-charge' | 'normal' | 'surcharge';
}

export const OCCUPANCY_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'sous-utilise': { label: 'Sous-utilise', color: '#ff9800' },
  normal: { label: 'Normal', color: '#2196f3' },
  optimal: { label: 'Optimal', color: '#4caf50' },
  sature: { label: 'Sature', color: '#f44336' },
};

export const HEATMAP_COLORS: Record<HeatmapIntensity, string> = {
  empty: '#f5f5f5',
  low: '#c8e6c9',
  medium: '#fff9c4',
  high: '#ffcc80',
  very_high: '#ef9a9a',
};

// ──── Teacher Workload Types ────

export type WorkloadStatus = 'sous-charge' | 'normal' | 'surcharge';

export interface TDEquivalenceCoefficients {
  cm: number;
  td: number;
  tp: number;
}

export const DEFAULT_TD_COEFFICIENTS: TDEquivalenceCoefficients = {
  cm: 1.5,
  td: 1.0,
  tp: 0.67,
};

export interface TeacherWorkload {
  teacher: {
    id: number;
    name: string;
    registration_number: string;
    department: string;
    status: 'Permanent' | 'Vacataire';
    statutory_hours: number;
  };
  period: {
    semester_id: number;
    semester_name: string;
    weeks_count: number;
  };
  hours_by_type: {
    cm: number;
    td: number;
    tp: number;
  };
  totals: {
    total_hours: number;
    td_equivalent: number;
    weekly_average: number;
    session_count: number;
  };
  comparison: {
    statutory_hours: number;
    completion_rate: number;
    status: WorkloadStatus;
  };
  overtime: {
    statutory_hours: number;
    actual_td_equivalent: number;
    overtime_hours: number;
    has_overtime: boolean;
    estimated_cost: number;
  };
  modules: TeacherModuleBreakdown[];
}

export interface TeacherModuleBreakdown {
  module_id: number;
  module_code: string;
  module_name: string;
  level: string;
  groups: string[];
  cm_hours: number;
  td_hours: number;
  tp_hours: number;
  total_hours: number;
  session_count: number;
}

export interface DepartmentWorkloadSummary {
  department_id: number;
  department_name: string;
  semester_id: number;
  statistics: {
    total_teachers: number;
    permanent_count: number;
    temporary_count: number;
    total_hours_taught: number;
    average_hours_per_teacher: number;
    average_td_equivalent: number;
    underloaded_count: number;
    normal_count: number;
    overloaded_count: number;
  };
  teachers: DepartmentTeacherRow[];
}

export interface DepartmentTeacherRow {
  teacher_id: number;
  teacher_name: string;
  status: 'Permanent' | 'Vacataire';
  cm_hours: number;
  td_hours: number;
  tp_hours: number;
  total_hours: number;
  td_equivalent: number;
  completion_rate: number;
  workload_status: WorkloadStatus;
}

// ──── Room Utilization Types ────

export type RoomStatus = 'sous-utilisee' | 'normale' | 'saturee';

export interface RoomUtilization {
  room: {
    id: number;
    name: string;
    type: string;
    capacity: number;
    building: string;
    floor: string;
    equipments: string[];
  };
  occupancy: {
    total_available_hours: number;
    total_used_hours: number;
    total_free_hours: number;
    occupancy_rate: number;
    status: RoomStatus;
    daily_average: number;
    weekly_average: number;
  };
  hours_by_type: {
    cm: number;
    td: number;
    tp: number;
  };
  capacity_analysis: {
    average_fill_rate: number;
    oversized_sessions: number;
    undersized_sessions: number;
    adequate_sessions: number;
  };
}

export interface AllRoomsUtilization {
  statistics: {
    total_rooms: number;
    total_capacity: number;
    average_occupancy_rate: number;
    total_used_hours: number;
    total_available_hours: number;
    underused_count: number;
    normal_count: number;
    saturated_count: number;
  };
  type_distribution: Record<string, { count: number; average_occupancy: number }>;
  rooms: RoomUtilizationRow[];
}

export interface RoomUtilizationRow {
  room_id: number;
  room_name: string;
  room_type: string;
  capacity: number;
  building: string;
  used_hours: number;
  free_hours: number;
  occupancy_rate: number;
  status: RoomStatus;
}

export interface RoomRecommendation {
  type: 'reassign' | 'liberate' | 'equipment' | 'capacity';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  room_name: string;
  details: string;
}

export const ROOM_STATUS_CONFIG: Record<RoomStatus, { label: string; color: string; icon: string }> = {
  'sous-utilisee': { label: 'Sous-utilisee', color: '#ff9800', icon: '⚠️' },
  normale: { label: 'Normale', color: '#4caf50', icon: '✅' },
  saturee: { label: 'Saturee', color: '#f44336', icon: '🔴' },
};
