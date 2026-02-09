'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { semesterResultService } from '../services/semesterResultService';

import type { SemesterResult } from '../../types/grade.types';
import type { SemesterStatistics, SemesterResultFilters } from '../services/semesterResultService';

/**
 * Custom hook for semester results management
 */
export const useSemesterResults = (semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  // State
  const [results, setResults] = useState<SemesterResult[]>([]);
  const [statistics, setStatistics] = useState<SemesterStatistics | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [filters, setFilters] = useState<SemesterResultFilters>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch semester results
   */
  const fetchResults = useCallback(async () => {
    if (!semesterId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await semesterResultService.getSemesterResults(
        semesterId,
        filters,
        1,
        999,
        tenantId
      );

      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch semester results'));
      console.error('Error fetching semester results:', err);
    } finally {
      setLoading(false);
    }
  }, [semesterId, filters, tenantId]);

  /**
   * Fetch statistics
   */
  const fetchStatistics = useCallback(async () => {
    if (!semesterId) return;

    try {
      setStatsLoading(true);
      const data = await semesterResultService.getStatistics(semesterId, tenantId);

      setStatistics(data);
    } catch (err) {
      console.error('Error fetching semester statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [semesterId, tenantId]);

  /**
   * Recalculate semester averages
   */
  const recalculate = useCallback(async (): Promise<boolean> => {
    if (!semesterId) return false;

    try {
      setRecalculating(true);
      setError(null);
      await semesterResultService.recalculate(semesterId, tenantId);

      // Refresh data after recalculation
      await Promise.all([fetchResults(), fetchStatistics()]);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to recalculate'));
      console.error('Error recalculating:', err);

      return false;
    } finally {
      setRecalculating(false);
    }
  }, [semesterId, tenantId, fetchResults, fetchStatistics]);

  /**
   * Publish semester results
   */
  const publish = useCallback(async (): Promise<boolean> => {
    if (!semesterId) return false;

    try {
      setPublishing(true);
      setError(null);
      await semesterResultService.publish(semesterId, tenantId);

      // Refresh data after publication
      await Promise.all([fetchResults(), fetchStatistics()]);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish results'));
      console.error('Error publishing:', err);

      return false;
    } finally {
      setPublishing(false);
    }
  }, [semesterId, tenantId, fetchResults, fetchStatistics]);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: SemesterResultFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(() => {
    fetchResults();
    fetchStatistics();
  }, [fetchResults, fetchStatistics]);

  // Fetch data when semester changes
  useEffect(() => {
    if (semesterId) {
      fetchResults();
      fetchStatistics();
    } else {
      setResults([]);
      setStatistics(null);
      setTotal(0);
    }
  }, [semesterId, fetchResults, fetchStatistics]);

  return {
    // Data
    results,
    statistics,
    total,
    filters,

    // States
    loading,
    statsLoading,
    recalculating,
    publishing,
    error,

    // Actions
    updateFilters,
    recalculate,
    publish,
    refresh,
  };
};
