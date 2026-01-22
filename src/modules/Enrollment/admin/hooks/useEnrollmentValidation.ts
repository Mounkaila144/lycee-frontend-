'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { enrollmentValidationService } from '../services/enrollmentValidationService';

import type {
  PedagogicalEnrollment,
  ValidationChecklist,
  ValidateEnrollmentRequest,
  RejectEnrollmentRequest,
  BatchValidationRequest,
  BatchValidationResult,
  EnrollmentValidationQueryParams,
  EnrollmentValidationStatistics,
  MyEnrollmentStatus,
} from '../../types/validation.types';

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
 * Custom hook for managing enrollment validations with server-side pagination
 */
export const useEnrollmentValidation = (initialParams?: EnrollmentValidationQueryParams) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [enrollments, setEnrollments] = useState<PedagogicalEnrollment[]>([]);
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
  const [params, setParams] = useState<EnrollmentValidationQueryParams>(
    initialParams || { page: 1, per_page: 10, status: 'Pending' }
  );

  /**
   * Fetch enrollments from the API with pagination
   * Now uses a single method that works with StudentEnrollment table
   */
  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Always use getPendingEnrollments - it now handles all cases
      const response = await enrollmentValidationService.getPendingEnrollments(tenantId, params);

      // Debug: log the response data
      console.log('[useEnrollmentValidation] Response data:', response.data);
      console.log('[useEnrollmentValidation] First enrollment:', response.data[0] ? {
        id: response.data[0].id,
        total_modules: response.data[0].total_modules,
        total_ects: response.data[0].total_ects,
      } : null);

      setEnrollments(response.data);
      setPagination({
        current_page: response.current_page,
        from: (response.current_page - 1) * response.per_page + 1,
        last_page: response.last_page,
        per_page: response.per_page,
        to: Math.min(response.current_page * response.per_page, response.total),
        total: response.total,
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
  const updateParams = useCallback((newParams: Partial<EnrollmentValidationQueryParams>) => {
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
   * Validate enrollment
   */
  const validateEnrollment = useCallback(
    async (data: ValidateEnrollmentRequest) => {
      try {
        setLoading(true);
        const result = await enrollmentValidationService.validate(data, tenantId);
        await fetchEnrollments();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to validate enrollment'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchEnrollments]
  );

  /**
   * Reject enrollment
   */
  const rejectEnrollment = useCallback(
    async (data: RejectEnrollmentRequest) => {
      try {
        setLoading(true);
        const result = await enrollmentValidationService.reject(data, tenantId);
        await fetchEnrollments();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to reject enrollment'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchEnrollments]
  );

  /**
   * Batch validate enrollments
   */
  const batchValidate = useCallback(
    async (data: BatchValidationRequest): Promise<BatchValidationResult> => {
      try {
        setLoading(true);
        const result = await enrollmentValidationService.batchValidate(data, tenantId);
        await fetchEnrollments();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to batch validate'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchEnrollments]
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
    setSearch,
    validateEnrollment,
    rejectEnrollment,
    batchValidate,
  };
};

/**
 * Custom hook for enrollment detail and checklist
 */
export const useEnrollmentDetail = (enrollmentId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [enrollment, setEnrollment] = useState<PedagogicalEnrollment | null>(null);
  const [checklist, setChecklist] = useState<ValidationChecklist | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch enrollment details and checklist
   * Note: checklist fetch may fail if using StudentEnrollment instead of PedagogicalEnrollment
   * In that case, we still want to display enrollment data
   */
  const fetchDetails = useCallback(async () => {
    if (!enrollmentId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch enrollment data first (this should always work)
      try {
        const enrollmentData = await enrollmentValidationService.getById(enrollmentId, tenantId);
        setEnrollment(enrollmentData);
      } catch (err) {
        console.error('Failed to fetch enrollment:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch enrollment details'));
      }

      // Try to fetch checklist separately - this may fail for StudentEnrollments
      try {
        const checklistData = await enrollmentValidationService.checkCompleteness(enrollmentId, tenantId);
        setChecklist(checklistData);
      } catch (err) {
        // Checklist fetch failed - this is expected for StudentEnrollments
        // Set error so the dialog knows to use the fallback checklist
        console.warn('Checklist fetch failed (expected for StudentEnrollments):', err);
        setChecklist(null);
        setError(err instanceof Error ? err : new Error('Checklist not available'));
      }
    } finally {
      setLoading(false);
    }
  }, [enrollmentId, tenantId]);

  /**
   * Download contract
   */
  const downloadContract = useCallback(async () => {
    if (!enrollmentId) return;

    try {
      const blob = await enrollmentValidationService.downloadContract(enrollmentId, tenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrat_pedagogique_${enrollment?.student?.matricule || enrollmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to download contract'));
      throw err;
    }
  }, [enrollmentId, enrollment, tenantId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    enrollment,
    checklist,
    loading,
    error,
    refresh: fetchDetails,
    downloadContract,
  };
};

/**
 * Custom hook for validation statistics
 */
export const useValidationStatistics = (academicYearId?: number, programId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [statistics, setStatistics] = useState<EnrollmentValidationStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await enrollmentValidationService.getStatistics(academicYearId, programId, tenantId);
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch statistics'));
    } finally {
      setLoading(false);
    }
  }, [academicYearId, programId, tenantId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refresh: fetchStatistics,
  };
};

/**
 * Custom hook for student's own enrollment status (frontend)
 */
export const useMyEnrollmentStatus = (academicYearId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [status, setStatus] = useState<MyEnrollmentStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentValidationService.getMyEnrollmentStatus(academicYearId, tenantId);
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch enrollment status'));
    } finally {
      setLoading(false);
    }
  }, [academicYearId, tenantId]);

  const downloadMyContract = useCallback(async () => {
    try {
      const blob = await enrollmentValidationService.downloadMyContract(tenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contrat_pedagogique.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to download contract'));
      throw err;
    }
  }, [tenantId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refresh: fetchStatus,
    downloadMyContract,
  };
};
