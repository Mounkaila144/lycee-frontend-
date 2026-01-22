'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { studentService, type StudentQueryParams } from '../services/studentService';
import type { Student, StudentFormData } from '../../types/student.types';

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: any[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Custom hook for managing students with server-side pagination
 * Provides state management and data fetching for the student list
 */
export const useStudents = (initialParams?: StudentQueryParams) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [students, setStudents] = useState<Student[]>([]);
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
    total: 0,
  });
  const [params, setParams] = useState<StudentQueryParams>(
    initialParams || { page: 1, per_page: 10 }
  );

  /**
   * Fetch students from the API with pagination
   */
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getStudents(tenantId, params);

      setStudents(response.data);
      setPagination({
        current_page: response.current_page,
        from: (response.current_page - 1) * response.per_page + 1,
        last_page: response.last_page,
        links: [],
        path: '',
        per_page: response.per_page,
        to: Math.min(response.current_page * response.per_page, response.total),
        total: response.total,
      });
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
      page: 1,
      search: search || undefined,
    }));
  }, []);

  /**
   * Create a new student
   */
  const createStudent = useCallback(
    async (data: StudentFormData) => {
      try {
        setLoading(true);
        setError(null);
        const newStudent = await studentService.create(data, tenantId);
        // Refresh the list after creation
        await fetchStudents();

        return newStudent;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create student'));
        console.error('Error creating student:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchStudents]
  );

  /**
   * Update an existing student
   */
  const updateStudent = useCallback(
    async (studentId: number, data: Partial<StudentFormData>) => {
      try {
        setLoading(true);
        setError(null);
        const updatedStudent = await studentService.update(studentId, data, tenantId);
        // Refresh the list after update
        await fetchStudents();

        return updatedStudent;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update student'));
        console.error('Error updating student:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchStudents]
  );

  /**
   * Delete a student
   */
  const deleteStudent = useCallback(
    async (studentId: number) => {
      try {
        setLoading(true);
        setError(null);
        await studentService.delete(studentId, tenantId);
        // Refresh the list after deletion
        await fetchStudents();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete student'));
        console.error('Error deleting student:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchStudents]
  );

  // Fetch data when params change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    pagination,
    params,
    refresh,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};
