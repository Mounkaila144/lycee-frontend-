import { useQuery } from '@tanstack/react-query';

import { roomOccupationViewService } from '../services';

export const useRoomOccupationView = (
  roomId?: number,
  semesterId?: number,
  weekStart?: string,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['room-occupation', roomId, semesterId, weekStart],
    queryFn: () => roomOccupationViewService.getRoomOccupation(roomId!, semesterId!, weekStart, tenantId),
    enabled: !!roomId && !!semesterId,
  });
};

export const useRoomStatistics = (
  roomId?: number,
  semesterId?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['room-occupation-stats', roomId, semesterId],
    queryFn: () => roomOccupationViewService.getRoomStatistics(roomId!, semesterId!, tenantId),
    enabled: !!roomId && !!semesterId,
  });
};

export const useCompareRooms = (
  roomIds: number[],
  semesterId?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['rooms-compare', roomIds, semesterId],
    queryFn: () => roomOccupationViewService.compareRooms(roomIds, semesterId!, tenantId),
    enabled: roomIds.length > 0 && !!semesterId,
  });
};
