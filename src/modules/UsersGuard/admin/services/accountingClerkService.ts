import { createApiClient } from '@/shared/lib/api-client';
import type { UserQueryParams } from '../../types/user.types';
import type {
  AccountingClerk,
  PaginatedAccountingClerksResponse
} from '../../types/financial.types';

/**
 * Accounting Clerk Service
 * Handles all API communication related to accounting clerks (users with "Agent Comptable" role)
 */
class AccountingClerkService {
  /**
   * Fetch paginated accounting clerks with filters
   * @param tenantId - The tenant ID for multi-tenancy
   * @param params - Query parameters including pagination and filters
   * @returns Promise with paginated response
   */
  async getAccountingClerks(
    tenantId?: string,
    params?: UserQueryParams
  ): Promise<PaginatedAccountingClerksResponse> {
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
      const url = `/admin/accounting-clerks${queryString ? `?${queryString}` : ''}`;

      const response = await client.get<PaginatedAccountingClerksResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching accounting clerks:', error);
      throw error;
    }
  }

  /**
   * Search accounting clerks (convenience method)
   * @param query - Search query
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with accounting clerks matching the query
   */
  async searchAccountingClerks(query: string, tenantId?: string): Promise<AccountingClerk[]> {
    try {
      const response = await this.getAccountingClerks(tenantId, { search: query, per_page: 50 });
      return response.data;
    } catch (error) {
      console.error('Error searching accounting clerks:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const accountingClerkService = new AccountingClerkService();
