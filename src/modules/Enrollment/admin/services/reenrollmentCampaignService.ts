import { createApiClient } from '@/shared/lib/api-client';

import type {
  ReenrollmentCampaign,
  ReenrollmentCampaignFormData,
  ReenrollmentCampaignFilters,
  CampaignStatistics,
  EligibleStudentsResult,
} from '../../types/reenrollment.types';

/**
 * Paginated Reenrollment Campaigns Response
 */
export interface PaginatedCampaignsResponse {
  data: ReenrollmentCampaign[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Campaign Query Params
 */
export interface CampaignQueryParams extends ReenrollmentCampaignFilters {
  page?: number;
  per_page?: number;
  include_statistics?: boolean;
}

/**
 * Campaign Response (single)
 */
export interface CampaignResponse {
  data: ReenrollmentCampaign;
  message?: string;
}

/**
 * Reenrollment Campaign Service
 * Handles all API communication related to reenrollment campaigns (admin)
 */
class ReenrollmentCampaignService {
  private baseUrl = '/admin/enrollment/reenrollment-campaigns';

  /**
   * Fetch paginated reenrollment campaigns with filters
   */
  async getCampaigns(
    tenantId?: string,
    params?: CampaignQueryParams
  ): Promise<PaginatedCampaignsResponse> {
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

      if (params?.include_statistics) {
        queryParams.append('include_statistics', 'true');
      }

      const queryString = queryParams.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await client.get<PaginatedCampaignsResponse>(url);

      return response.data;
    } catch (error) {
      console.error('Error fetching reenrollment campaigns:', error);
      throw error;
    }
  }

  /**
   * Get campaign by ID
   */
  async getById(id: number, tenantId?: string): Promise<ReenrollmentCampaign> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<CampaignResponse>(`${this.baseUrl}/${id}`);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new campaign
   */
  async create(data: ReenrollmentCampaignFormData, tenantId?: string): Promise<ReenrollmentCampaign> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<CampaignResponse>(this.baseUrl, data);

      return response.data.data;
    } catch (error) {
      console.error('Error creating reenrollment campaign:', error);
      throw error;
    }
  }

  /**
   * Update campaign
   */
  async update(
    id: number,
    data: Partial<ReenrollmentCampaignFormData>,
    tenantId?: string
  ): Promise<ReenrollmentCampaign> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.put<CampaignResponse>(`${this.baseUrl}/${id}`, data);

      return response.data.data;
    } catch (error) {
      console.error(`Error updating campaign ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete campaign
   */
  async delete(id: number, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate a campaign (Draft -> Active)
   */
  async activate(id: number, tenantId?: string): Promise<ReenrollmentCampaign> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<CampaignResponse>(`${this.baseUrl}/${id}/activate`);

      return response.data.data;
    } catch (error) {
      console.error(`Error activating campaign ${id}:`, error);
      throw error;
    }
  }

  /**
   * Close a campaign (Active -> Closed)
   */
  async close(id: number, tenantId?: string): Promise<ReenrollmentCampaign> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<CampaignResponse>(`${this.baseUrl}/${id}/close`);

      return response.data.data;
    } catch (error) {
      console.error(`Error closing campaign ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get campaign statistics
   */
  async getStatistics(id: number, tenantId?: string): Promise<CampaignStatistics> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: CampaignStatistics }>(`${this.baseUrl}/${id}/statistics`);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching campaign statistics ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get eligible students for a campaign
   */
  async getEligibleStudents(id: number, tenantId?: string): Promise<EligibleStudentsResult> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: EligibleStudentsResult }>(`${this.baseUrl}/${id}/eligible-students`);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching eligible students for campaign ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const reenrollmentCampaignService = new ReenrollmentCampaignService();
