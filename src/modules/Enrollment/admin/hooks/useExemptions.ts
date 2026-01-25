'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { exemptionService } from '../services/exemptionService';

import type {
  ModuleExemption,
  ExemptionFormData,
  ExemptionFilters,
  ExemptionStatistics,
  ExemptionStatus,
  ExemptionReasonCategory,
  TeacherReviewData,
  ExemptionValidationData,
  ExemptionRevokeData,
} from '../../types/exemption.types';

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
 * Query Params
 */
export interface ExemptionQueryParams extends ExemptionFilters {
  page?: number;
  per_page?: number;
}

/**
 * Custom hook for managing exemptions with server-side pagination
 */
export const useExemptions = (initialParams?: ExemptionQueryParams) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [exemptions, setExemptions] = useState<ModuleExemption[]>([]);
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
  const [params, setParams] = useState<ExemptionQueryParams>(initialParams || { page: 1, per_page: 10 });

  /**
   * Fetch exemptions from the API with pagination
   */
  const fetchExemptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await exemptionService.getExemptions(tenantId, params);

      setExemptions(response.data);
      setPagination({
        current_page: response.current_page,
        from: (response.current_page - 1) * response.per_page + 1,
        last_page: response.last_page,
        per_page: response.per_page,
        to: Math.min(response.current_page * response.per_page, response.total),
        total: response.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exemptions'));
      console.error('Error fetching exemptions:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, params]);

  /**
   * Refresh the exemption list
   */
  const refresh = useCallback(() => {
    fetchExemptions();
  }, [fetchExemptions]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<ExemptionQueryParams>) => {
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
   * Update status filter
   */
  const setStatusFilter = useCallback((status: ExemptionStatus | undefined) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      status: status || undefined,
    }));
  }, []);

  /**
   * Update academic year filter
   */
  const setAcademicYearFilter = useCallback((academicYearId: number | undefined) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      academic_year_id: academicYearId,
    }));
  }, []);

  /**
   * Update reason category filter
   */
  const setReasonCategoryFilter = useCallback((reasonCategory: ExemptionReasonCategory | undefined) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      reason_category: reasonCategory || undefined,
    }));
  }, []);

  /**
   * Create a new exemption request
   */
  const createExemption = useCallback(
    async (data: ExemptionFormData, documents?: File[]) => {
      try {
        setLoading(true);
        setError(null);
        const newExemption = await exemptionService.create(data, documents, tenantId);
        await fetchExemptions();

        return newExemption;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create exemption'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchExemptions]
  );

  /**
   * Submit teacher review
   */
  const submitTeacherReview = useCallback(
    async (exemptionId: number, data: TeacherReviewData) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await exemptionService.teacherReview(exemptionId, data, tenantId);
        await fetchExemptions();

        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to submit teacher review'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchExemptions]
  );

  /**
   * Validate/Reject an exemption
   */
  const validateExemption = useCallback(
    async (exemptionId: number, data: ExemptionValidationData) => {
      try {
        setLoading(true);
        setError(null);
        const validated = await exemptionService.validate(exemptionId, data, tenantId);
        await fetchExemptions();

        return validated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to validate exemption'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchExemptions]
  );

  /**
   * Revoke an exemption
   */
  const revokeExemption = useCallback(
    async (exemptionId: number, data: ExemptionRevokeData) => {
      try {
        setLoading(true);
        setError(null);
        const revoked = await exemptionService.revoke(exemptionId, data, tenantId);
        await fetchExemptions();

        return revoked;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to revoke exemption'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchExemptions]
  );

  /**
   * Download certificate PDF
   */
  const downloadCertificate = useCallback(
    async (exemptionId: number, exemptionNumber: string) => {
      try {
        const blob = await exemptionService.downloadCertificate(exemptionId, tenantId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attestation_dispense_${exemptionNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to download certificate PDF'));
        throw err;
      }
    },
    [tenantId]
  );

  // Fetch data when params change
  useEffect(() => {
    fetchExemptions();
  }, [fetchExemptions]);

  return {
    exemptions,
    loading,
    error,
    pagination,
    params,
    refresh,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    setStatusFilter,
    setAcademicYearFilter,
    setReasonCategoryFilter,
    createExemption,
    submitTeacherReview,
    validateExemption,
    revokeExemption,
    downloadCertificate,
  };
};

/**
 * Custom hook for exemption statistics
 */
export const useExemptionStatistics = (academicYearId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [statistics, setStatistics] = useState<ExemptionStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await exemptionService.getStatistics(academicYearId, tenantId);
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exemption statistics'));
    } finally {
      setLoading(false);
    }
  }, [academicYearId, tenantId]);

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
 * Custom hook for single exemption details
 */
export const useExemptionDetails = (exemptionId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [exemption, setExemption] = useState<ModuleExemption | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchExemption = useCallback(async () => {
    if (!exemptionId) {
      setExemption(null);

      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await exemptionService.getById(exemptionId, tenantId);
      setExemption(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exemption details'));
    } finally {
      setLoading(false);
    }
  }, [exemptionId, tenantId]);

  useEffect(() => {
    fetchExemption();
  }, [fetchExemption]);

  return {
    exemption,
    loading,
    error,
    refresh: fetchExemption,
  };
};

/**
 * Custom hook for pending exemptions
 */
export const usePendingExemptions = (academicYearId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [exemptions, setExemptions] = useState<ModuleExemption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exemptionService.getPending(academicYearId, tenantId);
      setExemptions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch pending exemptions'));
    } finally {
      setLoading(false);
    }
  }, [academicYearId, tenantId]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return {
    exemptions,
    loading,
    error,
    refresh: fetchPending,
  };
};
