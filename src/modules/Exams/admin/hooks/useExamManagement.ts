import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { examManagementService } from '../services';
import type { AssignStudentsRequest } from '../../types';

export const useExamMaterials = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-materials', sessionId],
    queryFn: () => examManagementService.getMaterials(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useUpdateExamMaterials = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: { allowed_materials: string; instructions: string } }) =>
      examManagementService.updateMaterials(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-materials'] });
    },
  });
};

export const useUpdateExamInstructions = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: { instructions: string } }) =>
      examManagementService.updateInstructions(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-materials'] });
    },
  });
};

export const useAssignStudents = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: AssignStudentsRequest }) =>
      examManagementService.assignStudents(sessionId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-assigned-students'] });
    },
  });
};

export const useAutoAssignStudents = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) =>
      examManagementService.autoAssignStudents(sessionId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-assigned-students'] });
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

export const useAssignedStudents = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-assigned-students', sessionId],
    queryFn: () => examManagementService.getAssignedStudents(sessionId!, tenantId),
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
