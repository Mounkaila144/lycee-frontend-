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
 * Accounting Clerk-specific user (extends base User type)
 * Accounting Clerks have the "Agent Comptable" role
 */
export interface AccountingClerk extends User {
  // Additional accounting clerk-specific fields can be added here
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
 * Paginated response for accounting clerks
 */
export interface PaginatedAccountingClerksResponse extends PaginatedUsersResponse {
  data: AccountingClerk[];
}

/**
 * Financial user types union
 */
export type FinancialUser = Cashier | Accountant | AccountingClerk;

/**
 * Financial role names
 */
export type FinancialRole = 'Caissier' | 'Comptable' | 'Agent Comptable';
