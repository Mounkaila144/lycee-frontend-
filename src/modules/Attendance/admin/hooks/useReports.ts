import { useQuery } from '@tanstack/react-query';

import { reportService } from '../services';

export const useSemesters = (tenantId?: string) => {
  return useQuery({
    queryKey: ['attendance-semesters'],
    queryFn: () => reportService.getSemesters(tenantId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAttendanceRates = (
  semesterId?: number,
  classeId?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['attendance-rates', semesterId, classeId],
    queryFn: () => reportService.getAttendanceRates(semesterId!, classeId, tenantId),
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
