import type { User, UserQueryParams, PaginatedUsersResponse } from './user.types';

/**
 * Cashier-specific user (extends base User type)
 * Cashiers have the "Caissier" role
 */
export interface Cashier extends User {
  // Additional cashier-specific fields can be added here
}

/**
 * Accountant-specific user (extends base User type)
 * Accountants have the "Comptable" role
 */
export interface Accountant extends User {
  // Additional accountant-specific fields can be added here
}

/**
 * Paginated response for cashiers
 */
export interface PaginatedCashiersResponse extends PaginatedUsersResponse {
  data: Cashier[];
}

/**
 * Paginated response for accountants
 */
export interface PaginatedAccountantsResponse extends PaginatedUsersResponse {
  data: Accountant[];
}

/**
 * Financial user types union
 */
export type FinancialUser = Cashier | Accountant;

/**
 * Financial role names
 */
export type FinancialRole = 'Caissier' | 'Comptable';
