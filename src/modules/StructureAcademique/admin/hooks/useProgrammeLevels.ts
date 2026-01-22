'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { programmeLevelService } from '../services/programmeLevelService';
import type { ProgrammeLevelData, ProgrammeLevel } from '../../types/programmeLevel.types';

/**
 * Custom hook for managing programme levels
 * Provides state management and data fetching for programme levels
 */
export const useProgrammeLevels = (programmeId?: number) => {
  const { tenantId } = useTenant();
  const [levels, setLevels] = useState<ProgrammeLevelData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch levels for a programme
   */
  const fetchLevels = useCallback(async () => {
    if (!programmeId) {
      setLevels([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await programmeLevelService.getLevels(programmeId, tenantId);
      setLevels(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch levels'));
      console.error('Error fetching levels:', err);
    } finally {
      setLoading(false);
    }
  }, [programmeId, tenantId]);

  /**
   * Associate levels to a programme
   */
  const associateLevels = useCallback(
    async (levelsToAssociate: ProgrammeLevel[]) => {
      if (!programmeId) {
        throw new Error('Programme ID is required');
      }

      try {
        setLoading(true);
        setError(null);
        const data = await programmeLevelService.associateLevels(
          programmeId,
          levelsToAssociate,
          tenantId
        );
        setLevels(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to associate levels'));
        console.error('Error associating levels:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [programmeId, tenantId]
  );

  /**
   * Remove a specific level from a programme
   */
  const removeLevel = useCallback(
    async (level: ProgrammeLevel) => {
      if (!programmeId) {
        throw new Error('Programme ID is required');
      }

      try {
        setLoading(true);
        setError(null);
        await programmeLevelService.removeLevel(programmeId, level, tenantId);
        // Refresh levels after removal
        await fetchLevels();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to remove level'));
        console.error('Error removing level:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [programmeId, tenantId, fetchLevels]
  );

  /**
   * Refresh levels
   */
  const refresh = useCallback(() => {
    fetchLevels();
  }, [fetchLevels]);

  // Fetch levels on mount and when programmeId changes
  useEffect(() => {
    if (programmeId) {
      fetchLevels();
    }
  }, [fetchLevels, programmeId]);

  return {
    levels,
    loading,
    error,
    associateLevels,
    removeLevel,
    refresh,
  };
};
