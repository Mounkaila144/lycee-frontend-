import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { componentService } from '../services';
import type {
  AdvanceFilters,
  ComponentFilters,
  CreateAdvanceRequest,
  CreatePayrollComponentRequest,
  CreateSalaryScaleRequest,
  DisburseAdvanceRequest,
} from '../../types';

export const useSalaryScales = (tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-salary-scales'],
    queryFn: () => componentService.getSalaryScales(tenantId),
  });

export const useCreateSalaryScale = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalaryScaleRequest) => componentService.createSalaryScale(data, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-salary-scales'] }),
  });
};

export const usePayrollComponents = (filters?: ComponentFilters, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-components', filters],
    queryFn: () => componentService.getComponents(filters, tenantId),
  });

export const useCreatePayrollComponent = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayrollComponentRequest) => componentService.createComponent(data, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-components'] }),
  });
};

export const useAdvances = (filters?: AdvanceFilters, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-advances', filters],
    queryFn: () => componentService.getAdvances(filters, tenantId),
  });

export const useRequestAdvance = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdvanceRequest) => componentService.requestAdvance(data, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-advances'] }),
  });
};

export const useApproveAdvance = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (advanceId: number) => componentService.approveAdvance(advanceId, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-advances'] }),
  });
};

export const useDisburseAdvance = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ advanceId, data }: { advanceId: number; data: DisburseAdvanceRequest }) =>
      componentService.disburseAdvance(advanceId, data, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-advances'] }),
  });
};
