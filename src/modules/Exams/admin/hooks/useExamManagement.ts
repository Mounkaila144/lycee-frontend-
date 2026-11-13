import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { examManagementService } from '../services';
import type { AssignStudentsRequest } from '../../types';

export const useUpdateExamMaterials = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, materials }: { sessionId: number; materials: string[] }) =>
      examManagementService.updateMaterials(sessionId, { materials }, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
      qc.invalidateQueries({ queryKey: ['exam-preparation-checklist'] });
    },
  });
};

export const useUpdateExamInstructions = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: { instructions: string } }) =>
      examManagementService.updateInstructions(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
      qc.invalidateQueries({ queryKey: ['exam-preparation-checklist'] });
    },
  });
};

export const useAssignStudents = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: AssignStudentsRequest }) =>
      examManagementService.assignStudents(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
      qc.invalidateQueries({ queryKey: ['exam-eligible-students'] });
    },
  });
};

export const useAutoAssignStudents = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) =>
      examManagementService.autoAssignStudents(sessionId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
      qc.invalidateQueries({ queryKey: ['exam-eligible-students'] });
    },
  });
};

export const useRemoveExamStudent = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sheetId: number) => examManagementService.removeStudent(sheetId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-session'] });
      qc.invalidateQueries({ queryKey: ['exam-eligible-students'] });
    },
  });
};

export const useEligibleStudents = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-eligible-students', sessionId],
    queryFn: () => examManagementService.getEligibleStudents(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const usePreparationChecklist = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-preparation-checklist', sessionId],
    queryFn: () => examManagementService.getPreparationChecklist(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};
