/**
 * Enrollment Module - Group Types
 * Types for TD/TP groups and student assignments
 */

/**
 * Group Type - CM, TD, TP
 */
export type GroupType = 'CM' | 'TD' | 'TP';

/**
 * Group Status
 */
export type GroupStatus = 'Active' | 'Inactive';

/**
 * Assignment Method
 */
export type AssignmentMethod = 'Automatic' | 'Manual';

/**
 * Auto-assignment Strategy
 */
export type AutoAssignmentStrategy = 'balanced' | 'alphabetic' | 'random' | 'option';

/**
 * Capacity Status
 */
export type CapacityStatus = 'Underflow' | 'Normal' | 'Overflow';

/**
 * Print Status for student cards
 */
export type PrintStatus = 'Pending' | 'Printed' | 'Delivered';

/**
 * Group Entity
 */
export interface Group {
  id: number;
  module_id: number;
  program_id: number;
  level: string;
  academic_year_id: number;
  semester_id: number | null;
  code: string;
  name: string;
  type: GroupType;
  capacity_min: number;
  capacity_max: number;
  teacher_id: number | null;
  room_id: number | null;
  status: GroupStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Computed fields from API
  current_count?: number;
  fill_rate?: number;
  is_below_minimum?: boolean;
  is_above_maximum?: boolean;
  remaining_capacity?: number;

  // Relations
  module?: {
    id: number;
    code: string;
    name: string;
  };
  program?: {
    id: number;
    code: string;
    name: string;
  };
  academic_year?: {
    id: number;
    year: string;
    name: string;
  };
  semester?: {
    id: number;
    code: string;
    name: string;
  };
  teacher?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  room?: {
    id: number;
    code: string;
    name: string;
    capacity: number;
  };
}

/**
 * Group Form Data for create/update
 */
export interface GroupFormData {
  module_id: number;
  program_id: number;
  level: string;
  academic_year_id: number;
  semester_id?: number | null;
  code: string;
  name: string;
  type: GroupType;
  capacity_min: number;
  capacity_max: number;
  teacher_id?: number | null;
  room_id?: number | null;
  status?: GroupStatus;
}

/**
 * Group Assignment Entity
 */
export interface GroupAssignment {
  id: number;
  student_id: number;
  group_id: number;
  module_id: number;
  academic_year_id: number;
  assignment_method: AssignmentMethod;
  assigned_by: number | null;
  assignment_reason: string | null;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Relations
  student?: {
    id: number;
    matricule: string;
    firstname: string;
    lastname: string;
    email: string;
    photo?: string;
  };
  group?: Group;
  module?: {
    id: number;
    code: string;
    name: string;
  };
  assigned_by_user?: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

/**
 * Group Statistics
 */
export interface GroupStatistics {
  group: Group;
  current_count: number;
  capacity_status: CapacityStatus;
  fill_rate: number;
  is_below_minimum: boolean;
  is_above_maximum: boolean;
}

/**
 * Auto-assign Request
 */
export interface AutoAssignRequest {
  module_id: number;
  level: string;
  academic_year_id: number;
  method: AutoAssignmentStrategy;
}

/**
 * Auto-assign Preview Result
 */
export interface AutoAssignPreviewResult {
  total_students: number;
  total_groups: number;
  preview: {
    group_id: number;
    group_code: string;
    group_name: string;
    current_count: number;
    projected_count: number;
    students: {
      id: number;
      matricule: string;
      firstname: string;
      lastname: string;
    }[];
  }[];
  warnings: string[];
}

/**
 * Auto-assign Result
 */
export interface AutoAssignResult {
  assigned: number;
  groups: GroupStatistics[];
}

/**
 * Manual Assignment Request
 */
export interface ManualAssignRequest {
  student_id: number;
  group_id: number;
  assignment_reason?: string;
}

/**
 * Group Filters
 */
export interface GroupFilters {
  module_id?: number;
  program_id?: number;
  level?: string;
  academic_year_id?: number;
  semester_id?: number;
  type?: GroupType;
  status?: GroupStatus;
  search?: string;
}

/**
 * Group Query Params
 */
export interface GroupQueryParams extends GroupFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Paginated Groups Response
 */
export interface PaginatedGroupsResponse {
  data: Group[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Group Students Filters
 */
export interface GroupStudentsFilters {
  search?: string;
}

/**
 * Group Students Query Params
 */
export interface GroupStudentsQueryParams extends GroupStudentsFilters {
  page?: number;
  per_page?: number;
}

/**
 * Unassigned Students Response
 */
export interface UnassignedStudentsResponse {
  data: {
    id: number;
    matricule: string;
    firstname: string;
    lastname: string;
    email: string;
    program_id: number;
    level: string;
  }[];
  total: number;
}

/**
 * Student Groups (Frontend view)
 */
export interface StudentGroup {
  id: number;
  group_id: number;
  module_id: number;
  group_code: string;
  group_name: string;
  group_type: GroupType;
  module_code: string;
  module_name: string;
  teacher_name?: string;
  room_name?: string;
  assignment_method: AssignmentMethod;
  assigned_at: string;
}

/**
 * My Groups Response (Frontend student)
 */
export interface MyGroupsResponse {
  data: StudentGroup[];
  academic_year: {
    id: number;
    year: string;
    name: string;
  };
  semester?: {
    id: number;
    code: string;
    name: string;
  };
}
