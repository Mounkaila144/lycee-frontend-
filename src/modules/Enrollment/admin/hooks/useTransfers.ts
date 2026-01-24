'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { transferService } from '../services/transferService';

import type {
  Transfer,
  TransferFormData,
  TransferFilters,
  TransferStatistics,
  Equivalence,
  EquivalenceFormData,
  OriginModule,
  TransferStatus,
} from '../../types/transfer.types';

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
export interface TransferQueryParams extends TransferFilters {
  page?: number;
  per_page?: number;
}

/**
 * Custom hook for managing transfers with server-side pagination
 */
export const useTransfers = (initialParams?: TransferQueryParams) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [transfers, setTransfers] = useState<Transfer[]>([]);
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
  const [params, setParams] = useState<TransferQueryParams>(initialParams || { page: 1, per_page: 10 });

  /**
   * Fetch transfers from the API with pagination
   */
  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transferService.getTransfers(tenantId, params);

      setTransfers(response.data);
      setPagination({
        current_page: response.current_page,
        from: (response.current_page - 1) * response.per_page + 1,
        last_page: response.last_page,
        per_page: response.per_page,
        to: Math.min(response.current_page * response.per_page, response.total),
        total: response.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transfers'));
      console.error('Error fetching transfers:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, params]);

  /**
   * Refresh the transfer list
   */
  const refresh = useCallback(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<TransferQueryParams>) => {
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
  const setStatusFilter = useCallback((status: TransferStatus | undefined) => {
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
   * Create a new transfer
   */
  const createTransfer = useCallback(
    async (data: TransferFormData, documents?: File[]) => {
      try {
        setLoading(true);
        setError(null);
        const newTransfer = await transferService.create(data, documents, tenantId);
        await fetchTransfers();

        return newTransfer;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create transfer'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchTransfers]
  );

  /**
   * Start review of a transfer
   */
  const startReview = useCallback(
    async (transferId: number) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await transferService.startReview(transferId, tenantId);
        await fetchTransfers();

        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to start review'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchTransfers]
  );

  /**
   * Analyze equivalences for a transfer
   */
  const analyzeEquivalences = useCallback(
    async (transferId: number, originModules: OriginModule[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await transferService.analyzeEquivalences(transferId, { origin_modules: originModules }, tenantId);
        await fetchTransfers();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to analyze equivalences'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchTransfers]
  );

  /**
   * Validate a transfer
   */
  const validateTransfer = useCallback(
    async (transferId: number) => {
      try {
        setLoading(true);
        setError(null);
        const validated = await transferService.validate(transferId, tenantId);
        await fetchTransfers();

        return validated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to validate transfer'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchTransfers]
  );

  /**
   * Integrate student from transfer
   */
  const integrateTransfer = useCallback(
    async (transferId: number) => {
      try {
        setLoading(true);
        setError(null);
        const result = await transferService.integrate(transferId, tenantId);
        await fetchTransfers();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to integrate transfer'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchTransfers]
  );

  /**
   * Reject a transfer
   */
  const rejectTransfer = useCallback(
    async (transferId: number, reason: string) => {
      try {
        setLoading(true);
        setError(null);
        const rejected = await transferService.reject(transferId, reason, tenantId);
        await fetchTransfers();

        return rejected;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to reject transfer'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchTransfers]
  );

  /**
   * Download certificate PDF
   */
  const downloadCertificate = useCallback(
    async (transferId: number, transferNumber: string) => {
      try {
        const blob = await transferService.downloadCertificate(transferId, tenantId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attestation_equivalences_${transferNumber}.pdf`;
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
    fetchTransfers();
  }, [fetchTransfers]);

  return {
    transfers,
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
    createTransfer,
    startReview,
    analyzeEquivalences,
    validateTransfer,
    integrateTransfer,
    rejectTransfer,
    downloadCertificate,
  };
};

/**
 * Custom hook for transfer statistics
 */
export const useTransferStatistics = (academicYearId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [statistics, setStatistics] = useState<TransferStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await transferService.getStatistics(academicYearId, tenantId);
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transfer statistics'));
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
 * Custom hook for single transfer details
 */
export const useTransferDetails = (transferId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransfer = useCallback(async () => {
    if (!transferId) {
      setTransfer(null);

      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await transferService.getById(transferId, tenantId);
      setTransfer(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transfer details'));
    } finally {
      setLoading(false);
    }
  }, [transferId, tenantId]);

  useEffect(() => {
    fetchTransfer();
  }, [fetchTransfer]);

  return {
    transfer,
    loading,
    error,
    refresh: fetchTransfer,
  };
};

/**
 * Custom hook for managing equivalences
 */
export const useEquivalences = (transferId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [equivalences, setEquivalences] = useState<Equivalence[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEquivalences = useCallback(async () => {
    if (!transferId) {
      setEquivalences([]);

      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await transferService.getEquivalences(transferId, undefined, tenantId);
      setEquivalences(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch equivalences'));
    } finally {
      setLoading(false);
    }
  }, [transferId, tenantId]);

  /**
   * Create a manual equivalence
   */
  const createEquivalence = useCallback(
    async (data: EquivalenceFormData) => {
      if (!transferId) throw new Error('No transfer selected');

      try {
        setLoading(true);
        setError(null);
        const newEquivalence = await transferService.createEquivalence(transferId, data, tenantId);
        await fetchEquivalences();

        return newEquivalence;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create equivalence'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [transferId, tenantId, fetchEquivalences]
  );

  /**
   * Update an equivalence
   */
  const updateEquivalence = useCallback(
    async (equivalenceId: number, data: Partial<EquivalenceFormData>) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await transferService.updateEquivalence(equivalenceId, data, tenantId);
        await fetchEquivalences();

        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update equivalence'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchEquivalences]
  );

  /**
   * Delete an equivalence
   */
  const deleteEquivalence = useCallback(
    async (equivalenceId: number) => {
      try {
        setLoading(true);
        setError(null);
        await transferService.deleteEquivalence(equivalenceId, tenantId);
        await fetchEquivalences();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete equivalence'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchEquivalences]
  );

  /**
   * Validate a single equivalence
   */
  const validateEquivalence = useCallback(
    async (equivalenceId: number) => {
      try {
        setLoading(true);
        setError(null);
        const validated = await transferService.validateEquivalence(equivalenceId, tenantId);
        await fetchEquivalences();

        return validated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to validate equivalence'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchEquivalences]
  );

  /**
   * Reject a single equivalence
   */
  const rejectEquivalence = useCallback(
    async (equivalenceId: number, notes?: string) => {
      try {
        setLoading(true);
        setError(null);
        const rejected = await transferService.rejectEquivalence(equivalenceId, notes, tenantId);
        await fetchEquivalences();

        return rejected;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to reject equivalence'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchEquivalences]
  );

  /**
   * Batch validate equivalences
   */
  const batchValidate = useCallback(
    async (equivalenceIds: number[]) => {
      if (!transferId) throw new Error('No transfer selected');

      try {
        setLoading(true);
        setError(null);
        const result = await transferService.batchValidateEquivalences(transferId, equivalenceIds, tenantId);
        await fetchEquivalences();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to batch validate equivalences'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [transferId, tenantId, fetchEquivalences]
  );

  useEffect(() => {
    fetchEquivalences();
  }, [fetchEquivalences]);

  return {
    equivalences,
    loading,
    error,
    refresh: fetchEquivalences,
    createEquivalence,
    updateEquivalence,
    deleteEquivalence,
    validateEquivalence,
    rejectEquivalence,
    batchValidate,
  };
};
