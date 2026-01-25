'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { enrollmentStatisticsService } from '../services/enrollmentStatisticsService';
import type {
  EnrollmentKPIs,
  ProgramStats,
  TrendDataPoint,
  MonthlyTrend,
  DemographicAnalysis,
  EnrollmentAlert,
  ReportGenerationRequest,
  ExcelExportFilters,
} from '../../types/statistics.types';

/**
 * Hook for fetching enrollment KPIs
 */
export const useEnrollmentKPIs = (academicYearId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [kpis, setKpis] = useState<EnrollmentKPIs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  const fetchKPIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentStatisticsService.getKPIs(tenantId, academicYearId);
      setKpis(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch KPIs'));
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, academicYearId]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchKPIs();
    }
  }, []);

  // Reset ref when dependencies change
  useEffect(() => {
    fetchedRef.current = false;
  }, [tenantId, academicYearId]);

  return { kpis, loading, error, refresh: fetchKPIs };
};

/**
 * Hook for fetching program statistics
 */
export const useProgramStats = (academicYearId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [programStats, setProgramStats] = useState<ProgramStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  const fetchProgramStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = academicYearId ? { academic_year_id: academicYearId } : undefined;
      const data = await enrollmentStatisticsService.getByProgram(tenantId, filters);
      setProgramStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch program stats'));
      console.error('Error fetching program stats:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, academicYearId]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchProgramStats();
    }
  }, []);

  useEffect(() => {
    fetchedRef.current = false;
  }, [tenantId, academicYearId]);

  return { programStats, loading, error, refresh: fetchProgramStats };
};

/**
 * Hook for fetching enrollment trends
 */
export const useEnrollmentTrends = (programId?: number, years: number = 5) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentStatisticsService.getTrends(tenantId, programId, years);
      setTrends(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch trends'));
      console.error('Error fetching trends:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, programId, years]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchTrends();
    }
  }, []);

  useEffect(() => {
    fetchedRef.current = false;
  }, [tenantId, programId, years]);

  return { trends, loading, error, refresh: fetchTrends };
};

/**
 * Hook for fetching monthly trends
 */
export const useMonthlyTrends = (academicYearId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  const fetchMonthlyTrends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentStatisticsService.getMonthlyTrends(tenantId, academicYearId);
      setMonthlyTrends(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch monthly trends'));
      console.error('Error fetching monthly trends:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, academicYearId]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchMonthlyTrends();
    }
  }, []);

  useEffect(() => {
    fetchedRef.current = false;
  }, [tenantId, academicYearId]);

  return { monthlyTrends, loading, error, refresh: fetchMonthlyTrends };
};

/**
 * Hook for fetching demographic analysis
 */
export const useDemographics = (academicYearId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [demographics, setDemographics] = useState<DemographicAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  const fetchDemographics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentStatisticsService.getDemographics(tenantId, academicYearId);
      setDemographics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch demographics'));
      console.error('Error fetching demographics:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, academicYearId]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchDemographics();
    }
  }, []);

  useEffect(() => {
    fetchedRef.current = false;
  }, [tenantId, academicYearId]);

  return { demographics, loading, error, refresh: fetchDemographics };
};

/**
 * Hook for fetching alerts
 */
export const useEnrollmentAlerts = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [alerts, setAlerts] = useState<EnrollmentAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentStatisticsService.getAlerts(tenantId);
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch alerts'));
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchAlerts();
    }
  }, []);

  useEffect(() => {
    fetchedRef.current = false;
  }, [tenantId]);

  return { alerts, loading, error, refresh: fetchAlerts };
};

/**
 * Hook for report generation and export
 */
export const useEnrollmentReports = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [generating, setGenerating] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const generateExecutiveSummary = useCallback(
    async (request?: ReportGenerationRequest) => {
      try {
        setGenerating(true);
        setError(null);
        const response = await enrollmentStatisticsService.generateExecutiveSummary(
          tenantId,
          request
        );

        const blob = await enrollmentStatisticsService.downloadReport(response.path, tenantId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename || 'rapport_executif.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return response;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to generate report'));
        throw err;
      } finally {
        setGenerating(false);
      }
    },
    [tenantId]
  );

  const generateDashboard = useCallback(
    async (request?: ReportGenerationRequest) => {
      try {
        setGenerating(true);
        setError(null);
        const response = await enrollmentStatisticsService.generateDashboard(
          tenantId,
          request
        );

        const blob = await enrollmentStatisticsService.downloadReport(response.path, tenantId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename || 'tableau_de_bord.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return response;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to generate dashboard'));
        throw err;
      } finally {
        setGenerating(false);
      }
    },
    [tenantId]
  );

  const exportToExcel = useCallback(
    async (filters?: ExcelExportFilters) => {
      try {
        setExporting(true);
        setError(null);
        const blob = await enrollmentStatisticsService.exportToExcel(tenantId, filters);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inscriptions_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to export to Excel'));
        throw err;
      } finally {
        setExporting(false);
      }
    },
    [tenantId]
  );

  const clearCache = useCallback(async () => {
    try {
      await enrollmentStatisticsService.clearCache(tenantId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clear cache'));
      throw err;
    }
  }, [tenantId]);

  return {
    generating,
    exporting,
    error,
    generateExecutiveSummary,
    generateDashboard,
    exportToExcel,
    clearCache,
  };
};

/**
 * Combined hook for all enrollment statistics
 * Fetches all data once on mount and provides refresh functions
 */
