import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { roomService } from '../services';
import type { RoomFilters, CreateRoomRequest, BlockRoomRequest } from '../../types';

export const useRooms = (filters?: RoomFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => roomService.getAll(filters, 1, 50, tenantId),
  });
};

export const useRoom = (id?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => roomService.getById(id!, tenantId),
    enabled: !!id,
  });
};

export const useCreateRoom = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomRequest) => roomService.create(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useUpdateRoom = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateRoomRequest> }) =>
      roomService.update(id, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      qc.invalidateQueries({ queryKey: ['room'] });
    },
  });
};

export const useDeleteRoom = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomService.delete(id, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useAvailableRooms = (
  day?: string,
  start?: string,
  end?: string,
  type?: string,
  size?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['rooms-available', day, start, end, type, size],
    queryFn: () => roomService.getAvailable(day!, start!, end!, type, size, tenantId),
    enabled: !!day && !!start && !!end,
  });
};

export const useBlockRoom = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BlockRoomRequest }) =>
      roomService.block(id, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      qc.invalidateQueries({ queryKey: ['room'] });
    },
  });
};

export const useUnblockRoom = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomService.unblock(id, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      qc.invalidateQueries({ queryKey: ['room'] });
    },
  });
};

export const useRoomOccupation = (id?: number, semesterId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['room-occupation', id, semesterId],
    queryFn: () => roomService.getOccupation(id!, semesterId!, tenantId),
    enabled: !!id && !!semesterId,
  });
};
