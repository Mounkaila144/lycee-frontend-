import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { roomUtilizationService } from '../services';

export const useRoomUtilization = (roomId: number, semesterId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['room-utilization', roomId, semesterId],
    queryFn: () => roomUtilizationService.getRoomUtilization(roomId, semesterId, tenantId),
    enabled: !!roomId && !!semesterId,
  });
};

export const useAllRoomsUtilization = (semesterId: number, filters?: Record<string, string>, tenantId?: string) => {
  return useQuery({
    queryKey: ['all-rooms-utilization', semesterId, filters],
    queryFn: () => roomUtilizationService.getAllRoomsUtilization(semesterId, filters, tenantId),
    enabled: !!semesterId,
  });
};

export const useRoomRecommendations = (semesterId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['room-recommendations', semesterId],
    queryFn: () => roomUtilizationService.getRecommendations(semesterId, tenantId),
    enabled: !!semesterId,
  });
};

export const useExportRoomPdf = (tenantId?: string) => {
  return useMutation({
    mutationFn: ({ roomId, semesterId }: { roomId: number; semesterId: number }) =>
      roomUtilizationService.exportRoomPdf(roomId, semesterId, tenantId),
  });
};

export const useExportAllRoomsExcel = (tenantId?: string) => {
  return useMutation({
    mutationFn: (semesterId: number) =>
      roomUtilizationService.exportAllExcel(semesterId, tenantId),
  });
};

export const useRefreshRoomStats = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: number) => roomUtilizationService.refreshStats(semesterId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['room-utilization'] });
      qc.invalidateQueries({ queryKey: ['all-rooms-utilization'] });
      qc.invalidateQueries({ queryKey: ['room-recommendations'] });
    },
  });
};
