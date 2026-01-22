import { createApiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  User,
  UserFilters,
  PaginatedUsersResponse,
  UserQueryParams,
  UserCreationOptions,
  CreateUserPayload,
  UpdateUserPayload
} from '../../types/user.types';

/**
 * User Service
 * Handles all API communication related to users
 */
class UserService {
  /**
   * Fetch paginated users with filters
   * @param tenantId - The tenant ID for multi-tenancy
   * @param params - Query parameters including pagination and filters
   * @returns Promise with paginated response
   */
  async getUsers(
    tenantId?: string,
    params?: UserQueryParams
  ): Promise<PaginatedUsersResponse> {
    try {
      const client = createApiClient(tenantId);

      // Build query parameters according to API documentation
      const queryParams = new URLSearchParams();

      // Add per_page parameter (default: 15 according to API)
      if (params?.per_page) {
        queryParams.append('per_page', String(params.per_page));
      }

      // Add page parameter
      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      // Add search parameter (searches in username, email, firstname, lastname)
      if (params?.search) {
        queryParams.append('search', params.search);
      }

      // Add application filter
      if (params?.application) {
        queryParams.append('application', params.application);
      }

      // Add is_active filter (true or false)
      if (params?.is_active !== undefined) {
        queryParams.append('is_active', String(params.is_active));
      }

      const queryString = queryParams.toString();
      const url = `/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await client.get<PaginatedUsersResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Fetch a single user by ID
   * @param userId - The user ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with user data
   */
  async getUserById(userId: number, tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ user: User }>(`/admin/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user creation options (groups, functions, profiles, teams, etc.)
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with creation options
   */
  async getCreationOptions(tenantId?: string): Promise<UserCreationOptions> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<UserCreationOptions>>('/admin/users/creation-options');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user creation options:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param userData - The user data to create
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with created user data
   */
  async createUser(userData: CreateUserPayload, tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; user: User }>('/admin/users', userData);
      return response.data.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   * @param userId - The user ID
   * @param userData - The user data to update
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated user data
   */
  async updateUser(userId: number, userData: UpdateUserPayload, tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.put<{ message: string; user: User }>(`/admin/users/${userId}`, userData);
      return response.data.user;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a user (soft delete)
   * @param userId - The user ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with success status
   */
  async deleteUser(userId: number, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete<{ message: string }>(`/admin/users/${userId}`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Add permissions to a user
   * @param userId - The user ID
   * @param permissions - Array of permission names
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated user data
   */
  async addPermissions(userId: number, permissions: string[], tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; user: User }>(
        `/admin/users/${userId}/permissions/add`,
        { permissions }
      );
      return response.data.user;
    } catch (error) {
      console.error(`Error adding permissions to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Remove permissions from a user
   * @param userId - The user ID
   * @param permissions - Array of permission names
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated user data
   */
  async removePermissions(userId: number, permissions: string[], tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; user: User }>(
        `/admin/users/${userId}/permissions/remove`,
        { permissions }
      );
      return response.data.user;
    } catch (error) {
      console.error(`Error removing permissions from user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Sync (replace all) permissions for a user
   * @param userId - The user ID
   * @param permissions - Array of permission names
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated user data
   */
  async syncPermissions(userId: number, permissions: string[], tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; user: User }>(
        `/admin/users/${userId}/permissions/sync`,
        { permissions }
      );
      return response.data.user;
    } catch (error) {
      console.error(`Error syncing permissions for user ${userId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const userService = new UserService();
