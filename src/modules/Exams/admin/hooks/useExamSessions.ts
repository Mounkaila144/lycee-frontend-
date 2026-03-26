import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { examSessionService } from '../services';
import type {
  CreateExamSessionRequest,
  UpdateExamSessionRequest,
  AssignRoomRequest,
  ExamSessionFilters,
} from '../../types';

export const useExamSessions = (filters?: ExamSessionFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-sessions', filters],
    queryFn: () => examSessionService.getSessions(filters, tenantId),
  });
};

export const useExamSession = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-session', sessionId],
    queryFn: () => examSessionService.getSession(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useCreateExamSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamSessionRequest) =>
      examSessionService.createSession(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
    },
  });
};

export const useUpdateExamSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: UpdateExamSessionRequest }) =>
      examSessionService.updateSession(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
      qc.invalidateQueries({ queryKey: ['exam-session'] });
    },
  });
};

export const useDeleteExamSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) =>
      examSessionService.deleteSession(sessionId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
    },
  });
};

export const usePublishExamSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) =>
      examSessionService.publishSession(sessionId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
    },
  });
};

export const useCancelExamSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) =>
      examSessionService.cancelSession(sessionId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
    },
  });
};

export const useDuplicateExamSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) =>
      examSessionService.duplicateSession(sessionId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
    },
  });
};

export const useValidateSchedule = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-schedule-validation', sessionId],
    queryFn: () => examSessionService.validateSchedule(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useAvailableRooms = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-available-rooms', sessionId],
    queryFn: () => examSessionService.getAvailableRooms(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useAssignRoom = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: AssignRoomRequest }) =>
      examSessionService.assignRoom(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
      qc.invalidateQueries({ queryKey: ['exam-session'] });
    },
  });
};

export const useRemoveRoom = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, roomAssignmentId }: { sessionId: number; roomAssignmentId: number }) =>
      examSessionService.removeRoom(sessionId, roomAssignmentId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
      qc.invalidateQueries({ queryKey: ['exam-session'] });
    },
  });
};
