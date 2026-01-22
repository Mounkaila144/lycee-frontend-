'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { moduleService } from '../services/moduleService';
import type {
  Module,
  ModuleQueryParams,
  ModuleFormData,
  PaginationMeta,
} from '../../types/module.types';

export const useModules = (initialParams: ModuleQueryParams = {}) => {
  const { tenantId } = useTenant();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [params, setParams] = useState<ModuleQueryParams>(initialParams);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await moduleService.getModules(params, tenantId || undefined);
      setModules(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch modules'));
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  }, [params, tenantId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((perPage: number) => {
    setParams((prev) => ({ ...prev, per_page: perPage, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setFilters = useCallback((filters: Partial<ModuleQueryParams>) => {
    setParams((prev) => ({ ...prev, ...filters, page: 1 }));
  }, []);

  const createModule = useCallback(
    async (data: ModuleFormData): Promise<Module> => {
      const newModule = await moduleService.createModule(data, tenantId || undefined);
      await fetchModules();
      return newModule;
    },
    [tenantId, fetchModules]
  );

  const updateModule = useCallback(
    async (id: number, data: Partial<ModuleFormData>): Promise<Module> => {
      const updatedModule = await moduleService.updateModule(id, data, tenantId || undefined);
      await fetchModules();
      return updatedModule;
    },
    [tenantId, fetchModules]
  );

  const deleteModule = useCallback(
    async (id: number): Promise<void> => {
      await moduleService.deleteModule(id, tenantId || undefined);
      await fetchModules();
    },
    [tenantId, fetchModules]
  );

  return {
    modules,
    loading,
    error,
    pagination,
    params,
    setPage,
    setPageSize,
    setSearch,
    setFilters,
    refresh: fetchModules,
    createModule,
    updateModule,
    deleteModule,
  };
};
