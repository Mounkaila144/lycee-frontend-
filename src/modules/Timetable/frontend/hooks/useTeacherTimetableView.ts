import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { teacherTimetableViewService } from '../services';

export const useTeacherTimetableView = (
  semesterId?: number,
  weekStart?: string,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['teacher-timetable-view', semesterId, weekStart],
    queryFn: () => teacherTimetableViewService.getMyTimetable(semesterId!, weekStart, tenantId),
    enabled: !!semesterId,
  });
};

export const useTeacherNextClass = (tenantId?: string) => {
  return useQuery({
    queryKey: ['teacher-next-class'],
    queryFn: () => teacherTimetableViewService.getNextClass(tenantId),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useTeacherRecentChanges = (tenantId?: string) => {
  return useQuery({
    queryKey: ['teacher-recent-changes'],
    queryFn: () => teacherTimetableViewService.getRecentChanges(tenantId),
  });
};

export const useMarkTeacherChangeRead = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (changeId: number) => teacherTimetableViewService.markChangeAsRead(changeId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-recent-changes'] });
    },
  });
};

export const useTeacherStatistics = (semesterId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['teacher-statistics', semesterId],
    queryFn: () => teacherTimetableViewService.getTeacherStatistics(semesterId!, tenantId),
    enabled: !!semesterId,
  });
};
