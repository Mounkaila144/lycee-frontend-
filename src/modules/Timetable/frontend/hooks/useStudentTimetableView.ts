import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { studentTimetableViewService } from '../services';

export const useStudentTimetableView = (
  semesterId?: number,
  weekStart?: string,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['student-timetable-view', semesterId, weekStart],
    queryFn: () => studentTimetableViewService.getMyTimetable(semesterId!, weekStart, tenantId),
    enabled: !!semesterId,
  });
};

export const useStudentNextClass = (tenantId?: string) => {
  return useQuery({
    queryKey: ['student-next-class'],
    queryFn: () => studentTimetableViewService.getNextClass(tenantId),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useStudentRecentChanges = (tenantId?: string) => {
  return useQuery({
    queryKey: ['student-recent-changes'],
    queryFn: () => studentTimetableViewService.getRecentChanges(tenantId),
  });
};

export const useMarkStudentChangeRead = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (changeId: number) => studentTimetableViewService.markChangeAsRead(changeId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-recent-changes'] });
    },
  });
};
