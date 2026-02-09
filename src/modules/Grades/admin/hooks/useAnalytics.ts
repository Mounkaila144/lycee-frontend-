'use client';

/**
 * Analytics Hook
 * Manages state for performance analytics dashboard
 */

import { useState, useCallback, useEffect } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { analyticsService } from '../services/analyticsService';

import type {
  AnalyticsKPIs,
  WeakModule,
  CohortAnalysis,
  AtRiskStudent,
  CorrelationEntry,
  HistoricalComparison,
} from '../../types/analytics.types';

export const useAnalytics = (semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [weakModules, setWeakModules] = useState<WeakModule[]>([]);
  const [cohortAnalysis, setCohortAnalysis] = useState<CohortAnalysis | null>(null);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationEntry[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchAll = useCallback(async () => {
    if (!semesterId) return;

    setLoading(true);

    try {
      const [kpiData, weakData, cohortData, riskData, corrData, histData] = await Promise.all([
        analyticsService.getKPIs(semesterId, tenantId),
        analyticsService.getWeakModules(semesterId, tenantId),
        analyticsService.getCohortAnalysis(semesterId, tenantId),
        analyticsService.getAtRiskStudents(semesterId, 70, tenantId),
        analyticsService.getCorrelationMatrix(semesterId, tenantId),
        analyticsService.getHistoricalComparison(undefined, tenantId),
      ]);

      setKpis(kpiData);
      setWeakModules(weakData);
      setCohortAnalysis(cohortData);
      setAtRiskStudents(riskData);
      setCorrelations(corrData);
      setHistoricalData(histData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [semesterId, tenantId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const exportReport = useCallback(async (format: 'excel' | 'pdf' | 'csv' = 'excel') => {
    if (!semesterId) return;

    setExporting(true);

    try {
      const blob = await analyticsService.exportReport(semesterId, format, tenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = format === 'excel' ? 'xlsx' : format;

      a.href = url;
      a.download = `analytics-S${semesterId}.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting analytics:', err);
    } finally {
      setExporting(false);
    }
  }, [semesterId, tenantId]);

  return {
    kpis,
    weakModules,
    cohortAnalysis,
    atRiskStudents,
    correlations,
    historicalData,
    loading,
    exporting,
    activeTab,
    setActiveTab,
    refresh: fetchAll,
    exportReport,
  };
};
