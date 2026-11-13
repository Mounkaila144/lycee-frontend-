import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { familyAttendanceService } from '../services';
import type { SubmitJustificationRequest } from '../../types';

export const useFamilyStudents = (tenantId?: string) => {
  return useQuery({
    queryKey: ['family-attendance-students'],
    queryFn: () => familyAttendanceService.getStudents(tenantId),
  });
};

export const useFamilyAbsences = (studentId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['family-attendance-absences', studentId],
    queryFn: () => familyAttendanceService.getAbsences(studentId, tenantId),
    enabled: !!studentId,
  });
};

export const useFamilyJustifications = (studentId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['family-justifications', studentId],
    queryFn: () => familyAttendanceService.getJustifications(studentId, tenantId),
  });
};

export const useSubmitFamilyJustification = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitJustificationRequest) => familyAttendanceService.submit(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['family-justifications'] });
    },
  });
};
