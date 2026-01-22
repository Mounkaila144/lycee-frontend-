import type { User, UserQueryParams, PaginatedUsersResponse } from './user.types';

/**
 * Student-specific user (extends base User type)
 * Students have the "Étudiant" role
 */
export interface Student extends User {
  // Additional student-specific fields can be added here
  matricule?: string;
  status?: 'Actif' | 'Suspendu' | 'Exclu' | 'Diplômé';
  program_id?: number;
  level_id?: number;
}

/**
 * Query parameters for student list (extends UserQueryParams)
 */
export interface StudentQueryParams extends UserQueryParams {
  program_id?: number; // Filter by program
  level_id?: number; // Filter by level
  status?: 'Actif' | 'Suspendu' | 'Exclu' | 'Diplômé'; // Filter by status
}

/**
 * Paginated response for students
 */
export interface PaginatedStudentsResponse extends PaginatedUsersResponse {
  data: Student[];
}
