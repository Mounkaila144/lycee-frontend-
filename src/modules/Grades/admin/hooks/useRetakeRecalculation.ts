'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { retakeRecalculationService } from '../services';
import type { RecalculationLog } from '../../types/retake.types';

/**
 * Hook for recalculation logs (Story 19)
 */
export const useRecalculationLogs = (
  semesterId: number | null,
  params?: { student_id?: number },
  tenantId?: string
) => {
  return useQuery({
    queryKey: ['recalculation-logs', semesterId, params],
    queryFn: () => retakeRecalculationService.getLogs(semesterId!, params, tenantId),
    enabled: !!semesterId,
  });
};

/**
 * Hook for triggering recalculation for all students
 */
export const useRecalculateAll = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: number) =>
      retakeRecalculationService.recalculateAll(semesterId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recalculation-logs'] });
      queryClient.invalidateQueries({ queryKey: ['semester-results'] });
      queryClient.invalidateQueries({ queryKey: ['retake-statistics'] });
    },
  });
};

/**
 * Hook for triggering recalculation for a specific student
 */
export const useRecalculateStudent = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, semesterId }: { studentId: number; semesterId?: number }) =>
      retakeRecalculationService.recalculateStudent(studentId, { semester_id: semesterId }, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recalculation-logs'] });
      queryClient.invalidateQueries({ queryKey: ['semester-results'] });
    },
  });
};

/**
 * Combined hook for recalculation dashboard (Story 19)
 */
export const useRetakeRecalculation = (initialSemesterId?: number | null) => {
  const [semesterId, setSemesterId] = useState<number | null>(initialSemesterId ?? null);

  const logs = useRecalculationLogs(semesterId);
  const recalculateAllMutation = useRecalculateAll();
  const recalculateStudentMutation = useRecalculateStudent();

  return {
    semesterId,
    setSemesterId,

    logs: logs.data ?? [],
    logsLoading: logs.isLoading,
    logsError: logs.error,

    recalculateAll: () => {
      if (semesterId) recalculateAllMutation.mutate(semesterId);
    },
    recalculatingAll: recalculateAllMutation.isPending,
    recalculateAllResult: recalculateAllMutation.data,

    recalculateStudent: (studentId: number) => {
      recalculateStudentMutation.mutate({ studentId, semesterId: semesterId ?? undefined });
    },
    recalculatingStudent: recalculateStudentMutation.isPending,

    refresh: () => logs.refetch(),
  };
};
