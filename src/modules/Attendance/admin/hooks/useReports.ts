import { useQuery } from '@tanstack/react-query';

import { reportService } from '../services';

export const useAttendanceRates = (
  semesterId?: number,
  groupId?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['attendance-rates', semesterId, groupId],
    queryFn: () => reportService.getAttendanceRates(semesterId!, groupId, tenantId),
    enabled: !!semesterId,
  });
};

export const useAbsenteesList = (
  semesterId?: number,
  minAbsenceRate?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['absentees-list', semesterId, minAbsenceRate],
    queryFn: () => reportService.getAbsenteesList(semesterId!, minAbsenceRate, tenantId),
    enabled: !!semesterId,
  });
};

export const useDetailedStatistics = (semesterId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['attendance-statistics', semesterId],
    queryFn: () => reportService.getDetailedStatistics(semesterId!, tenantId),
    enabled: !!semesterId,
  });
};
