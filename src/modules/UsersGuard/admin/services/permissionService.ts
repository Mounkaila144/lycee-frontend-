import { createApiClient } from '@/shared/lib/api-client';
import type {
  Permission,
  PermissionsListResponse
} from '../../types/permission.types';

/**
 * Permission Service
 * Handles all API communication related to permissions
 */
class PermissionService {
  /**
   * Fetch all available permissions
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with permissions list
   */
  async getAllPermissions(tenantId?: string): Promise<Permission[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<PermissionsListResponse>('/admin/permissions');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const permissionService = new PermissionService();
