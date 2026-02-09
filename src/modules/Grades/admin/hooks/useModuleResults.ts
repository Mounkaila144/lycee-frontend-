'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { moduleResultService } from '../services/moduleResultService';

import type { ModuleStudentResult, ModuleResultStatistics, ModuleResultFilters } from '../../types/moduleResult.types';

/**
 * Custom hook for module results management
 */
export const useModuleResults = (moduleId: number | null, semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [results, setResults] = useState<ModuleStudentResult[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [filters, setFilters] = useState<ModuleResultFilters>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Fetch module results
   */
  const fetchResults = useCallback(async () => {
    if (!moduleId || !semesterId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await moduleResultService.getResults(moduleId, semesterId, filters, tenantId);

      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch module results'));
      console.error('Error fetching module results:', err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, semesterId, filters, tenantId]);

  /**
   * Generate module results
   */
  const generate = useCallback(async (): Promise<boolean> => {
    if (!moduleId || !semesterId) return false;

    try {
      setGenerating(true);
      setError(null);
      const result = await moduleResultService.generate(moduleId, semesterId, tenantId);

      setSuccessMessage(result.message || `${result.count} résultats générés`);
      await fetchResults();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate results'));
      console.error('Error generating results:', err);

      return false;
    } finally {
      setGenerating(false);
    }
  }, [moduleId, semesterId, tenantId, fetchResults]);

  /**
   * Publish module results
   */
  const publish = useCallback(async (): Promise<boolean> => {
    if (!moduleId || !semesterId) return false;

    try {
      setPublishing(true);
      setError(null);
      const result = await moduleResultService.publish(moduleId, semesterId, tenantId);

      setSuccessMessage(result.message || `${result.published_count} résultats publiés`);
      await fetchResults();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish results'));
      console.error('Error publishing results:', err);

      return false;
    } finally {
      setPublishing(false);
    }
  }, [moduleId, semesterId, tenantId, fetchResults]);

  /**
   * Export module results
   */
  const exportResults = useCallback(async (format: 'xlsx' | 'csv' = 'xlsx') => {
    if (!moduleId || !semesterId) return;

    try {
      const blob = await moduleResultService.exportResults(moduleId, semesterId, format, tenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `resultats-module-${moduleId}-semestre-${semesterId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to export results'));
      console.error('Error exporting results:', err);
    }
  }, [moduleId, semesterId, tenantId]);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: ModuleResultFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Dismiss messages
   */
  const dismissMessage = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  // Fetch data when module/semester changes
  useEffect(() => {
    if (moduleId && semesterId) {
      fetchResults();
    } else {
      setResults([]);
      setTotal(0);
    }
  }, [moduleId, semesterId, fetchResults]);

  // Compute statistics from results
  const statistics: ModuleResultStatistics | null = results.length > 0 ? (() => {
    const averages = results.filter(r => r.average !== null).map(r => r.average as number);
    const statusDist = { validated: 0, compensated: 0, failed: 0, absent: 0, pending: 0 };
    const mentionDist = { 'Très Bien': 0, 'Bien': 0, 'Assez Bien': 0, 'Passable': 0, 'Non admis': 0 };

    results.forEach(r => {
      if (r.status in statusDist) statusDist[r.status as keyof typeof statusDist]++;
      if (r.mention && r.mention in mentionDist) mentionDist[r.mention as keyof typeof mentionDist]++;
    });

    return {
      total_students: results.length,
      calculated_count: results.filter(r => r.calculated_at).length,
      published_count: results.filter(r => r.is_published).length,
      class_average: averages.length > 0 ? averages.reduce((a, b) => a + b, 0) / averages.length : null,
      min_average: averages.length > 0 ? Math.min(...averages) : null,
      max_average: averages.length > 0 ? Math.max(...averages) : null,
      pass_rate: averages.length > 0 ? (averages.filter(a => a >= 10).length / averages.length) * 100 : null,
      status_distribution: statusDist,
      mention_distribution: mentionDist,
    };
  })() : null;

  return {
    results,
    statistics,
    total,
    filters,
    loading,
    generating,
    publishing,
    error,
    successMessage,
    updateFilters,
    generate,
    publish,
    exportResults,
    dismissMessage,
    refresh: fetchResults,
  };
};
