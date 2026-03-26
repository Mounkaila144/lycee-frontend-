import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { attendanceService } from '../services';
import type {
  CreateSessionRequest,
  RecordAttendanceRequest,
  ModifyRecordRequest,
  SessionFilters,
} from '../../types';

export const useAttendanceSessions = (filters?: SessionFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['attendance-sessions', filters],
    queryFn: () => attendanceService.getSessions(filters, tenantId),
  });
};

export const useAttendanceSheet = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['attendance-sheet', sessionId],
    queryFn: () => attendanceService.getAttendanceSheet(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useCreateSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionRequest) =>
      attendanceService.createSession(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-sessions'] });
    },
  });
};

export const useRecordAttendance = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordAttendanceRequest) =>
      attendanceService.recordAttendance(data, tenantId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['attendance-sheet'] });
      qc.invalidateQueries({ queryKey: ['attendance-sessions'] });
    },
  });
};

export const useModifyRecord = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: number; data: ModifyRecordRequest }) =>
      attendanceService.modifyRecord(recordId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-sheet'] });
    },
  });
};

export const useCompleteSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) =>
      attendanceService.completeSession(sessionId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-sessions'] });
    },
  });
};
