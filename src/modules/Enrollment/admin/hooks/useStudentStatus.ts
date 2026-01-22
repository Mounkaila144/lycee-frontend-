import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentStatusService } from '../services/studentStatusService';
import { useTenant } from '@/shared/lib/tenant-context';
import type {
  StudentStatusHistory,
  StatusChangeRequest,
  StatusStatistics,
  Student,
} from '../../types/student.types';

/**
 * Hook for fetching student status history
 */
export const useStudentStatusHistory = (studentId: number | null) => {
  const { tenantId } = useTenant();

  return useQuery<StudentStatusHistory[]>({
    queryKey: ['student-status-history', studentId, tenantId],
    queryFn: () => studentStatusService.getStatusHistory(studentId!, tenantId || undefined),
    enabled: !!studentId,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook for fetching status statistics
 */
export const useStatusStatistics = () => {
  const { tenantId } = useTenant();

  return useQuery<StatusStatistics[]>({
    queryKey: ['status-statistics', tenantId],
    queryFn: () => studentStatusService.getStatusStatistics(tenantId || undefined),
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook for student status mutations (change status)
 */
export const useStudentStatusMutations = () => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  const changeStatusMutation = useMutation<
    Student,
    Error,
    { studentId: number; data: StatusChangeRequest }
  >({
    mutationFn: ({ studentId, data }) =>
      studentStatusService.changeStatus(studentId, data, tenantId || undefined),
    onSuccess: (_, { studentId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-status-history', studentId] });
      queryClient.invalidateQueries({ queryKey: ['status-statistics'] });
    },
  });

  return {
    changeStatus: changeStatusMutation.mutate,
    changeStatusAsync: changeStatusMutation.mutateAsync,
    isChangingStatus: changeStatusMutation.isPending,
    changeStatusError: changeStatusMutation.error,
  };
};

/**
 * Hook for downloading status change documents
 */
export const useStatusDocumentDownload = () => {
  const { tenantId } = useTenant();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadDocument = useCallback(
    async (studentId: number, historyId: number, fileName?: string) => {
      try {
        setIsDownloading(true);

        const blob = await studentStatusService.downloadDocument(
          studentId,
          historyId,
          tenantId || undefined
        );

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `document-statut-${historyId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } finally {
        setIsDownloading(false);
      }
    },
    [tenantId]
  );

  return {
    downloadDocument,
    isDownloading,
  };
};
