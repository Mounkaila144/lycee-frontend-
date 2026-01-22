'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { studentService } from '../services/studentService';
import type {
  Student,
  StudentQueryParams
} from '../../types/student.types';
import type { PaginationMeta } from '../../types/user.types';

/**
 * Custom hook for managing students with server-side pagination
 * Provides state management and data fetching for the student list
 */
export const useStudents = (initialParams?: StudentQueryParams) => {
  const { tenantId } = useTenant();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    from: null,
    last_page: 1,
    links: [],
    path: '',
    per_page: 15,
    to: null,
    total: 0
  });
  const [params, setParams] = useState<StudentQueryParams>(
    initialParams || { page: 1, per_page: 15 }
  );

  /**
   * Fetch students from the API with pagination
   */
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getStudents(tenantId || undefined, params);

      setStudents(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch students'));
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, params]);

  /**
   * Refresh the student list
   */
  const refresh = useCallback(() => {
    fetchStudents();
  }, [fetchStudents]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<StudentQueryParams>) => {
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
   * Filter by program
   */
  const setProgram = useCallback((programId?: number) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      program_id: programId
    }));
  }, []);

  /**
   * Filter by level
   */
  const setLevel = useCallback((levelId?: number) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      level_id: levelId
    }));
  }, []);

  /**
   * Filter by status
   */
  const setStatus = useCallback((status?: 'Actif' | 'Suspendu' | 'Exclu' | 'Diplômé') => {
    setParams(prev => ({
      ...prev,
      page: 1,
      status
    }));
  }, []);

  // Fetch students on mount and when params change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    pagination,
    params,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    setProgram,
    setLevel,
    setStatus,
    refresh
  };
};
