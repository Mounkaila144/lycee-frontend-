'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { modulePrerequisiteService } from '../services/modulePrerequisiteService';
import type {
  ModulePrerequisite,
  AddPrerequisiteRequest,
  DependencyGraph,
} from '../../types/modulePrerequisite.types';

export const useModulePrerequisites = (moduleId: number) => {
  const { tenantId } = useTenant();
  const [prerequisites, setPrerequisites] = useState<ModulePrerequisite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrerequisites = useCallback(async () => {
    if (!moduleId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await modulePrerequisiteService.getPrerequisites(moduleId, tenantId || undefined);
      setPrerequisites(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch prerequisites'));
      console.error('Error fetching prerequisites:', err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, tenantId]);

  useEffect(() => {
    fetchPrerequisites();
  }, [fetchPrerequisites]);

  const addPrerequisite = useCallback(
    async (data: AddPrerequisiteRequest): Promise<ModulePrerequisite> => {
      const newPrerequisite = await modulePrerequisiteService.addPrerequisite(
        moduleId,
        data,
        tenantId || undefined
      );
      await fetchPrerequisites();
      return newPrerequisite;
    },
    [moduleId, tenantId, fetchPrerequisites]
  );

  const removePrerequisite = useCallback(
    async (prerequisiteId: number): Promise<void> => {
      await modulePrerequisiteService.removePrerequisite(moduleId, prerequisiteId, tenantId || undefined);
      await fetchPrerequisites();
    },
    [moduleId, tenantId, fetchPrerequisites]
  );

  return {
    prerequisites,
    loading,
    error,
    refresh: fetchPrerequisites,
    addPrerequisite,
    removePrerequisite,
  };
};

export const useModuleDependencyGraph = (moduleId: number) => {
  const { tenantId } = useTenant();
  const [dependencyGraph, setDependencyGraph] = useState<DependencyGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDependencyGraph = useCallback(async () => {
    if (!moduleId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await modulePrerequisiteService.getDependencyGraph(moduleId, tenantId || undefined);
      setDependencyGraph(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dependency graph'));
      console.error('Error fetching dependency graph:', err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, tenantId]);

  useEffect(() => {
    fetchDependencyGraph();
  }, [fetchDependencyGraph]);

  return {
    dependencyGraph,
    loading,
    error,
    refresh: fetchDependencyGraph,
  };
};
