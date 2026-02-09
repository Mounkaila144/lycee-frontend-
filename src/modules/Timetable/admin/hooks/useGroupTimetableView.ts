import { useQuery } from '@tanstack/react-query';

import { groupTimetableViewService } from '../services';

export const useGroupTimetableView = (
  groupId?: number,
  semesterId?: number,
  weekStart?: string,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['group-timetable-view', groupId, semesterId, weekStart],
    queryFn: () => groupTimetableViewService.getGroupTimetable(groupId!, semesterId!, weekStart, tenantId),
    enabled: !!groupId && !!semesterId,
  });
};

export const useGroupStatistics = (
  groupId?: number,
  semesterId?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['group-statistics', groupId, semesterId],
    queryFn: () => groupTimetableViewService.getGroupStatistics(groupId!, semesterId!, tenantId),
    enabled: !!groupId && !!semesterId,
  });
};

export const useGroupGaps = (
  groupId?: number,
  semesterId?: number,
  weekStart?: string,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['group-gaps', groupId, semesterId, weekStart],
    queryFn: () => groupTimetableViewService.getGroupGaps(groupId!, semesterId!, weekStart, tenantId),
    enabled: !!groupId && !!semesterId,
  });
};
