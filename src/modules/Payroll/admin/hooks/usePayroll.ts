import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { payrollService } from '../services';
import type {
  CreatePayrollPeriodRequest,
  PayrollPeriodFilters,
} from '../../types';

export const usePayrollPeriods = (filters?: PayrollPeriodFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-periods', filters],
    queryFn: () => payrollService.getPeriods(filters, tenantId),
  });
};

export const usePayrollPeriod = (periodId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-period', periodId],
    queryFn: () => payrollService.getPeriod(periodId!, tenantId),
    enabled: !!periodId,
  });
};

export const useCreatePayrollPeriod = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayrollPeriodRequest) =>
      payrollService.createPeriod(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-periods'] });
    },
  });
};

export const useUpdatePayrollPeriod = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ periodId, data }: { periodId: number; data: Partial<CreatePayrollPeriodRequest> }) =>
      payrollService.updatePeriod(periodId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-periods'] });
      qc.invalidateQueries({ queryKey: ['payroll-period'] });
    },
  });
};

export const useDeletePayrollPeriod = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (periodId: number) =>
      payrollService.deletePeriod(periodId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-periods'] });
    },
  });
};

export const useCalculatePayroll = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (periodId: number) =>
      payrollService.calculatePeriod(periodId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-periods'] });
      qc.invalidateQueries({ queryKey: ['payroll-period'] });
    },
  });
};

export const useValidatePayroll = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (periodId: number) =>
      payrollService.validatePeriod(periodId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-periods'] });
      qc.invalidateQueries({ queryKey: ['payroll-period'] });
    },
  });
};

export const useGeneratePayslips = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (periodId: number) =>
      payrollService.generatePayslips(periodId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-periods'] });
      qc.invalidateQueries({ queryKey: ['payroll-payslips'] });
    },
  });
};

export const usePayslips = (periodId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-payslips', periodId],
    queryFn: () => payrollService.getPayslips(periodId!, tenantId),
    enabled: !!periodId,
  });
};

export const useGenerateBankTransfers = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (periodId: number) =>
      payrollService.generateBankTransfers(periodId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-bank-transfers'] });
    },
  });
};

export const useBankTransfers = (periodId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-bank-transfers', periodId],
    queryFn: () => payrollService.getBankTransfers(periodId!, tenantId),
    enabled: !!periodId,
  });
};

export const useMarkAsPaid = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (periodId: number) =>
      payrollService.markAsPaid(periodId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-periods'] });
      qc.invalidateQueries({ queryKey: ['payroll-period'] });
    },
  });
};
