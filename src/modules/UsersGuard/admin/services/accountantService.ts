import { createApiClient } from '@/shared/lib/api-client';
import type { UserQueryParams } from '../../types/user.types';
import type {
  Accountant,
  PaginatedAccountantsResponse
} from '../../types/financial.types';

/**
 * Accountant Service
 * Handles all API communication related to accountants (users with "Comptable" role)
 */
class AccountantService {
  /**
   * Fetch paginated accountants with filters
   * @param tenantId - The tenant ID for multi-tenancy
   * @param params - Query parameters including pagination and filters
   * @returns Promise with paginated response
   */
  async getAccountants(
    tenantId?: string,
    params?: UserQueryParams
  ): Promise<PaginatedAccountantsResponse> {
    try {
      const client = createApiClient(tenantId);

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add per_page parameter (default: 15 according to API)
      if (params?.per_page) {
        queryParams.append('per_page', String(params.per_page));
      }

      // Add page parameter
      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      // Add search parameter
      if (params?.search) {
        queryParams.append('search', params.search);
      }

      const queryString = queryParams.toString();
      const url = `/admin/accountants${queryString ? `?${queryString}` : ''}`;

      const response = await client.get<PaginatedAccountantsResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching accountants:', error);
      throw error;
    }
  }

  /**
   * Search accountants (convenience method)
   * @param query - Search query
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with accountants matching the query
   */
  async searchAccountants(query: string, tenantId?: string): Promise<Accountant[]> {
    try {
      const response = await this.getAccountants(tenantId, { search: query, per_page: 50 });
      return response.data;
    } catch (error) {
      console.error('Error searching accountants:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const accountantService = new AccountantService();
