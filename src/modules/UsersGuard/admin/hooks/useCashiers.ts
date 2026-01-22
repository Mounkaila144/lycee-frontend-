'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { cashierService } from '../services/cashierService';
import type { Cashier } from '../../types/financial.types';
import type { UserQueryParams, PaginationMeta } from '../../types/user.types';

/**
 * Custom hook for managing cashiers with server-side pagination
 * Provides state management and data fetching for the cashier list
 */
export const useCashiers = (initialParams?: UserQueryParams) => {
  const { tenantId } = useTenant();
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
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
  const [params, setParams] = useState<UserQueryParams>(
    initialParams || { page: 1, per_page: 15 }
  );

  /**
   * Fetch cashiers from the API with pagination
   */
  const fetchCashiers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cashierService.getCashiers(tenantId || undefined, params);

      setCashiers(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cashiers'));
      console.error('Error fetching cashiers:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, params]);

  /**
   * Refresh the cashier list
   */
  const refresh = useCallback(() => {
    fetchCashiers();
  }, [fetchCashiers]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<UserQueryParams>) => {
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

  // Fetch cashiers on mount and when params change
  useEffect(() => {
    fetchCashiers();
  }, [fetchCashiers]);

  return {
    cashiers,
    loading,
    error,
    pagination,
    params,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    refresh
  };
};
