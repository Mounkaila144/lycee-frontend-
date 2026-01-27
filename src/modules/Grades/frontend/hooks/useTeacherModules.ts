'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { teacherGradeService } from '../services/teacherGradeService';
import type { TeacherModule, Evaluation } from '../../types/grade.types';

/**
 * Custom hook for managing teacher's assigned modules and evaluations
 */
export const useTeacherModules = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [modules, setModules] = useState<TeacherModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<TeacherModule | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluationsLoading, setEvaluationsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch teacher's modules
   */
  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherGradeService.getMyModules(tenantId);
      setModules(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch modules'));
      console.error('Error fetching teacher modules:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  /**
   * Fetch evaluations for selected module
   */
  const fetchEvaluations = useCallback(
    async (moduleId: number) => {
      try {
        setEvaluationsLoading(true);
        setError(null);
        const data = await teacherGradeService.getModuleEvaluations(moduleId, tenantId);
        setEvaluations(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch evaluations'));
        console.error('Error fetching evaluations:', err);
      } finally {
        setEvaluationsLoading(false);
      }
    },
    [tenantId]
  );

  /**
   * Select a module and fetch its evaluations
   */
  const selectModule = useCallback(
    async (module: TeacherModule | null) => {
      setSelectedModule(module);
      setSelectedEvaluation(null);
      setEvaluations([]);

      if (module) {
        await fetchEvaluations(module.id);
      }
    },
    [fetchEvaluations]
  );

  /**
   * Select an evaluation
   */
  const selectEvaluation = useCallback((evaluation: Evaluation | null) => {
    setSelectedEvaluation(evaluation);
  }, []);

  /**
   * Refresh modules list
   */
  const refresh = useCallback(() => {
    fetchModules();
  }, [fetchModules]);

  /**
   * Refresh evaluations for current module
   */
  const refreshEvaluations = useCallback(() => {
    if (selectedModule) {
      fetchEvaluations(selectedModule.id);
    }
  }, [selectedModule, fetchEvaluations]);

  // Fetch modules on mount
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return {
    // Data
    modules,
    selectedModule,
    evaluations,
    selectedEvaluation,

    // Loading states
    loading,
    evaluationsLoading,
    error,

    // Actions
    selectModule,
    selectEvaluation,
    refresh,
    refreshEvaluations,
  };
};
