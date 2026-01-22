'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { reenrollmentService } from '../services/reenrollmentService';

import type {
  Reenrollment,
  ReenrollmentFormData,
  ReenrollmentFilters,
  EligibilityCheck,
  EligibilityCheckRequest,
  GlobalStatistics,
  BatchValidateResult,
} from '../../types/reenrollment.types';

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
export interface ReenrollmentQueryParams extends ReenrollmentFilters {
  page?: number;
  per_page?: number;
}

/**
 * Custom hook for managing reenrollments with server-side pagination
 */
export const useReenrollments = (initialParams?: ReenrollmentQueryParams) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [reenrollments, setReenrollments] = useState<Reenrollment[]>([]);
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
  const [params, setParams] = useState<ReenrollmentQueryParams>(initialParams || { page: 1, per_page: 10 });

  /**
   * Fetch reenrollments from the API with pagination
   */
  const fetchReenrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reenrollmentService.getReenrollments(tenantId, params);

      setReenrollments(response.data);
      setPagination({
        current_page: response.current_page,
        from: (response.current_page - 1) * response.per_page + 1,
        last_page: response.last_page,
        per_page: response.per_page,
        to: Math.min(response.current_page * response.per_page, response.total),
        total: response.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reenrollments'));
      console.error('Error fetching reenrollments:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, params]);

  /**
   * Refresh the reenrollment list
   */
  const refresh = useCallback(() => {
    fetchReenrollments();
  }, [fetchReenrollments]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<ReenrollmentQueryParams>) => {
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
   * Update campaign filter
   */
  const setCampaignFilter = useCallback((campaignId: number | undefined) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      campaign_id: campaignId,
    }));
  }, []);

  /**
   * Update status filter
   */
  const setStatusFilter = useCallback((status: ReenrollmentFilters['status']) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      status: status || undefined,
    }));
  }, []);

  /**
   * Create a new reenrollment
   */
  const createReenrollment = useCallback(
    async (data: ReenrollmentFormData) => {
      try {
        setLoading(true);
        setError(null);
        const newReenrollment = await reenrollmentService.create(data, tenantId);
        await fetchReenrollments();

        return newReenrollment;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create reenrollment'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchReenrollments]
  );

  /**
   * Validate a reenrollment
   */
  const validateReenrollment = useCallback(
    async (reenrollmentId: number) => {
      try {
        setLoading(true);
        setError(null);
        const validated = await reenrollmentService.validate(reenrollmentId, tenantId);
        await fetchReenrollments();

        return validated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to validate reenrollment'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchReenrollments]
  );

  /**
   * Reject a reenrollment
   */
  const rejectReenrollment = useCallback(
    async (reenrollmentId: number, reason: string) => {
      try {
        setLoading(true);
        setError(null);
        const rejected = await reenrollmentService.reject(reenrollmentId, reason, tenantId);
        await fetchReenrollments();

        return rejected;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to reject reenrollment'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchReenrollments]
  );

  /**
   * Batch validate reenrollments
   */
  const batchValidate = useCallback(
    async (reenrollmentIds: number[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await reenrollmentService.batchValidate({ reenrollment_ids: reenrollmentIds }, tenantId);
        await fetchReenrollments();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to batch validate reenrollments'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchReenrollments]
  );

  /**
   * Download confirmation PDF
   */
  const downloadConfirmation = useCallback(
    async (reenrollmentId: number, studentMatricule: string) => {
      try {
        const blob = await reenrollmentService.downloadConfirmation(reenrollmentId, tenantId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `confirmation_reinscription_${studentMatricule}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to download confirmation PDF'));
        throw err;
      }
    },
    [tenantId]
  );

  // Fetch data when params change
  useEffect(() => {
    fetchReenrollments();
  }, [fetchReenrollments]);

  return {
    reenrollments,
    loading,
    error,
    pagination,
    params,
    refresh,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    setCampaignFilter,
    setStatusFilter,
    createReenrollment,
    validateReenrollment,
    rejectReenrollment,
    batchValidate,
    downloadConfirmation,
  };
};

/**
 * Custom hook for checking eligibility
 */
export const useEligibilityCheck = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const checkEligibility = useCallback(
    async (data: EligibilityCheckRequest) => {
      try {
        setLoading(true);
        setError(null);
        const result = await reenrollmentService.checkEligibility(data, tenantId);
        setEligibility(result);

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to check eligibility'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );

  const clearEligibility = useCallback(() => {
    setEligibility(null);
    setError(null);
  }, []);

  return {
    eligibility,
    loading,
    error,
    checkEligibility,
    clearEligibility,
  };
};

/**
 * Custom hook for reenrollment statistics
 */
export const useReenrollmentStatistics = (campaignId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [statistics, setStatistics] = useState<GlobalStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await reenrollmentService.getStatistics(campaignId, tenantId);
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reenrollment statistics'));
    } finally {
      setLoading(false);
    }
  }, [campaignId, tenantId]);

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
 * Custom hook for single reenrollment details
 */
export const useReenrollmentDetails = (reenrollmentId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [reenrollment, setReenrollment] = useState<Reenrollment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReenrollment = useCallback(async () => {
    if (!reenrollmentId) {
      setReenrollment(null);

      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await reenrollmentService.getById(reenrollmentId, tenantId);
      setReenrollment(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reenrollment details'));
    } finally {
      setLoading(false);
    }
  }, [reenrollmentId, tenantId]);

  useEffect(() => {
    fetchReenrollment();
  }, [fetchReenrollment]);

  return {
    reenrollment,
    loading,
    error,
    refresh: fetchReenrollment,
  };
};
