import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { duplicationService } from '../services';
import type { DuplicationRequest, QuickAssignRequest } from '../../types';

export const useDuplicationPreview = (scheduleId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['duplication-preview', scheduleId],
    queryFn: () => duplicationService.getPreview(scheduleId!, tenantId),
    enabled: !!scheduleId,
  });
};

export const useDuplicate = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: DuplicationRequest) => duplicationService.duplicate(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useDuplicationReport = (scheduleId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['duplication-report', scheduleId],
    queryFn: () => duplicationService.getDuplicationReport(scheduleId!, tenantId),
    enabled: !!scheduleId,
  });
};

export const useSlotSuggestions = (slotId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['slot-suggestions', slotId],
    queryFn: () => duplicationService.getSlotSuggestions(slotId!, tenantId),
    enabled: !!slotId,
  });
};

export const useQuickAssign = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: QuickAssignRequest) => duplicationService.quickAssign(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-slots'] });
      qc.invalidateQueries({ queryKey: ['duplication-report'] });
    },
  });
};
