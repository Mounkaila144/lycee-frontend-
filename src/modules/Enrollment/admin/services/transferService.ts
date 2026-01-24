import { createApiClient } from '@/shared/lib/api-client';

import type {
  Transfer,
  TransferFormData,
  TransferFilters,
  TransferStatistics,
  Equivalence,
  EquivalenceFormData,
  AnalyzeEquivalencesRequest,
  BatchValidateEquivalencesResult,
} from '../../types/transfer.types';

/**
 * Paginated Transfers Response
 */
export interface PaginatedTransfersResponse {
  data: Transfer[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Transfer Query Params
 */
export interface TransferQueryParams extends TransferFilters {
  page?: number;
  per_page?: number;
}

/**
 * Transfer Response (single)
 */
export interface TransferResponse {
  data: Transfer;
  message?: string;
}

/**
 * Analyze Equivalences Response
 */
export interface AnalyzeEquivalencesResponse {
  transfer: Transfer;
  suggestions_count: number;
}

/**
 * Integrate Response
 */
export interface IntegrateResponse {
  transfer: Transfer;
  student_matricule: string;
}

/**
 * Transfer Service
 * Handles all API communication related to transfers (admin)
 */
class TransferService {
  private baseUrl = '/admin/enrollment/transfers';

  /**
   * Fetch paginated transfers with filters
   */
  async getTransfers(tenantId?: string, params?: TransferQueryParams): Promise<PaginatedTransfersResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      if (params?.per_page) {
        queryParams.append('per_page', String(params.per_page));
      }

      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      if (params?.status) {
        queryParams.append('status', params.status);
      }

      if (params?.academic_year_id) {
        queryParams.append('academic_year_id', String(params.academic_year_id));
      }

      if (params?.search) {
        queryParams.append('search', params.search);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await client.get<PaginatedTransfersResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching transfers:', error);
      throw error;
    }
  }

  /**
   * Get transfer by ID
   */
  async getById(id: number, tenantId?: string): Promise<Transfer> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<TransferResponse>(`${this.baseUrl}/${id}`);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching transfer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new transfer request (admin)
   */
  async create(data: TransferFormData, documents?: File[], tenantId?: string): Promise<Transfer> {
    try {
      const client = createApiClient(tenantId);

      const formData = new FormData();

      // Add all transfer data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Add documents if provided
      if (documents && documents.length > 0) {
        documents.forEach(doc => {
          formData.append('documents[]', doc);
        });
      }

      const response = await client.post<TransferResponse>(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  }

  /**
   * Start review of a transfer
   */
  async startReview(id: number, tenantId?: string): Promise<Transfer> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<TransferResponse>(`${this.baseUrl}/${id}/start-review`);

      return response.data.data;
    } catch (error) {
      console.error(`Error starting review for transfer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Analyze equivalences for a transfer
   */
  async analyzeEquivalences(
    id: number,
    data: AnalyzeEquivalencesRequest,
    tenantId?: string
  ): Promise<AnalyzeEquivalencesResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; data: AnalyzeEquivalencesResponse }>(
        `${this.baseUrl}/${id}/analyze`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error analyzing equivalences for transfer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Validate a transfer
   */
  async validate(id: number, tenantId?: string): Promise<Transfer> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<TransferResponse>(`${this.baseUrl}/${id}/validate`);

      return response.data.data;
    } catch (error) {
      console.error(`Error validating transfer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Integrate student from transfer
   */
  async integrate(id: number, tenantId?: string): Promise<IntegrateResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; data: IntegrateResponse }>(
        `${this.baseUrl}/${id}/integrate`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error integrating transfer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reject a transfer
   */
  async reject(id: number, reason: string, tenantId?: string): Promise<Transfer> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<TransferResponse>(`${this.baseUrl}/${id}/reject`, { reason });

      return response.data.data;
    } catch (error) {
      console.error(`Error rejecting transfer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Download equivalence certificate PDF
   */
  async downloadCertificate(id: number, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.baseUrl}/${id}/certificate`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error(`Error downloading certificate for transfer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get transfer statistics
   */
  async getStatistics(academicYearId?: number, tenantId?: string): Promise<TransferStatistics> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = academicYearId ? `?academic_year_id=${academicYearId}` : '';
      const response = await client.get<{ data: TransferStatistics }>(`${this.baseUrl}/statistics${queryParams}`);

      return response.data.data;
    } catch (error) {
      console.error('Error fetching transfer statistics:', error);
      throw error;
    }
  }

  // ==========================================================================
  // Equivalences Methods
  // ==========================================================================

  /**
   * Get equivalences for a transfer
   */
  async getEquivalences(
    transferId: number,
    filters?: { status?: string; type?: string },
    tenantId?: string
  ): Promise<Equivalence[]> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      if (filters?.status) {
        queryParams.append('status', filters.status);
      }

      if (filters?.type) {
        queryParams.append('type', filters.type);
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.baseUrl}/${transferId}/equivalences?${queryString}`
        : `${this.baseUrl}/${transferId}/equivalences`;

      const response = await client.get<{ data: Equivalence[] }>(url);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching equivalences for transfer ${transferId}:`, error);
      throw error;
    }
  }

  /**
   * Create a manual equivalence
   */
  async createEquivalence(transferId: number, data: EquivalenceFormData, tenantId?: string): Promise<Equivalence> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; data: Equivalence }>(
        `${this.baseUrl}/${transferId}/equivalences`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error creating equivalence for transfer ${transferId}:`, error);
      throw error;
    }
  }

  /**
   * Update an equivalence
   */
  async updateEquivalence(equivalenceId: number, data: Partial<EquivalenceFormData>, tenantId?: string): Promise<Equivalence> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.put<{ message: string; data: Equivalence }>(
        `/admin/enrollment/equivalences/${equivalenceId}`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error updating equivalence ${equivalenceId}:`, error);
      throw error;
    }
  }

  /**
   * Delete an equivalence
   */
  async deleteEquivalence(equivalenceId: number, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete(`/admin/enrollment/equivalences/${equivalenceId}`);
    } catch (error) {
      console.error(`Error deleting equivalence ${equivalenceId}:`, error);
      throw error;
    }
  }

  /**
   * Validate a single equivalence
   */
  async validateEquivalence(equivalenceId: number, tenantId?: string): Promise<Equivalence> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; data: Equivalence }>(
        `/admin/enrollment/equivalences/${equivalenceId}/validate`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error validating equivalence ${equivalenceId}:`, error);
      throw error;
    }
  }

  /**
   * Reject a single equivalence
   */
  async rejectEquivalence(equivalenceId: number, notes?: string, tenantId?: string): Promise<Equivalence> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; data: Equivalence }>(
        `/admin/enrollment/equivalences/${equivalenceId}/reject`,
        { notes }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error rejecting equivalence ${equivalenceId}:`, error);
      throw error;
    }
  }

  /**
   * Batch validate equivalences
   */
  async batchValidateEquivalences(
    transferId: number,
    equivalenceIds: number[],
    tenantId?: string
  ): Promise<BatchValidateEquivalencesResult> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ message: string; data: BatchValidateEquivalencesResult }>(
        `${this.baseUrl}/${transferId}/equivalences/batch-validate`,
        { equivalence_ids: equivalenceIds }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error batch validating equivalences for transfer ${transferId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const transferService = new TransferService();
