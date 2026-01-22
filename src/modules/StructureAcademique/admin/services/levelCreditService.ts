import { createApiClient } from '@/shared/lib/api-client';
import type {
  LevelCreditConfiguration,
  LevelCreditFormData,
  LevelCreditsListResponse,
  LevelCreditResponse,
  CreditValidationReport,
  CreditValidationResponse,
} from '../../types/levelCredit.types';

/**
 * Level Credit Service
 * Handles all API communication related to level credit configurations
 */
class LevelCreditService {
  /**
   * Fetch global credit configurations
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with credit configurations
   */
  async getGlobalConfigurations(tenantId?: string): Promise<LevelCreditConfiguration[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<LevelCreditsListResponse>('/admin/levels/credits');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching global credit configurations:', error);
      throw error;
    }
  }

  /**
   * Update or create global credit configuration
   * @param data - Credit configuration data
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with created/updated configuration
   */
  async updateGlobalConfiguration(
    data: LevelCreditFormData,
    tenantId?: string
  ): Promise<LevelCreditConfiguration> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<LevelCreditResponse>('/admin/levels/credits', data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating global credit configuration:', error);
      throw error;
    }
  }

  /**
   * Fetch program-specific credit configurations
   * @param programId - The program ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with credit configurations
   */
  async getProgramConfigurations(
    programId: number,
    tenantId?: string
  ): Promise<LevelCreditConfiguration[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<LevelCreditsListResponse>(
        `/admin/programmes/${programId}/credits`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching credit configurations for program ${programId}:`, error);
      throw error;
    }
  }

  /**
   * Update or create program-specific credit configuration
   * @param programId - The program ID
   * @param data - Credit configuration data
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with created/updated configuration
   */
  async updateProgramConfiguration(
    programId: number,
    data: LevelCreditFormData,
    tenantId?: string
  ): Promise<LevelCreditConfiguration> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<LevelCreditResponse>(
        `/admin/programmes/${programId}/credits`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating credit configuration for program ${programId}:`, error);
      throw error;
    }
  }

  /**
   * Validate program credit configuration
   * @param programId - The program ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with validation report
   */
  async validateProgramCredits(
    programId: number,
    tenantId?: string
  ): Promise<CreditValidationReport> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<CreditValidationResponse>(
        `/admin/programmes/${programId}/credits/validate`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error validating credits for program ${programId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const levelCreditService = new LevelCreditService();
