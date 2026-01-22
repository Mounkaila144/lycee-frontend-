/**
 * User group information
 */
export interface UserGroup {
  id: number;
  name: string;
  permissions: string[] | null;
}

/**
 * User entity from the API (matching API response)
 */
export interface User {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  full_name: string;
  application: 'admin' | 'frontend';
  is_active: boolean;
  roles: string[];
  permissions: string[];
  created_at: string;
  updated_at: string;
}

// (UserFilters removed - use UserQueryParams instead)

/**
 * Pagination links from Laravel API
 */
export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

/**
 * Pagination meta information from Laravel API
 */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Statistics for users
 */
export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  locked_users: number;
}

/**
 * Paginated response from API (Laravel structure)
 */
export interface PaginatedUsersResponse {
  data: User[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Query parameters for user list (matching API documentation)
 */
export interface UserQueryParams {
  page?: number;
  per_page?: number;
  search?: string; // Global search across username, email, firstname, lastname
  application?: 'admin' | 'frontend'; // Filter by application type
  is_active?: boolean; // Filter by active status
}

/**
 * Permission in a permission group
 */
export interface Permission {
  id: number;
  name: string;
}

/**
 * Permission group
 */
export interface PermissionGroup {
  id: number;
  name: string;
  permissions: Permission[];
}

/**
 * User group with permission IDs
 */
export interface GroupOption {
  id: number;
  name: string;
  permissions_count: number;
  permission_ids: number[];
}

/**
 * Function option
 */
export interface FunctionOption {
  id: number;
  name: string;
}

/**
 * Profile option
 */
export interface ProfileOption {
  id: number;
  name: string;
}

/**
 * Team option
 */
export interface TeamOption {
  id: number;
  name: string;
  manager_id?: number;
}

/**
 * Attribution option
 */
export interface AttributionOption {
  id: number;
  name: string;
}

/**
 * Call center option
 */
export interface CallCenterOption {
  id: number;
  name: string;
}

/**
 * User creation options response
 */
export interface UserCreationOptions {
  groups: GroupOption[];
  permission_groups: PermissionGroup[];
  functions: FunctionOption[];
  profiles: ProfileOption[];
  teams: TeamOption[];
  attributions: AttributionOption[];
  callcenters: CallCenterOption[];
}

/**
 * User creation payload (matching API documentation)
 */
export interface CreateUserPayload {
  username: string;
  password: string;
  email: string;
  firstname: string;
  lastname: string;
  application: 'admin' | 'frontend';
  sex?: 'M' | 'F' | 'Other';
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  is_active?: boolean;
  roles?: string[];
  permissions?: string[];
}

/**
 * User update payload (matching API documentation)
 */
export interface UpdateUserPayload {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string; // Optional - only if changing password
  sex?: 'M' | 'F' | 'Other';
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  is_active?: boolean;
  roles?: string[];
  permissions?: string[];
}
