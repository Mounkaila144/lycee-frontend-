'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { adminEctsService } from '../services/adminEctsService';
import { semesterResultService } from '../services/semesterResultService';

import type { SemesterResult } from '../../types/grade.types';
import type {
  EctsSemesterStatistics,
  EctsStudentSummary,
  EctsAllocationItem,
} from '../services/adminEctsService';

/**
 * Custom hook for ECTS credits management
 */
export const useEctsManagement = (semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  // State
  const [results, setResults] = useState<SemesterResult[]>([]);
  const [ectsStatistics, setEctsStatistics] = useState<EctsSemesterStatistics | null>(null);
  const [studentSummary, setStudentSummary] = useState<EctsStudentSummary | null>(null);
  const [studentAllocations, setStudentAllocations] = useState<EctsAllocationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [studentLoading, setStudentLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch semester results with credits data
   */
  const fetchResults = useCallback(async () => {
    if (!semesterId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await semesterResultService.getSemesterResults(
        semesterId,
        {},
        1,
        999,
        tenantId
      );

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch results'));
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  }, [semesterId, tenantId]);

  /**
   * Fetch ECTS statistics for semester
   */
  const fetchEctsStatistics = useCallback(async () => {
    if (!semesterId) return;

    try {
      setStatsLoading(true);
      const data = await adminEctsService.getSemesterStatistics(semesterId, tenantId);

      setEctsStatistics(data);
    } catch (err) {
      console.error('Error fetching ECTS statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [semesterId, tenantId]);

  /**
   * Fetch student ECTS summary
   */
  const fetchStudentSummary = useCallback(
    async (studentId: number) => {
      try {
        setStudentLoading(true);
        const [summary, allocations] = await Promise.all([
          adminEctsService.getStudentSummary(studentId, tenantId),
          semesterId
            ? adminEctsService.getSemesterAllocations(studentId, semesterId, tenantId)
            : Promise.resolve([]),
        ]);

        setStudentSummary(summary);
        setStudentAllocations(allocations);
      } catch (err) {
        console.error('Error fetching student ECTS summary:', err);
      } finally {
        setStudentLoading(false);
      }
    },
    [semesterId, tenantId]
  );

  /**
   * Clear student detail view
   */
  const clearStudentDetail = useCallback(() => {
    setStudentSummary(null);
    setStudentAllocations([]);
  }, []);

  /**
   * Allocate equivalence credits
   */
  const allocateEquivalence = useCallback(
    async (studentId: number, moduleId: number, credits: number, note?: string): Promise<boolean> => {
      try {
        setSaving(true);
        setError(null);
        await adminEctsService.allocateEquivalence(studentId, moduleId, credits, note, tenantId);

        // Refresh data
        await Promise.all([fetchResults(), fetchEctsStatistics()]);
        if (studentSummary) {
          await fetchStudentSummary(studentId);
        }

        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to allocate equivalence'));
        console.error('Error allocating equivalence:', err);

        return false;
      } finally {
        setSaving(false);
      }
    },
    [tenantId, fetchResults, fetchEctsStatistics, studentSummary, fetchStudentSummary]
  );

  /**
   * Refresh all data
   */
  const refresh = useCallback(() => {
    fetchResults();
    fetchEctsStatistics();
  }, [fetchResults, fetchEctsStatistics]);

  // Fetch data when semester changes
  useEffect(() => {
    if (semesterId) {
      fetchResults();
      fetchEctsStatistics();
    } else {
      setResults([]);
      setEctsStatistics(null);
      setStudentSummary(null);
      setStudentAllocations([]);
    }
  }, [semesterId, fetchResults, fetchEctsStatistics]);

  return {
    // Data
    results,
    ectsStatistics,
    studentSummary,
    studentAllocations,

    // States
    loading,
    statsLoading,
    studentLoading,
    saving,
    error,

    // Actions
    fetchStudentSummary,
    clearStudentDetail,
    allocateEquivalence,
    refresh,
  };
};
