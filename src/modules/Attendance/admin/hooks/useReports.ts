import { useQuery } from '@tanstack/react-query';

import { reportService } from '../services';
import type { ReportFilters } from '../../types';

export const useSemesters = (tenantId?: string) => {
  return useQuery({
    queryKey: ['attendance-semesters'],
    queryFn: () => reportService.getSemesters(tenantId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAttendanceRates = (filters?: ReportFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['attendance-rates', filters],
    queryFn: () => reportService.getAttendanceRates(filters!, tenantId),
    enabled: !!filters?.semester_id,
  });
};

export const useAbsenteesList = (
  filters?: ReportFilters,
  minAbsenceRate?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['absentees-list', filters, minAbsenceRate],
    queryFn: () => reportService.getAbsenteesList(filters!, minAbsenceRate, tenantId),
    enabled: !!filters?.semester_id,
  });
};

export const useDetailedStatistics = (filters?: ReportFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['attendance-statistics', filters],
    queryFn: () => reportService.getDetailedStatistics(filters!, tenantId),
    enabled: !!filters?.semester_id,
  });
};
