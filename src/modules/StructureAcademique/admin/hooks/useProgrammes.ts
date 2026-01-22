'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { programmeService } from '../services/programmeService';
import type {
  Programme,
  ProgrammeQueryParams,
  PaginationMeta,
  ProgrammeFormData,
  ChangeStatusData
} from '../../types/programme.types';

/**
 * Custom hook for managing programmes with server-side pagination
 * Provides state management and data fetching for the programme list
 */
export const useProgrammes = (initialParams?: ProgrammeQueryParams) => {
  const { tenantId } = useTenant();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    from: null,
    last_page: 1,
    links: [],
    path: '',
    per_page: 10,
    to: null,
    total: 0
  });
  const [params, setParams] = useState<ProgrammeQueryParams>(
    initialParams || { page: 1, per_page: 10 }
  );

  /**
   * Fetch programmes from the API with pagination
   */
  const fetchProgrammes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await programmeService.getProgrammes(tenantId, params);

      setProgrammes(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch programmes'));
      console.error('Error fetching programmes:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, params]);

  /**
   * Refresh the programme list
   */
  const refresh = useCallback(() => {
    fetchProgrammes();
  }, [fetchProgrammes]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<ProgrammeQueryParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  /**
   * Change page
   */
  const setPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  /**
   * Change page size
   */
  const setPageSize = useCallback((pageSize: number) => {
    setParams(prev => ({ ...prev, per_page: pageSize, page: 1 }));
  }, []);

  /**
   * Update search query
   */
  const setSearch = useCallback((search: string) => {
    setParams(prev => ({
      ...prev,
      page: 1, // Reset to first page on search
      search: search || undefined
    }));
  }, []);

  /**
   * Create a new programme
   */
  const createProgramme = useCallback(
    async (data: ProgrammeFormData) => {
      try {
        setLoading(true);
        setError(null);
        const newProgramme = await programmeService.createProgramme(data, tenantId);
        // Refresh the list after creation
        await fetchProgrammes();
        return newProgramme;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create programme'));
        console.error('Error creating programme:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchProgrammes]
  );

  /**
   * Update an existing programme
   */
  const updateProgramme = useCallback(
    async (programmeId: number, data: Partial<ProgrammeFormData>) => {
      try {
        setLoading(true);
        setError(null);
        const updatedProgramme = await programmeService.updateProgramme(programmeId, data, tenantId);
        // Refresh the list after update
        await fetchProgrammes();
        return updatedProgramme;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update programme'));
        console.error('Error updating programme:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchProgrammes]
  );

  /**
   * Delete a programme
   */
  const deleteProgramme = useCallback(
    async (programmeId: number) => {
      try {
        setLoading(true);
        setError(null);
        await programmeService.deleteProgramme(programmeId, tenantId);
        // Refresh the list after deletion
        await fetchProgrammes();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete programme'));
        console.error('Error deleting programme:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchProgrammes]
  );

  /**
   * Change programme status
   */
  const changeStatus = useCallback(
    async (programmeId: number, data: ChangeStatusData) => {
      try {
        setLoading(true);
        setError(null);
        const updatedProgramme = await programmeService.changeStatus(programmeId, data, tenantId);
        // Refresh the list after status change
        await fetchProgrammes();
        return updatedProgramme;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to change programme status'));
        console.error('Error changing programme status:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchProgrammes]
  );

  // Fetch programmes on mount and when params change
  useEffect(() => {
    fetchProgrammes();
  }, [fetchProgrammes]);

  return {
    programmes,
    loading,
    error,
    pagination,
    params,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    refresh,
    createProgramme,
    updateProgramme,
    deleteProgramme,
    changeStatus
  };
};
