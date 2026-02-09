'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { teacherGradeService } from '../services/teacherGradeService';
import type {
  ModuleGrade,
  ModuleAveragesResponse,
  Evaluation,
  StudentGradeEntry,
} from '../../types/grade.types';

/**
 * Client-side module average calculation for real-time display
 */
export function calculateModuleAverageClientSide(
  studentId: number,
  evaluations: Evaluation[],
  currentEvaluationId: number,
  currentStudentEntries: StudentGradeEntry[],
  existingAverageData: ModuleGrade | undefined,
  currentEntry: StudentGradeEntry | undefined
): { average: number | null; isProvisional: boolean; missingCount: number; isAbs: boolean } {
  // If we don't have enough data, fall back to existing
  if (!currentEntry) {
    if (existingAverageData) {
      return {
        average: existingAverageData.average,
        isProvisional: !existingAverageData.is_final,
        missingCount: existingAverageData.missing_evaluations_count,
        isAbs: existingAverageData.status === 'ABS',
      };
    }
    return { average: null, isProvisional: true, missingCount: evaluations.length, isAbs: false };
  }

  // For real-time: we only know the current evaluation's grades
  // Use backend data for other evaluations via the existing average
  // This is a best-effort approximation
  if (existingAverageData) {
    return {
      average: existingAverageData.average,
      isProvisional: !existingAverageData.is_final,
      missingCount: existingAverageData.missing_evaluations_count,
      isAbs: existingAverageData.status === 'ABS',
    };
  }

  return { average: null, isProvisional: true, missingCount: evaluations.length, isAbs: false };
}

/**
 * Hook for managing module averages display
 */
export const useModuleAverages = (
  moduleId: number | null,
  semesterId: number | null,
  evaluations: Evaluation[]
) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [averagesResponse, setAveragesResponse] = useState<ModuleAveragesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch module averages from backend
   */
  const fetchAverages = useCallback(async () => {
    if (!moduleId) {
      setAveragesResponse(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await teacherGradeService.getModuleAverages(
        moduleId,
        semesterId ?? undefined,
        tenantId
      );
      setAveragesResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur chargement moyennes'));
      console.error('Error fetching module averages:', err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, semesterId, tenantId]);

  /**
   * Force recalculate and refetch
   */
  const recalculate = useCallback(async () => {
    if (!moduleId) return;

    try {
      setLoading(true);
      await teacherGradeService.recalculateModuleAverages(
        moduleId,
        semesterId ?? undefined,
        tenantId
      );
      await fetchAverages();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur recalcul'));
    } finally {
      setLoading(false);
    }
  }, [moduleId, semesterId, tenantId, fetchAverages]);

  /**
   * Map of student_id -> ModuleGrade for quick lookup
   */
  const averagesByStudent = useMemo(() => {
    const map = new Map<number, ModuleGrade>();
    if (averagesResponse?.averages) {
      for (const avg of averagesResponse.averages) {
        map.set(avg.student_id, avg);
      }
    }
    return map;
  }, [averagesResponse]);

  /**
   * Get formatted average for a student
   */
  const getStudentAverage = useCallback(
    (studentId: number): {
      average: number | null;
      status: string;
      isFinal: boolean;
      missingCount: number;
      rank: number | null;
      totalRanked: number | null;
    } => {
      const moduleGrade = averagesByStudent.get(studentId);
      if (!moduleGrade) {
        return {
          average: null,
          status: 'N/A',
          isFinal: false,
          missingCount: evaluations.length,
          rank: null,
          totalRanked: null,
        };
      }

      return {
        average: moduleGrade.average,
        status: moduleGrade.status,
        isFinal: moduleGrade.is_final,
        missingCount: moduleGrade.missing_evaluations_count,
        rank: moduleGrade.rank,
        totalRanked: moduleGrade.total_ranked,
      };
    },
    [averagesByStudent, evaluations.length]
  );

  // Fetch when module changes
  useEffect(() => {
    if (moduleId) {
      fetchAverages();
    } else {
      setAveragesResponse(null);
    }
  }, [moduleId, fetchAverages]);

  return {
    // Data
    averagesResponse,
    averagesByStudent,
    classAverage: averagesResponse?.class_average ?? null,
    passRate: averagesResponse?.pass_rate ?? null,
    totalStudents: averagesResponse?.total_students ?? 0,
    calculatedCount: averagesResponse?.calculated_count ?? 0,

    // State
    loading,
    error,

    // Actions
    fetchAverages,
    recalculate,
    getStudentAverage,
  };
};
