import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { examSupervisionService } from '../services';
import type {
  AssignSupervisorRequest,
  MarkAttendanceRequest,
  ReportIncidentRequest,
} from '../../types';

export const useAssignSupervisors = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, supervisors }: { sessionId: number; supervisors: AssignSupervisorRequest[] }) =>
      examSupervisionService.assignSupervisors(sessionId, supervisors, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
    },
  });
};

export const useMarkSupervisorPresent = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (supervisorId: number) =>
      examSupervisionService.markSupervisorPresent(supervisorId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
    },
  });
};

export const useReplaceSupervisor = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ supervisorId, data }: { supervisorId: number; data: { replacement_teacher_id: number } }) =>
      examSupervisionService.replaceSupervisor(supervisorId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
    },
  });
};

export const useTeacherExamSchedule = (teacherId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-teacher-schedule', teacherId],
    queryFn: () => examSupervisionService.getTeacherSchedule(teacherId!, undefined, tenantId),
    enabled: !!teacherId,
  });
};

export const useMarkStudentAttendance = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sheetId, data }: { sheetId: number; data: MarkAttendanceRequest }) =>
      examSupervisionService.markStudentAttendance(sheetId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
      qc.invalidateQueries({ queryKey: ['exam-attendance-stats'] });
    },
  });
};

export const useExamAttendanceStats = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-attendance-stats', sessionId],
    queryFn: () => examSupervisionService.getAttendanceStats(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useExamIncidents = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-incidents', sessionId],
    queryFn: () => examSupervisionService.getIncidents(sessionId!, tenantId),
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
      qc.invalidateQueries({ queryKey: ['exam-incidents-summary'] });
    },
  });
};

export const useUpdateIncidentStatus = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ incidentId, data }: { incidentId: number; data: { status: string; resolution_notes?: string } }) =>
      examSupervisionService.updateIncidentStatus(incidentId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-incidents'] });
    },
  });
};

export const useRecordExamSubmission = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sheetId: number) => examSupervisionService.recordSubmission(sheetId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
      qc.invalidateQueries({ queryKey: ['exam-attendance-stats'] });
    },
  });
};

export const useVerifyExamSheet = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sheetId: number) => examSupervisionService.verifySheet(sheetId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
    },
  });
};

export const useExamIncidentsSummary = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-incidents-summary', sessionId],
    queryFn: () => examSupervisionService.getIncidentsSummary(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useEscalateIncident = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ incidentId, reason }: { incidentId: number; reason: string }) =>
      examSupervisionService.escalateIncident(incidentId, { reason }, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-incidents'] });
      qc.invalidateQueries({ queryKey: ['exam-incidents-summary'] });
    },
  });
};
