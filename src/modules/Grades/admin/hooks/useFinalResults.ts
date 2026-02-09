'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { finalResultService } from '../services';
import type {
  FinalStatistics,
  FinalResult,
  PublishFinalResultsRequest,
} from '../../types/finalResult.types';

/**
 * Hook for final statistics (Story 20)
 */
export const useFinalStatistics = (semesterId: number | null, tenantId?: string) => {
  return useQuery({
    queryKey: ['final-statistics', semesterId],
    queryFn: () => finalResultService.getStatistics(semesterId!, tenantId),
    enabled: !!semesterId,
  });
};

/**
 * Hook for final results list
 */
export const useFinalResultsList = (
  semesterId: number | null,
  params?: { final_status?: string; page?: number; per_page?: number },
  tenantId?: string
) => {
  return useQuery({
    queryKey: ['final-results', semesterId, params],
    queryFn: () => finalResultService.getResults(semesterId!, params, tenantId),
    enabled: !!semesterId,
  });
};

/**
 * Hook for publishing final results
 */
export const usePublishFinalResults = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ semesterId, data }: { semesterId: number; data: PublishFinalResultsRequest }) =>
      finalResultService.publishFinalResults(semesterId, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['final-results'] });
    },
  });
};

/**
 * Hook for locking the academic year
 */
export const useLockYear = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: number) => finalResultService.lockYear(semesterId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-results'] });
      queryClient.invalidateQueries({ queryKey: ['final-statistics'] });
    },
  });
};

/**
 * Hook for exporting final results
 */
export const useExportFinalResults = (tenantId?: string) => {
  return useMutation({
    mutationFn: (semesterId: number) => finalResultService.exportResults(semesterId, tenantId),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `final-results.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
};

/**
 * Combined hook for the final results dashboard (Story 20)
 */
export const useFinalResults = (initialSemesterId?: number | null) => {
  const [semesterId, setSemesterId] = useState<number | null>(initialSemesterId ?? null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);

  const statistics = useFinalStatistics(semesterId);
  const results = useFinalResultsList(semesterId, { final_status: statusFilter });
  const publishMutation = usePublishFinalResults();
  const lockMutation = useLockYear();
  const exportMutation = useExportFinalResults();

  return {
    // State
    semesterId,
    setSemesterId,
    statusFilter,
    setStatusFilter,
    publishDialogOpen,
    setPublishDialogOpen,
    lockDialogOpen,
    setLockDialogOpen,

    // Data
    statistics: statistics.data,
    results: results.data,

    // Loading
    statsLoading: statistics.isLoading,
    resultsLoading: results.isLoading,

    // Error
    error: statistics.error || results.error,

    // Actions
    publishResults: (data: PublishFinalResultsRequest) => {
      if (semesterId) {
        publishMutation.mutate({ semesterId, data });
      }
    },
    publishing: publishMutation.isPending,
    publishResult: publishMutation.data,

    lockYear: () => {
      if (semesterId) lockMutation.mutate(semesterId);
    },
    locking: lockMutation.isPending,
    lockResult: lockMutation.data,

    exportResults: () => {
      if (semesterId) exportMutation.mutate(semesterId);
    },
    exporting: exportMutation.isPending,

    refresh: () => {
      statistics.refetch();
      results.refetch();
    },
  };
};
