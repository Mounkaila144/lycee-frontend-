import { createApiClient } from '@/shared/lib/api-client';

import type {
  StudentCard,
  GenerateCardRequest,
  BatchGenerateCardsRequest,
  BatchGenerateCardsResult,
  UpdateCardStatusRequest,
  UpdatePrintStatusRequest,
  VerifyCardRequest,
  VerifyCardResponse,
  CardQueryParams,
  PaginatedCardsResponse,
  CardStatistics,
  MyCardResponse,
} from '../../types/studentCard.types';

/**
 * Card Response (single)
 */
export interface CardResponse {
  data: StudentCard;
  message?: string;
}

/**
 * Student Card Service
 * Handles all API communication related to student cards
 */
class StudentCardService {
  private baseUrl = '/admin/enrollment/student-cards';
  private frontendUrl = '/frontend/enrollment';

  /**
   * Fetch paginated cards with filters
   */
  async getCards(tenantId?: string, params?: CardQueryParams): Promise<PaginatedCardsResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      if (params?.per_page) queryParams.append('per_page', String(params.per_page));
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.search) queryParams.append('search', params.search);
      if (params?.student_id) queryParams.append('student_id', String(params.student_id));
      if (params?.academic_year_id) queryParams.append('academic_year_id', String(params.academic_year_id));
      if (params?.status) queryParams.append('status', params.status);
      if (params?.print_status) queryParams.append('print_status', params.print_status);
      if (params?.is_duplicate !== undefined) queryParams.append('is_duplicate', String(params.is_duplicate));
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

      const queryString = queryParams.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await client.get<PaginatedCardsResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching student cards:', error);
      throw error;
    }
  }

  /**
   * Get card by ID
   */
  async getById(id: number, tenantId?: string): Promise<StudentCard> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<CardResponse>(`${this.baseUrl}/${id}`);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching card ${id}:`, error);
      throw error;
    }
  }

  /**
   * Generate card for a student
   */
  async generate(data: GenerateCardRequest, tenantId?: string): Promise<StudentCard> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<CardResponse>(
        `${this.baseUrl}/generate/${data.student_id}`,
        { academic_year_id: data.academic_year_id }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error generating card:', error);
      throw error;
    }
  }

  /**
   * Batch generate cards
   */
  async batchGenerate(data: BatchGenerateCardsRequest, tenantId?: string): Promise<BatchGenerateCardsResult> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ data: BatchGenerateCardsResult }>(
        `${this.baseUrl}/batch-generate`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error batch generating cards:', error);
      throw error;
    }
  }

  /**
   * Generate duplicate card
   */
  async generateDuplicate(cardId: number, reason?: string, tenantId?: string): Promise<StudentCard> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<CardResponse>(
        `${this.baseUrl}/${cardId}/duplicate`,
        { reason }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error generating duplicate:', error);
      throw error;
    }
  }

  /**
   * Update card status
   */
  async updateStatus(cardId: number, data: UpdateCardStatusRequest, tenantId?: string): Promise<StudentCard> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.patch<CardResponse>(
        `${this.baseUrl}/${cardId}/status`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error updating card status:', error);
      throw error;
    }
  }

  /**
   * Update print status
   */
  async updatePrintStatus(cardId: number, data: UpdatePrintStatusRequest, tenantId?: string): Promise<StudentCard> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.patch<CardResponse>(
        `${this.baseUrl}/${cardId}/print-status`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error updating print status:', error);
      throw error;
    }
  }

  /**
   * Verify card via QR code
   */
  async verify(data: VerifyCardRequest, tenantId?: string): Promise<VerifyCardResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ data: VerifyCardResponse }>(
        `${this.baseUrl}/verify`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error verifying card:', error);
      throw error;
    }
  }

  /**
   * Download card PDF
   */
  async downloadPdf(cardId: number, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.baseUrl}/${cardId}/download`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error(`Error downloading card PDF ${cardId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a student card
   */
  async deleteCard(cardId: number, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete(`${this.baseUrl}/${cardId}`);
    } catch (error) {
      console.error(`Error deleting card ${cardId}:`, error);
      throw error;
    }
  }

  /**
   * Download batch print (multiple cards)
   * NOTE: Backend route /batch-print not implemented yet.
   * This method downloads cards individually and returns them as a zip-like blob
   * or downloads each card separately.
   */
  async downloadBatchPrint(
    cardIds: number[],
    _format: 'individual' | 'sheet_8' = 'sheet_8',
    tenantId?: string
  ): Promise<Blob> {
    // Since batch-print endpoint doesn't exist, we download cards individually
    // For now, we'll just download the first card as a workaround
    // TODO: Backend should implement POST /admin/enrollment/student-cards/batch-print
    if (cardIds.length === 0) {
      throw new Error('No cards selected for batch print');
    }

    // Download first card as temporary workaround
    // In production, backend should provide batch-print endpoint
    console.warn(
      'batch-print endpoint not available. Downloading first card only. ' +
      'Backend should implement POST /admin/enrollment/student-cards/batch-print'
    );

    return this.downloadPdf(cardIds[0], tenantId);
  }

  /**
   * Get card statistics
   */
  async getStatistics(tenantId?: string, academicYearId?: number): Promise<CardStatistics> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: CardStatistics }>(
        `${this.baseUrl}/statistics`,
        {
          params: academicYearId ? { academic_year_id: academicYearId } : undefined
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching card statistics:', error);
      throw error;
    }
  }

  /**
   * Get my card (student frontend)
   */
  async getMyCard(tenantId?: string): Promise<MyCardResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: MyCardResponse }>(
        `${this.frontendUrl}/my-card`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching my card:', error);
      throw error;
    }
  }

  /**
   * Download my card (student frontend)
   */
  async downloadMyCard(tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.frontendUrl}/my-card/download`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error downloading my card:', error);
      throw error;
    }
  }

  /**
   * Get my card QR code image
   */
  async getMyCardQRCode(tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.frontendUrl}/my-card/qr-code`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching my card QR code:', error);
      throw error;
    }
  }

  /**
   * Request duplicate card (student frontend)
   * NOTE: Backend route /my-card/duplicate not implemented yet.
   * TODO: Backend should implement POST /frontend/enrollment/my-card/duplicate
   */
  async requestDuplicate(_reason: string, _tenantId?: string): Promise<StudentCard> {
    // This endpoint is not yet implemented in the backend
    // Students cannot request duplicates directly - admin must generate them
    console.error(
      'requestDuplicate: This feature is not yet available. ' +
      'Backend should implement POST /frontend/enrollment/my-card/duplicate'
    );
    throw new Error(
      'Cette fonctionnalité n\'est pas encore disponible. ' +
      'Veuillez contacter l\'administration pour demander un duplicata de votre carte.'
    );
  }
}

// Export singleton instance
export const studentCardService = new StudentCardService();
