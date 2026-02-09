import { useMutation, useQuery } from '@tanstack/react-query';

import { teacherWorkloadService } from '../services';

export const useTeacherWorkload = (teacherId: number, semesterId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['teacher-workload', teacherId, semesterId],
    queryFn: () => teacherWorkloadService.getTeacherWorkload(teacherId, semesterId, tenantId),
    enabled: !!teacherId && !!semesterId,
  });
};

export const useDepartmentWorkloadSummary = (departmentId: number, semesterId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['department-workload', departmentId, semesterId],
    queryFn: () => teacherWorkloadService.getDepartmentSummary(departmentId, semesterId, tenantId),
    enabled: !!departmentId && !!semesterId,
  });
};

export const useExportTeacherPdf = (tenantId?: string) => {
  return useMutation({
    mutationFn: ({ teacherId, semesterId }: { teacherId: number; semesterId: number }) =>
      teacherWorkloadService.exportTeacherPdf(teacherId, semesterId, tenantId),
  });
};

export const useExportDepartmentExcel = (tenantId?: string) => {
  return useMutation({
    mutationFn: ({ departmentId, semesterId }: { departmentId: number; semesterId: number }) =>
      teacherWorkloadService.exportDepartmentExcel(departmentId, semesterId, tenantId),
  });
};

export const useSendTeacherReport = (tenantId?: string) => {
  return useMutation({
    mutationFn: ({ teacherId, semesterId }: { teacherId: number; semesterId: number }) =>
      teacherWorkloadService.sendTeacherReport(teacherId, semesterId, tenantId),
  });
};
