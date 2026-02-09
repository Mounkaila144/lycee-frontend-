import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { timetableService } from '../services';
import type { TimetableFilters, CreateSlotRequest, CheckConflictRequest } from '../../types';

export const useSchedules = (semesterId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['schedules', semesterId],
    queryFn: () => timetableService.getSchedules(semesterId, tenantId),
  });
};

export const useTimetableSlots = (filters?: TimetableFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-slots', filters],
    queryFn: () => timetableService.getSlots(filters, tenantId),
  });
};

export const useGroupTimetable = (groupId?: number, semesterId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-group', groupId, semesterId],
    queryFn: () => timetableService.getGroupTimetable(groupId!, semesterId!, tenantId),
    enabled: !!groupId && !!semesterId,
  });
};

export const useTeacherTimetable = (teacherId?: number, semesterId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-teacher', teacherId, semesterId],
    queryFn: () => timetableService.getTeacherTimetable(teacherId!, semesterId!, tenantId),
    enabled: !!teacherId && !!semesterId,
  });
};

export const useRoomTimetable = (roomId?: number, semesterId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-room', roomId, semesterId],
    queryFn: () => timetableService.getRoomTimetable(roomId!, semesterId!, tenantId),
    enabled: !!roomId && !!semesterId,
  });
};

export const useCreateSlot = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSlotRequest) => timetableService.createSlot(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-slots'] });
      qc.invalidateQueries({ queryKey: ['timetable-group'] });
      qc.invalidateQueries({ queryKey: ['timetable-teacher'] });
      qc.invalidateQueries({ queryKey: ['timetable-room'] });
    },
  });
};

export const useUpdateSlot = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSlotRequest> }) =>
      timetableService.updateSlot(id, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-slots'] });
      qc.invalidateQueries({ queryKey: ['timetable-group'] });
      qc.invalidateQueries({ queryKey: ['timetable-teacher'] });
      qc.invalidateQueries({ queryKey: ['timetable-room'] });
    },
  });
};

export const useDeleteSlot = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => timetableService.deleteSlot(id, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-slots'] });
      qc.invalidateQueries({ queryKey: ['timetable-group'] });
      qc.invalidateQueries({ queryKey: ['timetable-teacher'] });
      qc.invalidateQueries({ queryKey: ['timetable-room'] });
    },
  });
};

export const useCheckConflicts = (tenantId?: string) => {
  return useMutation({
    mutationFn: (data: CheckConflictRequest) => timetableService.checkConflicts(data, tenantId),
  });
};

export const usePublishSchedule = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: number) => timetableService.publishSchedule(scheduleId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};
