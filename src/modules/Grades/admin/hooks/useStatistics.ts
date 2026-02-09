'use client';

/**
 * Statistics Hook
 * Manages state for success rate statistics dashboard
 */

import { useState, useCallback, useEffect } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { statisticsService } from '../services/statisticsService';

import type {
  GlobalStatistics,
  ModuleStatistic,
  ProgramComparison,
  StatisticsDistribution,
  SemesterEvolution,
  StatisticsFilters,
} from '../../types/statistics.types';

export const useStatistics = (semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [globalStats, setGlobalStats] = useState<GlobalStatistics | null>(null);
  const [moduleStats, setModuleStats] = useState<ModuleStatistic[]>([]);
  const [programComparison, setProgramComparison] = useState<ProgramComparison[]>([]);
  const [distribution, setDistribution] = useState<StatisticsDistribution | null>(null);
  const [evolution, setEvolution] = useState<SemesterEvolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<StatisticsFilters>({});

  const fetchAll = useCallback(async () => {
    if (!semesterId) return;

    setLoading(true);

    try {
      const [global, modules, programs, dist, evo] = await Promise.all([
        statisticsService.getGlobalStatistics(semesterId, filters, tenantId),
        statisticsService.getModuleStatistics(semesterId, tenantId),
        statisticsService.getProgramComparison(semesterId, tenantId),
        statisticsService.getDistribution(semesterId, tenantId),
        statisticsService.getSemesterEvolution(tenantId),
      ]);

      setGlobalStats(global);
      setModuleStats(modules);
      setProgramComparison(programs);
      setDistribution(dist);
      setEvolution(evo);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [semesterId, filters, tenantId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const exportExcel = useCallback(async () => {
    if (!semesterId) return;

    setExporting(true);

    try {
      const blob = await statisticsService.exportExcel(semesterId, tenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `statistiques-reussite-S${semesterId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting statistics:', err);
    } finally {
      setExporting(false);
    }
  }, [semesterId, tenantId]);

  return {
    globalStats,
    moduleStats,
    programComparison,
    distribution,
    evolution,
    loading,
    exporting,
    filters,
    setFilters,
    refresh: fetchAll,
    exportExcel,
  };
};
