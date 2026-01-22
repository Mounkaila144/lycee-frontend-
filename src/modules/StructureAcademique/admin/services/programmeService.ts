import { createApiClient } from '@/shared/lib/api-client';
import type {
  Programme,
  ProgrammeFormData,
  PaginatedProgrammesResponse,
  ProgrammeQueryParams,
  ProgrammeResponse,
  ProgrammeStatistics,
  ChangeStatusData,
  ImportPreviewResponse,
  ImportConfirmResponse,
  ExportParams,
} from '../../types/programme.types';

/**
 * Programme Service
 * Handles all API communication related to programmes
 */
class ProgrammeService {
  /**
   * Fetch paginated programmes with filters
   * @param tenantId - The tenant ID for multi-tenancy
   * @param params - Query parameters including pagination and filters
   * @returns Promise with paginated response
   */
  async getProgrammes(
    tenantId?: string,
    params?: ProgrammeQueryParams
  ): Promise<PaginatedProgrammesResponse> {
    try {
      const client = createApiClient(tenantId);

      // Build query parameters according to API documentation
      const queryParams = new URLSearchParams();

      // Add per_page parameter
      if (params?.per_page) {
        queryParams.append('per_page', String(params.per_page));
      }

      // Add page parameter
      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      // Add search parameter (searches in code, libelle)
      if (params?.search) {
        queryParams.append('search', params.search);
      }

      // Add type filter
      if (params?.type) {
        queryParams.append('type', params.type);
      }

      // Add statut filter
      if (params?.statut) {
        queryParams.append('statut', params.statut);
      }

      const queryString = queryParams.toString();
      const url = `/admin/programmes${queryString ? `?${queryString}` : ''}`;

      const response = await client.get<PaginatedProgrammesResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching programmes:', error);
      throw error;
    }
  }

