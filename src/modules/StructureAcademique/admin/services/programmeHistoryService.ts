import { createApiClient } from '@/shared/lib/api-client';
import type {
  ProgrammeHistory,
  ProgrammeHistoryQueryParams,
  PaginatedHistoryResponse,
  HistoryComparisonParams,
  HistoryComparison,
  RestoreVersionData,
} from '../../types/programme-history.types';

/**
 * Programme History Service
 * Handles all API communication related to programme history
 */
class ProgrammeHistoryService {
  /**
   * Fetch paginated history for a programme
   * @param programmeId - The programme ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @param params - Query parameters including pagination and filters
   * @returns Promise with paginated history response
   */
  async getHistory(
    programmeId: number,
    tenantId?: string,
    params?: ProgrammeHistoryQueryParams
  ): Promise<PaginatedHistoryResponse> {
    try {
      const client = createApiClient(tenantId);

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params?.per_page) {
        queryParams.append('per_page', String(params.per_page));
      }

      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      if (params?.start_date) {
        queryParams.append('start_date', params.start_date);
      }

      if (params?.end_date) {
        queryParams.append('end_date', params.end_date);
      }

      if (params?.user_id) {
        queryParams.append('user_id', String(params.user_id));
      }

      if (params?.action) {
        queryParams.append('action', params.action);
      }

      if (params?.field_changed) {
        queryParams.append('field_changed', params.field_changed);
      }

      const queryString = queryParams.toString();
      const url = `/admin/programmes/${programmeId}/history${queryString ? `?${queryString}` : ''}`;

      const response = await client.get<PaginatedHistoryResponse>(url);

      return response.data;
    } catch (error) {
      console.error(`Error fetching history for programme ${programmeId}:`, error);
      throw error;
    }
  }

  /**
   * Compare two versions of a programme
   * @param programmeId - The programme ID
   * @param params - Comparison parameters with version IDs
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with comparison data
   */
  async compareVersions(
    programmeId: number,
    params: HistoryComparisonParams,
    tenantId?: string
  ): Promise<HistoryComparison> {
    try {
      const client = createApiClient(tenantId);

      const queryParams = new URLSearchParams({
        version1_id: String(params.version1_id),
        version2_id: String(params.version2_id),
      });

      const url = `/admin/programmes/${programmeId}/history/compare?${queryParams.toString()}`;

      const response = await client.get<{ data: HistoryComparison }>(url);

      return response.data.data;
    } catch (error) {
      console.error(`Error comparing versions for programme ${programmeId}:`, error);
      throw error;
    }
  }

  /**
   * Restore a programme to a previous version
   * @param programmeId - The programme ID
   * @param data - Restoration data with history ID and optional reason
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with success status
   */
  async restoreVersion(
    programmeId: number,
    data: RestoreVersionData,
    tenantId?: string
  ): Promise<void> {
    try {
      const client = createApiClient(tenantId);

      await client.post(`/admin/programmes/${programmeId}/restore/${data.history_id}`, {
        reason: data.reason,
      });
    } catch (error) {
      console.error(`Error restoring version for programme ${programmeId}:`, error);
      throw error;
    }
  }

  /**
   * Export history to PDF
   * @param programmeId - The programme ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with PDF blob
   */
  async exportHistoryPDF(programmeId: number, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);

      const response = await client.get(`/admin/programmes/${programmeId}/history/export`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error(`Error exporting history PDF for programme ${programmeId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const programmeHistoryService = new ProgrammeHistoryService();
