import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { occupancyStatsService } from '../services';

export const useGlobalKPIs = (semesterId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['occupancy-kpis', semesterId],
    queryFn: () => occupancyStatsService.getGlobalKPIs(semesterId, tenantId),
    enabled: !!semesterId,
  });
};

export const useOccupancyByDay = (semesterId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['occupancy-by-day', semesterId],
    queryFn: () => occupancyStatsService.getOccupancyByDay(semesterId, tenantId),
    enabled: !!semesterId,
  });
};

export const useSessionTypeDistribution = (semesterId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['session-type-distribution', semesterId],
    queryFn: () => occupancyStatsService.getSessionTypeDistribution(semesterId, tenantId),
    enabled: !!semesterId,
  });
};

export const useOccupancyHeatmap = (semesterId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['occupancy-heatmap', semesterId],
    queryFn: () => occupancyStatsService.getHeatmap(semesterId, tenantId),
    enabled: !!semesterId,
  });
};

export const useTopRooms = (semesterId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['top-rooms', semesterId],
    queryFn: () => occupancyStatsService.getTopRooms(semesterId, tenantId),
    enabled: !!semesterId,
  });
};

export const useTopTeachers = (semesterId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['top-teachers', semesterId],
    queryFn: () => occupancyStatsService.getTopTeachers(semesterId, tenantId),
    enabled: !!semesterId,
  });
};

export const useRefreshOccupancyStats = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: number) => occupancyStatsService.refreshStats(semesterId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['occupancy-kpis'] });
      qc.invalidateQueries({ queryKey: ['occupancy-by-day'] });
      qc.invalidateQueries({ queryKey: ['session-type-distribution'] });
      qc.invalidateQueries({ queryKey: ['occupancy-heatmap'] });
      qc.invalidateQueries({ queryKey: ['top-rooms'] });
      qc.invalidateQueries({ queryKey: ['top-teachers'] });
    },
  });
};