  /**
   * Fetch a single programme by ID
   * @param programmeId - The programme ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with programme data
   */
  async getProgramme(programmeId: number, tenantId?: string): Promise<Programme> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ProgrammeResponse>(`/admin/programmes/${programmeId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching programme ${programmeId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new programme
   * @param programmeData - The programme data to create
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with created programme data
   */
  async createProgramme(programmeData: ProgrammeFormData, tenantId?: string): Promise<Programme> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ProgrammeResponse>('/admin/programmes', programmeData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating programme:', error);
      throw error;
    }
  }

  /**
   * Update an existing programme
   * @param programmeId - The programme ID
   * @param programmeData - The programme data to update
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated programme data
   */
  async updateProgramme(
    programmeId: number,
    programmeData: Partial<ProgrammeFormData>,
    tenantId?: string
  ): Promise<Programme> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.put<ProgrammeResponse>(
        `/admin/programmes/${programmeId}`,
        programmeData
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating programme ${programmeId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a programme (soft delete)
   * @param programmeId - The programme ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with success status
   */
  async deleteProgramme(programmeId: number, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete(`/admin/programmes/${programmeId}`);
    } catch (error) {
      console.error(`Error deleting programme ${programmeId}:`, error);
      throw error;
    }
  }

  /**
   * Change programme status
   * @param programmeId - The programme ID
   * @param data - Status change data
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated programme data
   */
  async changeStatus(programmeId: number, data: ChangeStatusData, tenantId?: string): Promise<Programme> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.patch<ProgrammeResponse>(
        `/admin/programmes/${programmeId}/status`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error changing status for programme ${programmeId}:`, error);
      throw error;
    }
  }

  /**
   * Get programme statistics
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with statistics data
   */
  async getStatistics(tenantId?: string): Promise<ProgrammeStatistics> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: ProgrammeStatistics }>(
        '/admin/programmes/statistics'
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching programme statistics:', error);
      throw error;
    }
  }

  /**
   * Upload file for import preview
   * @param file - The Excel/CSV file to upload
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with preview data
   */
  async uploadForPreview(file: File, tenantId?: string): Promise<ImportPreviewResponse> {
    try {
      const client = createApiClient(tenantId);
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

      const response = await client.post<any>(
        '/admin/programmes/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('📥 Raw backend response:', response.data);
      
      // Handle the actual backend response format
      let previewData: ImportPreviewResponse;
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Backend returns: { data: [...], summary: {...}, preview_key: '...' }
        const backendData = response.data;
        previewData = {
          total_rows: backendData.summary?.total_rows || backendData.data.length,
          valid_rows: backendData.summary?.valid_rows || backendData.data.filter((r: any) => r.valid).length,
          invalid_rows: backendData.summary?.invalid_rows || backendData.data.filter((r: any) => !r.valid).length,
          rows: backendData.data.map((item: any) => ({
            row_number: item.row,
            data: item.data,
            is_valid: item.valid,
            errors: item.errors || []
          })),
          can_import: backendData.summary?.can_import ?? (backendData.data.some((r: any) => r.valid)),
          preview_key: backendData.preview_key // Store the preview key
        };
      } else if (response.data.rows) {
        // Standard format: { total_rows, valid_rows, invalid_rows, rows: [...] }
        previewData = response.data;
      } else {
        // Fallback: empty data
        console.warn('⚠️ Unexpected response format');
        previewData = {
          total_rows: 0,
          valid_rows: 0,
          invalid_rows: 0,
          rows: [],
          can_import: false
        };
      }
      
      console.log('📊 Parsed preview data:', previewData);
      
      return previewData;
    } catch (error) {
      console.error('❌ Error uploading file for preview:', error);
      throw error;
    }
  }

  /**
   * Confirm import after preview
   * @param file - The Excel/CSV file to import
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with import result
   */
  /**
   * Confirm import after preview
   * @param previewKey - The preview key from the preview response
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with import result
   */
  async confirmImport(previewKey: string, tenantId?: string): Promise<ImportConfirmResponse> {
    try {
      const client = createApiClient(tenantId);

      const response = await client.post<any>(
        '/admin/programmes/import/confirm',
        { preview_key: previewKey },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('📥 Import confirm response:', response.data);
      
      // Handle the actual backend response format
      let importResult: ImportConfirmResponse;
      
      if (response.data.results) {
        // Backend returns: { message, results: { created, errors, skipped } }
        const backendData = response.data;
        const results = backendData.results;
        
        importResult = {
          success: results.created > 0 || results.errors.length === 0,
          message: backendData.message || 'Import terminé',
          created_count: results.created || 0,
          failed_count: results.errors?.length || 0,
          errors: results.errors?.map((err: any) => ({
            row: err.row,
            message: Array.isArray(err.errors) ? err.errors.join(', ') : err.errors
          })) || []
        };
      } else if (response.data.success !== undefined) {
        // Standard format: { success, message, created_count, failed_count, errors: [...] }
        importResult = {
          success: response.data.success,
          message: response.data.message || 'Import terminé',
          created_count: response.data.created_count || 0,
          failed_count: response.data.failed_count || 0,
          errors: response.data.errors || []
        };
      } else if (response.data.data) {
        // Wrapped format
        importResult = response.data.data;
      } else {
        // Fallback
        importResult = {
          success: false,
          message: 'Format de réponse inattendu',
          created_count: 0,
          failed_count: 0,
          errors: []
        };
      }
      
      console.log('✅ Parsed import result:', importResult);
      
      return importResult;
    } catch (error) {
      console.error('Error confirming import:', error);
      throw error;
    }
  }

  /**
   * Download import template
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with blob data
   */
  async downloadTemplate(tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get('/admin/programmes/export/template', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error;
    }
  }

  /**
   * Export programmes to Excel or CSV
   * @param params - Export parameters (format, filters)
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with blob data
   */
  async exportProgrammes(params: ExportParams, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);

      const queryParams = new URLSearchParams();
      if (params.statut) queryParams.append('statut', params.statut);
      if (params.type) queryParams.append('type', params.type);

      const endpoint = params.format === 'excel'
        ? '/admin/programmes/export/excel'
        : '/admin/programmes/export/csv';

      const queryString = queryParams.toString();
      const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;

      const response = await client.get(url, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting programmes:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const programmeService = new ProgrammeService();
