import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cancellationService } from '../services';
import type { CancellationRequest } from '../../types';

export const useCancellations = (
  filters?: { module?: string; teacher?: string; status?: string },
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['timetable-cancellations', filters],
    queryFn: () => cancellationService.getAll(filters, tenantId),
  });
};

export const useCancellationStats = (tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-cancellation-stats'],
    queryFn: () => cancellationService.getStatistics(tenantId),
  });
};

export const useCancelSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CancellationRequest) => cancellationService.cancelSession(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-cancellations'] });
      qc.invalidateQueries({ queryKey: ['timetable-cancellation-stats'] });
      qc.invalidateQueries({ queryKey: ['timetable-slots'] });
      qc.invalidateQueries({ queryKey: ['timetable-exceptions'] });
    },
  });
};

export const useRestoreSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (exceptionId: number) => cancellationService.restoreSession(exceptionId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-cancellations'] });
      qc.invalidateQueries({ queryKey: ['timetable-cancellation-stats'] });
      qc.invalidateQueries({ queryKey: ['timetable-slots'] });
      qc.invalidateQueries({ queryKey: ['timetable-exceptions'] });
    },
  });
};
