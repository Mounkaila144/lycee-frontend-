import { createApiClient } from '@/shared/lib/api-client';
import type {
  Role,
  RolesListResponse,
  ManageRolesPayload
} from '../../types/role.types';
import type { User } from '../../types/user.types';

/**
 * Role Service
 * Handles all API communication related to roles
 */
class RoleService {
  /**
   * Fetch all available roles
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with roles list
   */
  async getAllRoles(tenantId?: string): Promise<Role[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<RolesListResponse>('/admin/roles');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Add roles to a user
   * @param userId - The user ID
   * @param roles - Array of role names
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated user data
   */
  async addRoles(userId: number, roles: string[], tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const payload: ManageRolesPayload = { roles };
      const response = await client.post<{ message: string; user: User }>(
        `/admin/users/${userId}/roles/add`,
        payload
      );
      return response.data.user;
    } catch (error) {
      console.error(`Error adding roles to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Remove roles from a user
   * @param userId - The user ID
   * @param roles - Array of role names
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated user data
   */
  async removeRoles(userId: number, roles: string[], tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const payload: ManageRolesPayload = { roles };
      const response = await client.post<{ message: string; user: User }>(
        `/admin/users/${userId}/roles/remove`,
        payload
      );
      return response.data.user;
    } catch (error) {
      console.error(`Error removing roles from user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Sync (replace all) roles for a user
   * @param userId - The user ID
   * @param roles - Array of role names
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated user data
   */
  async syncRoles(userId: number, roles: string[], tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const payload: ManageRolesPayload = { roles };
      const response = await client.post<{ message: string; user: User }>(
        `/admin/users/${userId}/roles/sync`,
        payload
      );
      return response.data.user;
    } catch (error) {
      console.error(`Error syncing roles for user ${userId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const roleService = new RoleService();
