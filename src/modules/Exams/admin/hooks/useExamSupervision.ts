import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { examSupervisionService } from '../services';
import type {
  AssignSupervisorRequest,
  MarkAttendanceRequest,
  ReportIncidentRequest,
  IncidentFilters,
} from '../../types';

export const useAssignSupervisor = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: AssignSupervisorRequest }) =>
      examSupervisionService.assignSupervisor(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
      qc.invalidateQueries({ queryKey: ['exam-session'] });
    },
  });
};

export const useRemoveSupervisor = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, supervisorId }: { sessionId: number; supervisorId: number }) =>
      examSupervisionService.removeSupervisor(sessionId, supervisorId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
    },
  });
};

export const useMarkSupervisorPresent = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, supervisorId }: { sessionId: number; supervisorId: number }) =>
      examSupervisionService.markSupervisorPresent(sessionId, supervisorId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
    },
  });
};

export const useReplaceSupervisor = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, supervisorId, data }: { sessionId: number; supervisorId: number; data: { replacement_teacher_id: number } }) =>
      examSupervisionService.replaceSupervisor(sessionId, supervisorId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-sessions'] });
    },
  });
};

export const useExamAttendanceSheet = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-attendance-sheet', sessionId],
    queryFn: () => examSupervisionService.getAttendanceSheet(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useMarkStudentAttendance = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: MarkAttendanceRequest }) =>
      examSupervisionService.markStudentAttendance(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-attendance-sheet'] });
    },
  });
};

export const useExamIncidents = (sessionId?: number, filters?: IncidentFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-incidents', sessionId, filters],
    queryFn: () => examSupervisionService.getIncidents(sessionId!, filters, tenantId),
    enabled: !!sessionId,
  });
};

export const useReportIncident = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: ReportIncidentRequest }) =>
      examSupervisionService.reportIncident(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-incidents'] });
    },
  });
};

export const useUpdateIncidentStatus = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, incidentId, data }: { sessionId: number; incidentId: number; data: { status: string; action_taken?: string } }) =>
      examSupervisionService.updateIncidentStatus(sessionId, incidentId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-incidents'] });
    },
  });
};
