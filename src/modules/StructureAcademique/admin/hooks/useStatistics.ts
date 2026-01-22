/**
 * Hooks for Structure Académique Statistics
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { statisticsService } from '../services/statisticsService';
import type {
  GlobalStats,
  VolumeDistribution,
  ProgramVolumeStats,
  ProgramDetailStats,
  CreditsByLevel,
} from '../../types/statistics.types';

export const useGlobalStats = () => {
  const { tenantId } = useTenant();
  const [data, setData] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await statisticsService.getGlobalStats(
        tenantId || undefined
      );
      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch global stats';
      setError(errorMessage);
      console.error('Error fetching global stats:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useVolumeDistribution = () => {
  const { tenantId } = useTenant();
  const [data, setData] = useState<VolumeDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await statisticsService.getVolumeDistribution(
        tenantId || undefined
      );
      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch volume distribution';
      setError(errorMessage);
      console.error('Error fetching volume distribution:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useVolumesByProgram = () => {
  const { tenantId } = useTenant();
  const [data, setData] = useState<ProgramVolumeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await statisticsService.getVolumesByProgram(
        tenantId || undefined
      );
      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch volumes by program';
      setError(errorMessage);
      console.error('Error fetching volumes by program:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useProgramStats = (programId: number | null) => {
  const { tenantId } = useTenant();
  const [data, setData] = useState<ProgramDetailStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!programId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await statisticsService.getProgramStats(
        programId,
        tenantId || undefined
      );
      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch program stats';
      setError(errorMessage);
      console.error('Error fetching program stats:', err);
    } finally {
      setLoading(false);
    }
  }, [programId, tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useCreditsByLevel = () => {
  const { tenantId } = useTenant();
  const [data, setData] = useState<CreditsByLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await statisticsService.getCreditsByLevel(
        tenantId || undefined
      );
      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch credits by level';
      setError(errorMessage);
      console.error('Error fetching credits by level:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useStatsActions = () => {
  const { tenantId } = useTenant();
  const [isExporting, setIsExporting] = useState(false);
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportStats = async (): Promise<boolean> => {
    try {
      setIsExporting(true);
      setError(null);
      const blob = await statisticsService.exportStats(tenantId || undefined);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `statistiques_structure_${timestamp}.xlsx`;
      statisticsService.triggerDownload(blob, filename);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to export stats';
      setError(errorMessage);
      console.error('Error exporting stats:', err);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  const invalidateCache = async (): Promise<boolean> => {
    try {
      setIsInvalidating(true);
      setError(null);
      await statisticsService.invalidateCache(tenantId || undefined);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to invalidate cache';
      setError(errorMessage);
      console.error('Error invalidating cache:', err);
      return false;
    } finally {
      setIsInvalidating(false);
    }
  };

  return {
    exportStats,
    invalidateCache,
    isExporting,
    isInvalidating,
    error,
  };
};
