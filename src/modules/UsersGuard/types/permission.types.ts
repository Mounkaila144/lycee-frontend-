/**
 * Permission entity from the API
 */
export interface Permission {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * API response for permissions list
 */
export interface PermissionsListResponse {
  data: Permission[];
}

/**
 * Payload for managing user permissions
 */
export interface ManagePermissionsPayload {
  permissions: string[]; // Array of permission names
}
