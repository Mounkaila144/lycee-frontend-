/**
 * Enrollment Module - Option Types
 * Types for option/specialization selection and assignment
 */

/**
 * Option Status
 */
export type OptionStatus = 'Open' | 'Closed' | 'Archived';

/**
 * Choice Rank
 */
export type ChoiceRank = '1' | '2' | '3';

/**
 * Choice Status
 */
export type ChoiceStatus = 'Pending' | 'Validated' | 'Rejected';

/**
 * Assignment Method
 */
export type AssignmentMethod = 'Automatic' | 'Manual';

/**
 * Option Entity
 */
export interface Option {
  id: number;
  programme_id: number;
  level: string;
  code: string;
  name: string;
  description?: string;
  capacity: number;
  enrolled_count: number;
  remaining_capacity: number;
  is_full: boolean;
  prerequisites?: Record<string, number>; // {module_id: min_grade}
  is_mandatory: boolean;
  choice_start_date: string;
  choice_end_date: string;
  status: OptionStatus;
  is_open: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  program?: {
    id: number;
    code: string;
    name: string;
  };
  prerequisite_modules?: PrerequisiteModule[];
}

/**
 * Prerequisite Module Info
 */
export interface PrerequisiteModule {
  module_id: number;
  module_code: string;
  module_name: string;
  min_grade: number;
  student_grade?: number;
  is_met: boolean;
}

/**
 * Option Choice (Student's wishes)
 */
export interface OptionChoice {
  id: number;
  student_id: number;
  option_id: number;
  choice_rank: ChoiceRank;
  academic_year_id: number;
  status: ChoiceStatus;
  motivation?: string;
  created_at: string;
  updated_at: string;

  // Relations
  option?: Option;
  student?: {
    id: number;
    matricule: string;
    firstname: string;
    lastname: string;
  };
}

/**
 * Option Assignment (Final assignment)
 */
export interface OptionAssignment {
  id: number;
  student_id: number;
  option_id: number;
  academic_year_id: number;
  choice_rank_obtained: number;
  assignment_method: AssignmentMethod;
  assigned_by?: number;
  assignment_notes?: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;

  // Relations
  option?: Option;
  student?: {
    id: number;
    matricule: string;
    firstname: string;
    lastname: string;
  };
  assigned_by_user?: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

/**
 * Option Choice Form Data
 */
export interface OptionChoiceFormData {
  option_id: number;
  choice_rank: ChoiceRank;
  motivation?: string;
}

/**
 * Submit Choices Request
 */
export interface SubmitChoicesRequest {
  student_id: number;
  academic_year_id: number;
  choices: OptionChoiceFormData[];
}

/**
 * Available Options Response
 */
export interface AvailableOptionsResponse {
  options: Option[];
  student_choices: OptionChoice[];
  student_assignment: OptionAssignment | null;
  choice_period?: {
    start_date: string;
    end_date: string;
    is_open: boolean;
    days_remaining?: number;
  };
  max_choices?: number;
}

/**
 * Option Statistics
 */
export interface OptionStatistics {
  option_id: number;
  option_code: string;
  option_name: string;
  capacity: number;
  total_choices: number;
  first_choices: number;
  second_choices: number;
  third_choices: number;
  assigned_count: number;
  fill_rate: number;
}

/**
 * Global Option Statistics
 */
export interface GlobalOptionStatistics {
  total_students: number;
  students_with_choices: number;
  students_assigned: number;
  students_pending: number;
  satisfaction_rate: number; // % who got 1st choice
  average_choice_rank: number;
  options_statistics: OptionStatistics[];
}

/**
 * Assignment Result
 */
export interface AssignmentResult {
  assigned: number;
  waitlist: number;
  not_assigned: number;
  assignments: OptionAssignment[];
  errors?: string[];
}

/**
 * Option Query Params
 */
export interface OptionQueryParams {
  programme_id?: number;
  level?: string;
  status?: OptionStatus;
  academic_year_id?: number;
  page?: number;
  per_page?: number;
}

/**
 * Paginated Options Response
 */
export interface PaginatedOptionsResponse {
  data: Option[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Option Form Data (Admin)
 */
export interface OptionFormData {
  programme_id: number;
  level: string;
  code: string;
  name: string;
  description?: string;
  capacity: number;
  prerequisites?: Record<string, number>;
  is_mandatory: boolean;
  choice_start_date: string;
  choice_end_date: string;
  status: OptionStatus;
}

/**
 * Manual Assignment Request
 */
export interface ManualAssignmentRequest {
  student_id: number;
  option_id: number;
  academic_year_id: number;
  assignment_notes?: string;
}

/**
 * Automatic Assignment Request
 */
export interface AutomaticAssignmentRequest {
  academic_year_id: number;
  programme_id: number;
  level: string;
}

/**
 * Student Option Summary
 */
export interface StudentOptionSummary {
  student_id: number;
  student_matricule: string;
  student_name: string;
  choices: {
    rank: ChoiceRank;
    option_code: string;
    option_name: string;
    status: ChoiceStatus;
  }[];
  assignment?: {
    option_code: string;
    option_name: string;
    choice_rank_obtained: number;
    method: AssignmentMethod;
    assigned_at: string;
  };
  status: 'no_choices' | 'pending' | 'assigned' | 'waitlist';
}
