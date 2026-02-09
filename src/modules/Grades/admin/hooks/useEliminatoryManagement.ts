'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { adminEliminatoryService } from '../services/adminEliminatoryService';

import type {
  EliminatoryModule,
  BlockedStudent,
  EliminatoryStatistics,
  THRESHOLD_CONSTRAINTS,
} from '../../types/eliminatory.types';

/**
 * Custom hook for eliminatory module management
 */
export const useEliminatoryManagement = (semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  // State
  const [eliminatoryModules, setEliminatoryModules] = useState<EliminatoryModule[]>([]);
  const [blockedStudents, setBlockedStudents] = useState<BlockedStudent[]>([]);
  const [blockedCount, setBlockedCount] = useState<number>(0);
  const [statistics, setStatistics] = useState<EliminatoryStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [blockedLoading, setBlockedLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch eliminatory modules for semester
   */
  const fetchEliminatoryModules = useCallback(async () => {
    if (!semesterId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await adminEliminatoryService.getEliminatoryModules(semesterId, tenantId);

      setEliminatoryModules(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch eliminatory modules'));
      console.error('Error fetching eliminatory modules:', err);
    } finally {
      setLoading(false);
    }
  }, [semesterId, tenantId]);

  /**
   * Fetch statistics
   */
  const fetchStatistics = useCallback(async () => {
    if (!semesterId) return;

    try {
      setStatsLoading(true);
      const data = await adminEliminatoryService.getStatistics(semesterId, tenantId);

      setStatistics(data);
    } catch (err) {
      console.error('Error fetching eliminatory statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [semesterId, tenantId]);

  /**
   * Fetch blocked students
   */
  const fetchBlockedStudents = useCallback(async () => {
    if (!semesterId) return;

    try {
      setBlockedLoading(true);
      const result = await adminEliminatoryService.getBlockedStudents(semesterId, tenantId);

      setBlockedStudents(result.students);
      setBlockedCount(result.count);
    } catch (err) {
      console.error('Error fetching blocked students:', err);
    } finally {
      setBlockedLoading(false);
    }
  }, [semesterId, tenantId]);

  /**
   * Toggle eliminatory status for a module
   */
  const toggleModule = useCallback(
    async (moduleId: number): Promise<boolean> => {
      try {
        setSaving(true);
        setError(null);

        await adminEliminatoryService.toggleEliminatory(moduleId, tenantId);

        // Refresh data
        await Promise.all([fetchEliminatoryModules(), fetchStatistics()]);

        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to toggle eliminatory status'));
        console.error('Error toggling eliminatory:', err);

        return false;
      } finally {
        setSaving(false);
      }
    },
    [tenantId, fetchEliminatoryModules, fetchStatistics]
  );

  /**
   * Update threshold for a module
   */
  const updateThreshold = useCallback(
    async (moduleId: number, threshold: number): Promise<boolean> => {
      try {
        setSaving(true);
        setError(null);

        await adminEliminatoryService.updateThreshold(moduleId, threshold, tenantId);

        // Refresh data
        await Promise.all([fetchEliminatoryModules(), fetchStatistics()]);

        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update threshold'));
        console.error('Error updating threshold:', err);

        return false;
      } finally {
        setSaving(false);
      }
    },
    [tenantId, fetchEliminatoryModules, fetchStatistics]
  );

  /**
   * Validate threshold value
   */
  const validateThreshold = useCallback(
    (value: number): { valid: boolean; error?: string } => {
      if (value < 5) {
        return { valid: false, error: 'Le seuil minimum est 5' };
      }

      if (value > 20) {
        return { valid: false, error: 'Le seuil maximum est 20' };
      }

      return { valid: true };
    },
    []
  );

  /**
   * Refresh all data
   */
  const refresh = useCallback(() => {
    fetchEliminatoryModules();
    fetchStatistics();
    fetchBlockedStudents();
  }, [fetchEliminatoryModules, fetchStatistics, fetchBlockedStudents]);

  // Fetch data when semester changes
  useEffect(() => {
    if (semesterId) {
      fetchEliminatoryModules();
      fetchStatistics();
      fetchBlockedStudents();
    } else {
      setEliminatoryModules([]);
      setBlockedStudents([]);
      setBlockedCount(0);
      setStatistics(null);
    }
  }, [semesterId, fetchEliminatoryModules, fetchStatistics, fetchBlockedStudents]);

  return {
    // Data
    eliminatoryModules,
    blockedStudents,
    blockedCount,
    statistics,

    // States
    loading,
    statsLoading,
    blockedLoading,
    saving,
    error,

    // Actions
    toggleModule,
    updateThreshold,
    validateThreshold,
    fetchBlockedStudents,
    refresh,
  };
};
