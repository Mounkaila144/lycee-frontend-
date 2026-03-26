import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { componentService } from '../services';
import type {
  CreateSalaryScaleRequest,
  CreatePayrollComponentRequest,
  CreateAdvanceRequest,
  AdvanceFilters,
} from '../../types';

export const useSalaryScales = (tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-salary-scales'],
    queryFn: () => componentService.getSalaryScales(tenantId),
  });
};

export const useCreateSalaryScale = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalaryScaleRequest) =>
      componentService.createSalaryScale(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-salary-scales'] });
    },
  });
};

export const useUpdateSalaryScale = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ scaleId, data }: { scaleId: number; data: Partial<CreateSalaryScaleRequest> }) =>
      componentService.updateSalaryScale(scaleId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-salary-scales'] });
    },
  });
};

export const useDeleteSalaryScale = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (scaleId: number) =>
      componentService.deleteSalaryScale(scaleId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-salary-scales'] });
    },
  });
};

export const usePayrollComponents = (tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-components'],
    queryFn: () => componentService.getComponents(tenantId),
  });
};

export const useCreatePayrollComponent = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayrollComponentRequest) =>
      componentService.createComponent(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};

export const useUpdatePayrollComponent = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ componentId, data }: { componentId: number; data: Partial<CreatePayrollComponentRequest> }) =>
      componentService.updateComponent(componentId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};

export const useDeletePayrollComponent = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (componentId: number) =>
      componentService.deleteComponent(componentId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};

export const useAdvances = (filters?: AdvanceFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-advances', filters],
    queryFn: () => componentService.getAdvances(filters, tenantId),
  });
};

export const useRequestAdvance = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdvanceRequest) =>
      componentService.requestAdvance(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-advances'] });
    },
  });
};

export const useApproveAdvance = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (advanceId: number) =>
      componentService.approveAdvance(advanceId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-advances'] });
    },
  });
};

export const useDisburseAdvance = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (advanceId: number) =>
      componentService.disburseAdvance(advanceId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-advances'] });
    },
  });
};
