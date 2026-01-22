import { createApiClient } from '@/shared/lib/api-client';
import type {
  ProgrammeLevelData,
  AssociateLevelsRequest,
  ProgrammeLevelResponse,
  ProgrammeLevel,
} from '../../types/programmeLevel.types';

/**
 * Programme Level Service
 * Handles all API communication related to programme levels
 */
class ProgrammeLevelService {
  /**
   * Get levels associated with a programme
   * @param programmeId - The programme ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with levels data
   */
  async getLevels(programmeId: number, tenantId?: string): Promise<ProgrammeLevelData[]> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ProgrammeLevelResponse>(
        `/admin/programmes/${programmeId}/levels`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching levels for programme ${programmeId}:`, error);
      throw error;
    }
  }

  /**
   * Associate levels to a programme (replaces existing levels)
   * @param programmeId - The programme ID
   * @param levels - Array of levels to associate
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated levels data
   */
  async associateLevels(
    programmeId: number,
    levels: ProgrammeLevel[],
    tenantId?: string
  ): Promise<ProgrammeLevelData[]> {
    try {
      const client = createApiClient(tenantId);
      const data: AssociateLevelsRequest = { levels };
      const response = await client.post<ProgrammeLevelResponse>(
        `/admin/programmes/${programmeId}/levels`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error associating levels to programme ${programmeId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a specific level from a programme
   * @param programmeId - The programme ID
   * @param level - The level to remove
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with success status
   */
  async removeLevel(
    programmeId: number,
    level: ProgrammeLevel,
    tenantId?: string
  ): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete(`/admin/programmes/${programmeId}/levels/${level}`);
    } catch (error) {
      console.error(`Error removing level ${level} from programme ${programmeId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const programmeLevelService = new ProgrammeLevelService();
