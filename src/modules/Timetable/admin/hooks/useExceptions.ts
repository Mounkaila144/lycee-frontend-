import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { exceptionService } from '../services';
import type { CreateExceptionRequest, ExceptionFilters } from '../../types';

export const useExceptions = (filters?: ExceptionFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-exceptions', filters],
    queryFn: () => exceptionService.getAll(filters, tenantId),
  });
};

export const useSlotExceptions = (slotId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['slot-exceptions', slotId],
    queryFn: () => exceptionService.getSlotExceptions(slotId!, tenantId),
    enabled: !!slotId,
  });
};

export const useCreateException = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExceptionRequest) => exceptionService.create(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-exceptions'] });
      qc.invalidateQueries({ queryKey: ['slot-exceptions'] });
    },
  });
};

export const useCancelException = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => exceptionService.cancel(id, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-exceptions'] });
      qc.invalidateQueries({ queryKey: ['slot-exceptions'] });
    },
  });
};

export const useUpcomingExceptions = (scheduleId?: number, days: number = 7, tenantId?: string) => {
  return useQuery({
    queryKey: ['upcoming-exceptions', scheduleId, days],
    queryFn: () => exceptionService.getUpcoming(scheduleId!, days, tenantId),
    enabled: !!scheduleId,
  });
};
