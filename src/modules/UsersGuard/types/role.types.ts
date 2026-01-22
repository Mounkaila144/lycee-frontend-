import type { Permission } from './permission.types';

/**
 * Role entity from the API
 */
export interface Role {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  guard_name: string;
  permissions?: Permission[]; // Loaded with 'with' relationship
  created_at?: string;
  updated_at?: string;
}

/**
 * API response for roles list
 */
export interface RolesListResponse {
  data: Role[];
}

/**
 * Payload for managing user roles
 */
export interface ManageRolesPayload {
  roles: string[]; // Array of role names
}
