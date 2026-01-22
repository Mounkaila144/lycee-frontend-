/**
 * Hook pour gérer les modules d'un programme
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { programmeModuleService } from '../services/programmeModuleService';
import type { Module } from '../../types/module.types';
import type { AssociateModulesData } from '../../types/programmeModule.types';

interface UseProgrammeModulesOptions {
  programmeId?: number;
  autoFetch?: boolean;
}

export const useProgrammeModules = (options: UseProgrammeModulesOptions = {}) => {
  const { programmeId, autoFetch = true } = options;
  const { tenantId } = useTenant();

  const [modules, setModules] = useState<Module[]>([]);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charger les modules associés au programme
   */
  const fetchModules = useCallback(async () => {
    if (!programmeId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await programmeModuleService.getModules(
        programmeId,
        tenantId || undefined
      );
      setModules(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des modules';
      setError(message);
      console.error('Failed to fetch programme modules:', err);
    } finally {
      setLoading(false);
    }
  }, [programmeId, tenantId]);

  /**
   * Charger tous les modules disponibles
   */
  const fetchAvailableModules = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      const data = await programmeModuleService.getAvailableModules(tenantId || undefined);
      setAvailableModules(data);
    } catch (err) {
      console.error('Failed to fetch available modules:', err);
    } finally {
      setLoadingAvailable(false);
    }
  }, [tenantId]);

  /**
   * Associer des modules au programme
   */
  const associateModules = useCallback(
    async (data: AssociateModulesData) => {
      if (!programmeId) {
        throw new Error('Programme ID is required');
      }

      try {
        setLoading(true);
        setError(null);
        const updatedModules = await programmeModuleService.associateModules(
          programmeId,
          data,
          tenantId || undefined
        );
        setModules(updatedModules);
        return updatedModules;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de l\'association';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [programmeId, tenantId]
  );

  /**
   * Dissocier un module du programme
   */
  const removeModule = useCallback(
    async (moduleId: number) => {
      if (!programmeId) {
        throw new Error('Programme ID is required');
      }

      try {
        setLoading(true);
        setError(null);
        await programmeModuleService.removeModule(
          programmeId,
          moduleId,
          tenantId || undefined
        );
        // Refresh modules list
        await fetchModules();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la dissociation';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [programmeId, tenantId, fetchModules]
  );

  /**
   * Auto-fetch on mount if programmeId is provided
   */
  useEffect(() => {
    if (autoFetch && programmeId) {
      fetchModules();
    }
  }, [autoFetch, programmeId, fetchModules]);

  return {
    modules,
    availableModules,
    loading,
    loadingAvailable,
    error,
    fetchModules,
    fetchAvailableModules,
    associateModules,
    removeModule,
    refresh: fetchModules,
  };
};
