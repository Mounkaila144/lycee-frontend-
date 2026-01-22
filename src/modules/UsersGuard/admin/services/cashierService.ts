import { createApiClient } from '@/shared/lib/api-client';
import type { UserQueryParams } from '../../types/user.types';
import type {
  Cashier,
  PaginatedCashiersResponse
} from '../../types/financial.types';

/**
 * Cashier Service
 * Handles all API communication related to cashiers (users with "Caissier" role)
 */
class CashierService {
  /**
   * Fetch paginated cashiers with filters
   * @param tenantId - The tenant ID for multi-tenancy
   * @param params - Query parameters including pagination and filters
   * @returns Promise with paginated response
   */
  async getCashiers(
    tenantId?: string,
    params?: UserQueryParams
  ): Promise<PaginatedCashiersResponse> {
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
      const url = `/admin/cashiers${queryString ? `?${queryString}` : ''}`;

      const response = await client.get<PaginatedCashiersResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching cashiers:', error);
      throw error;
    }
  }

  /**
   * Search cashiers (convenience method)
   * @param query - Search query
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with cashiers matching the query
   */
  async searchCashiers(query: string, tenantId?: string): Promise<Cashier[]> {
    try {
      const response = await this.getCashiers(tenantId, { search: query, per_page: 50 });
      return response.data;
    } catch (error) {
      console.error('Error searching cashiers:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const cashierService = new CashierService();
