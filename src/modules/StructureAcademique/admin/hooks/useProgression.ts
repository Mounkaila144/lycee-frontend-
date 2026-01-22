'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { progressionService } from '../services/progressionService';
import type {
  ProgressionRule,
  ProgressionRuleFormData,
  EliminatoryModule,
  AddEliminatoryModuleRequest,
} from '../../types/progression.types';

export const useProgressionRules = () => {
  const { tenantId } = useTenant();
  const [rules, setRules] = useState<ProgressionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await progressionService.getProgressionRules(tenantId || undefined);
      setRules(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch progression rules'));
      console.error('Error fetching progression rules:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = useCallback(
    async (data: ProgressionRuleFormData): Promise<ProgressionRule> => {
      const newRule = await progressionService.createProgressionRule(data, tenantId || undefined);
      await fetchRules();
      return newRule;
    },
    [tenantId, fetchRules]
  );

  const updateRule = useCallback(
    async (id: number, data: Partial<ProgressionRuleFormData>): Promise<ProgressionRule> => {
      const updatedRule = await progressionService.updateProgressionRule(id, data, tenantId || undefined);
      await fetchRules();
      return updatedRule;
    },
    [tenantId, fetchRules]
  );

  const deleteRule = useCallback(
    async (id: number): Promise<void> => {
      await progressionService.deleteProgressionRule(id, tenantId || undefined);
      await fetchRules();
    },
    [tenantId, fetchRules]
  );

  return {
    rules,
    loading,
    error,
    refresh: fetchRules,
    createRule,
    updateRule,
    deleteRule,
  };
};

export const useEliminatoryModules = (programId: number) => {
  const { tenantId } = useTenant();
  const [modules, setModules] = useState<EliminatoryModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModules = useCallback(async () => {
    if (!programId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await progressionService.getEliminatoryModules(programId, tenantId || undefined);
      setModules(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch eliminatory modules'));
      console.error('Error fetching eliminatory modules:', err);
    } finally {
      setLoading(false);
    }
  }, [programId, tenantId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const addModule = useCallback(
    async (data: AddEliminatoryModuleRequest): Promise<EliminatoryModule> => {
      const newModule = await progressionService.addEliminatoryModule(programId, data, tenantId || undefined);
      await fetchModules();
      return newModule;
    },
    [programId, tenantId, fetchModules]
  );

  const removeModule = useCallback(
    async (moduleId: number): Promise<void> => {
      await progressionService.removeEliminatoryModule(programId, moduleId, tenantId || undefined);
      await fetchModules();
    },
    [programId, tenantId, fetchModules]
  );

  return {
    modules,
    loading,
    error,
    refresh: fetchModules,
    addModule,
    removeModule,
  };
};