export const useEnrollmentStatistics = (academicYearId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  // State for all data
  const [kpis, setKpis] = useState<EnrollmentKPIs | null>(null);
  const [programStats, setProgramStats] = useState<ProgramStats[]>([]);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [demographics, setDemographics] = useState<DemographicAnalysis | null>(null);
  const [alerts, setAlerts] = useState<EnrollmentAlert[]>([]);

  // Loading states
  const [kpisLoading, setKpisLoading] = useState(true);
  const [programStatsLoading, setProgramStatsLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [monthlyTrendsLoading, setMonthlyTrendsLoading] = useState(true);
  const [demographicsLoading, setDemographicsLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // Report states
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track if initial fetch happened
  const initialFetchDone = useRef(false);

  // Fetch functions
  const fetchKpis = useCallback(async () => {
    try {
      setKpisLoading(true);
      const data = await enrollmentStatisticsService.getKPIs(tenantId, academicYearId);
      setKpis(data);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
    } finally {
      setKpisLoading(false);
    }
  }, [tenantId, academicYearId]);

  const fetchProgramStats = useCallback(async () => {
    try {
      setProgramStatsLoading(true);
      const filters = academicYearId ? { academic_year_id: academicYearId } : undefined;
      const data = await enrollmentStatisticsService.getByProgram(tenantId, filters);
      setProgramStats(data);
    } catch (err) {
      console.error('Error fetching program stats:', err);
    } finally {
      setProgramStatsLoading(false);
    }
  }, [tenantId, academicYearId]);

  const fetchTrends = useCallback(async () => {
    try {
      setTrendsLoading(true);
      const data = await enrollmentStatisticsService.getTrends(tenantId, undefined, 5);
      setTrends(data);
    } catch (err) {
      console.error('Error fetching trends:', err);
    } finally {
      setTrendsLoading(false);
    }
  }, [tenantId]);

  const fetchMonthlyTrends = useCallback(async () => {
    try {
      setMonthlyTrendsLoading(true);
      const data = await enrollmentStatisticsService.getMonthlyTrends(tenantId, academicYearId);
      setMonthlyTrends(data);
    } catch (err) {
      console.error('Error fetching monthly trends:', err);
    } finally {
      setMonthlyTrendsLoading(false);
    }
  }, [tenantId, academicYearId]);

  const fetchDemographics = useCallback(async () => {
    try {
      setDemographicsLoading(true);
      const data = await enrollmentStatisticsService.getDemographics(tenantId, academicYearId);
      setDemographics(data);
    } catch (err) {
      console.error('Error fetching demographics:', err);
    } finally {
      setDemographicsLoading(false);
    }
  }, [tenantId, academicYearId]);

  const fetchAlerts = useCallback(async () => {
    try {
      setAlertsLoading(true);
      const data = await enrollmentStatisticsService.getAlerts(tenantId);
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setAlertsLoading(false);
    }
  }, [tenantId]);

  // Initial fetch - only runs once
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchKpis();
      fetchProgramStats();
      fetchTrends();
      fetchMonthlyTrends();
      fetchDemographics();
      fetchAlerts();
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(() => {
    fetchKpis();
    fetchProgramStats();
    fetchTrends();
    fetchMonthlyTrends();
    fetchDemographics();
    fetchAlerts();
  }, [fetchKpis, fetchProgramStats, fetchTrends, fetchMonthlyTrends, fetchDemographics, fetchAlerts]);

  // Report functions
  const generateExecutiveSummary = useCallback(
    async (request?: ReportGenerationRequest) => {
      try {
        setGenerating(true);
        setError(null);
        const response = await enrollmentStatisticsService.generateExecutiveSummary(tenantId, request);
        const blob = await enrollmentStatisticsService.downloadReport(response.path, tenantId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename || 'rapport_executif.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to generate report'));
        throw err;
      } finally {
        setGenerating(false);
      }
    },
    [tenantId]
  );

  const generateDashboard = useCallback(
    async (request?: ReportGenerationRequest) => {
      try {
        setGenerating(true);
        setError(null);
        const response = await enrollmentStatisticsService.generateDashboard(tenantId, request);
        const blob = await enrollmentStatisticsService.downloadReport(response.path, tenantId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename || 'tableau_de_bord.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to generate dashboard'));
        throw err;
      } finally {
        setGenerating(false);
      }
    },
    [tenantId]
  );

  const exportToExcel = useCallback(
    async (filters?: ExcelExportFilters) => {
      try {
        setExporting(true);
        setError(null);
        const blob = await enrollmentStatisticsService.exportToExcel(tenantId, filters);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inscriptions_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to export to Excel'));
        throw err;
      } finally {
        setExporting(false);
      }
    },
    [tenantId]
  );

  const clearCache = useCallback(async () => {
    try {
      await enrollmentStatisticsService.clearCache(tenantId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clear cache'));
      throw err;
    }
  }, [tenantId]);

  const loading = kpisLoading || programStatsLoading || trendsLoading ||
    monthlyTrendsLoading || demographicsLoading || alertsLoading;

  return {
    // Data
    kpis,
    programStats,
    trends,
    monthlyTrends,
    demographics,
    alerts,
    // Loading states
    loading,
    kpisLoading,
    programStatsLoading,
    trendsLoading,
    monthlyTrendsLoading,
    demographicsLoading,
    alertsLoading,
    // Actions
    refreshAll,
    // Report states
    generating,
    exporting,
    error,
    // Report actions
    generateExecutiveSummary,
    generateDashboard,
    exportToExcel,
    clearCache,
  };
};
