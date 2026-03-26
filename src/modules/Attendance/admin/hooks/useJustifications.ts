import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { justificationService } from '../services';
import type {
  SubmitJustificationRequest,
  ValidateJustificationRequest,
  JustificationFilters,
} from '../../types';

export const useJustifications = (filters?: JustificationFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['justifications', filters],
    queryFn: () => justificationService.getAll(filters, tenantId),
  });
};

export const usePendingJustifications = (tenantId?: string) => {
  return useQuery({
    queryKey: ['justifications', 'pending'],
    queryFn: () => justificationService.getPending(tenantId),
  });
};

export const useStudentJustifications = (studentId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['justifications', 'student', studentId],
    queryFn: () => justificationService.getStudentJustifications(studentId!, tenantId),
    enabled: !!studentId,
  });
};

export const useSubmitJustification = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitJustificationRequest) =>
      justificationService.submit(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['justifications'] });
    },
  });
};

export const useValidateJustification = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      justificationId,
      data,
    }: {
      justificationId: number;
      data: ValidateJustificationRequest;
    }) => justificationService.validate(justificationId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['justifications'] });
    },
  });
};
