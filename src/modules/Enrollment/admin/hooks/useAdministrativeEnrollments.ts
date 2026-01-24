'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { administrativeEnrollmentService } from '../services/administrativeEnrollmentService';

import type {
  AdministrativeEnrollment,
  AdministrativeEnrollmentQueryParams,
  CreateAdministrativeEnrollmentRequest,
  UpdateAdministrativeEnrollmentRequest,
} from '../../types/administrativeEnrollment.types';

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Custom hook for managing administrative enrollments with server-side pagination
 * Provides state management and data fetching for the enrollment list
 */
export const useAdministrativeEnrollments = (initialParams?: AdministrativeEnrollmentQueryParams) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [enrollments, setEnrollments] = useState<AdministrativeEnrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    from: null,
    last_page: 1,
    per_page: 10,
    to: null,
    total: 0,
  });
  const [params, setParams] = useState<AdministrativeEnrollmentQueryParams>(
    initialParams || { page: 1, per_page: 10 }
  );

  /**
   * Fetch enrollments from the API with pagination
   */
  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await administrativeEnrollmentService.getEnrollments(tenantId, params);

      setEnrollments(response.data);
      setPagination({
        current_page: response.meta.current_page,
        from: (response.meta.current_page - 1) * response.meta.per_page + 1,
        last_page: response.meta.last_page,
        per_page: response.meta.per_page,
        to: Math.min(response.meta.current_page * response.meta.per_page, response.meta.total),
        total: response.meta.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch enrollments'));
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, params]);

  /**
   * Refresh the enrollment list
   */
  const refresh = useCallback(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<AdministrativeEnrollmentQueryParams>) => {
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
   * Apply filters
   */
  const setFilters = useCallback((filters: Partial<AdministrativeEnrollmentQueryParams>) => {
    setParams(prev => ({
      ...prev,
      ...filters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  /**
   * Create a new enrollment
   */
  const createEnrollment = useCallback(
    async (data: CreateAdministrativeEnrollmentRequest) => {
      try {
        setLoading(true);
        setError(null);
        const result = await administrativeEnrollmentService.create(data, tenantId);

        // Refresh the list after creation
        await fetchEnrollments();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create enrollment'));
        console.error('Error creating enrollment:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchEnrollments]
  );

  /**
   * Update an existing enrollment
   */
  const updateEnrollment = useCallback(
    async (enrollmentId: number, data: UpdateAdministrativeEnrollmentRequest) => {
      try {
        setLoading(true);
        setError(null);
        const updatedEnrollment = await administrativeEnrollmentService.update(enrollmentId, data, tenantId);

        // Refresh the list after update
        await fetchEnrollments();

        return updatedEnrollment;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update enrollment'));
        console.error('Error updating enrollment:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchEnrollments]
  );

  /**
   * Delete an enrollment
   */
  const deleteEnrollment = useCallback(
    async (enrollmentId: number) => {
      try {
        setLoading(true);
        setError(null);
        await administrativeEnrollmentService.delete(enrollmentId, tenantId);

        // Refresh the list after deletion
        await fetchEnrollments();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete enrollment'));
        console.error('Error deleting enrollment:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchEnrollments]
  );

  /**
   * Download enrollment sheet PDF
   */
  const downloadEnrollmentSheet = useCallback(
    async (enrollmentId: number) => {
      try {
        const blob = await administrativeEnrollmentService.downloadEnrollmentSheet(enrollmentId, tenantId);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `fiche_inscription_${enrollmentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to download enrollment sheet'));
        console.error('Error downloading enrollment sheet:', err);
        throw err;
      }
    },
    [tenantId]
  );

  // Fetch data when params change
  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    loading,
    error,
    pagination,
    params,
    refresh,
    updateParams,
    setPage,
    setPageSize,
    setFilters,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    downloadEnrollmentSheet,
  };
};
