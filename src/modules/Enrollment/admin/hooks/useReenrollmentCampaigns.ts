'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { reenrollmentCampaignService } from '../services/reenrollmentCampaignService';

import type {
  ReenrollmentCampaign,
  ReenrollmentCampaignFormData,
  ReenrollmentCampaignFilters,
  CampaignStatistics,
  EligibleStudentsResult,
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
export interface CampaignQueryParams extends ReenrollmentCampaignFilters {
  page?: number;
  per_page?: number;
  include_statistics?: boolean;
}

/**
 * Custom hook for managing reenrollment campaigns with server-side pagination
 */
export const useReenrollmentCampaigns = (initialParams?: CampaignQueryParams) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [campaigns, setCampaigns] = useState<ReenrollmentCampaign[]>([]);
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
  const [params, setParams] = useState<CampaignQueryParams>(initialParams || { page: 1, per_page: 10 });

  /**
   * Fetch campaigns from the API with pagination
   */
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reenrollmentCampaignService.getCampaigns(tenantId, params);

      setCampaigns(response.data);
      setPagination({
        current_page: response.current_page,
        from: (response.current_page - 1) * response.per_page + 1,
        last_page: response.last_page,
        per_page: response.per_page,
        to: Math.min(response.current_page * response.per_page, response.total),
        total: response.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reenrollment campaigns'));
      console.error('Error fetching reenrollment campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, params]);

  /**
   * Refresh the campaign list
   */
  const refresh = useCallback(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<CampaignQueryParams>) => {
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
   * Update status filter
   */
  const setStatusFilter = useCallback((status: ReenrollmentCampaignFilters['status']) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      status: status || undefined,
    }));
  }, []);

  /**
   * Create a new campaign
   */
  const createCampaign = useCallback(
    async (data: ReenrollmentCampaignFormData) => {
      try {
        setLoading(true);
        setError(null);
        const newCampaign = await reenrollmentCampaignService.create(data, tenantId);
        await fetchCampaigns();

        return newCampaign;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create campaign'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCampaigns]
  );

  /**
   * Update an existing campaign
   */
  const updateCampaign = useCallback(
    async (campaignId: number, data: Partial<ReenrollmentCampaignFormData>) => {
      try {
        setLoading(true);
        setError(null);
        const updatedCampaign = await reenrollmentCampaignService.update(campaignId, data, tenantId);
        await fetchCampaigns();

        return updatedCampaign;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update campaign'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCampaigns]
  );

  /**
   * Delete a campaign
   */
  const deleteCampaign = useCallback(
    async (campaignId: number) => {
      try {
        setLoading(true);
        setError(null);
        await reenrollmentCampaignService.delete(campaignId, tenantId);
        await fetchCampaigns();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete campaign'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCampaigns]
  );

  /**
   * Activate a campaign
   */
  const activateCampaign = useCallback(
    async (campaignId: number) => {
      try {
        setLoading(true);
        setError(null);
        const campaign = await reenrollmentCampaignService.activate(campaignId, tenantId);
        await fetchCampaigns();

        return campaign;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to activate campaign'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCampaigns]
  );

  /**
   * Close a campaign
   */
  const closeCampaign = useCallback(
    async (campaignId: number) => {
      try {
        setLoading(true);
        setError(null);
        const campaign = await reenrollmentCampaignService.close(campaignId, tenantId);
        await fetchCampaigns();

        return campaign;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to close campaign'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCampaigns]
  );

  // Fetch data when params change
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    pagination,
    params,
    refresh,
    updateParams,
    setPage,
    setPageSize,
    setStatusFilter,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    activateCampaign,
    closeCampaign,
  };
};

/**
 * Custom hook for fetching campaign statistics
 */
export const useCampaignStatistics = (campaignId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [statistics, setStatistics] = useState<CampaignStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    if (!campaignId) {
      setStatistics(null);

      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await reenrollmentCampaignService.getStatistics(campaignId, tenantId);
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch campaign statistics'));
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
 * Custom hook for fetching eligible students for a campaign
 */
export const useEligibleStudents = (campaignId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [data, setData] = useState<EligibleStudentsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEligibleStudents = useCallback(async () => {
    if (!campaignId) {
      setData(null);

      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await reenrollmentCampaignService.getEligibleStudents(campaignId, tenantId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch eligible students'));
    } finally {
      setLoading(false);
    }
  }, [campaignId, tenantId]);

  useEffect(() => {
    fetchEligibleStudents();
  }, [fetchEligibleStudents]);

  return {
    eligibleStudents: data?.eligible || [],
    notEligibleStudents: data?.not_eligible || [],
    totalEligible: data?.total_eligible || 0,
    totalNotEligible: data?.total_not_eligible || 0,
    loading,
    error,
    refresh: fetchEligibleStudents,
  };
};
