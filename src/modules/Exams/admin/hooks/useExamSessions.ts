import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { examSessionService } from '../services';
import type {
  CreateExamSessionRequest,
  UpdateExamSessionRequest,
  AssignRoomRequest,
  ExamSessionFilters,
  ValidateScheduleRequest,
  CreateEvaluationsRequest,
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
    mutationFn: ({ sessionId, reason }: { sessionId: number; reason?: string }) =>
      examSessionService.cancelSession(sessionId, reason, tenantId),
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

export const useValidateSchedule = (tenantId?: string) => {
  return useMutation({
    mutationFn: (data: ValidateScheduleRequest) =>
      examSessionService.validateSchedule(data, tenantId),
  });
};

export const useAvailableRooms = (
  params?: { date: string; start_time: string; end_time: string },
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['exam-available-rooms', params],
    queryFn: () => examSessionService.getAvailableRooms(params!, tenantId),
    enabled: !!params?.date && !!params?.start_time && !!params?.end_time,
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

export const useExamOptions = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-options', academicYearId],
    queryFn: () => examSessionService.getOptions(academicYearId ? { academic_year_id: academicYearId } : undefined, tenantId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useChangeExamSessionStatus = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: number; status: 'ongoing' | 'completed' }) =>
      examSessionService.changeStatus(sessionId, status, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
      qc.invalidateQueries({ queryKey: ['exam-session'] });
    },
  });
};

export const useCreateEvaluationsFromSession = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: CreateEvaluationsRequest }) =>
      examSessionService.createEvaluations(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
      qc.invalidateQueries({ queryKey: ['exam-session'] });
    },
  });
};
