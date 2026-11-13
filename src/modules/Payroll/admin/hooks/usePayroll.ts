import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { payrollService } from '../services';
import type { CreatePayrollPeriodRequest, PayrollPeriodFilters } from '../../types';

const invalidatePeriods = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['payroll-periods'] });
  qc.invalidateQueries({ queryKey: ['payroll-period'] });
  qc.invalidateQueries({ queryKey: ['payroll-dashboard'] });
};

export const usePayrollPeriods = (filters?: PayrollPeriodFilters, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-periods', filters],
    queryFn: () => payrollService.getPeriods(filters, tenantId),
  });

export const usePayrollPeriod = (periodId?: number, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-period', periodId],
    queryFn: () => payrollService.getPeriod(periodId!, tenantId),
    enabled: !!periodId,
  });

export const useCreatePayrollPeriod = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayrollPeriodRequest) => payrollService.createPeriod(data, tenantId),
    onSuccess: () => invalidatePeriods(qc),
  });
};

export const useDeletePayrollPeriod = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (periodId: number) => payrollService.deletePeriod(periodId, tenantId),
    onSuccess: () => invalidatePeriods(qc),
  });
};

export const useCalculatePayroll = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (periodId: number) => payrollService.calculatePeriod(periodId, tenantId),
    onSuccess: () => invalidatePeriods(qc),
  });
};

export const useValidatePayroll = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (periodId: number) => payrollService.validatePeriod(periodId, tenantId),
    onSuccess: () => invalidatePeriods(qc),
  });
};

export const useGeneratePayslips = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (periodId: number) => payrollService.generatePayslips(periodId, tenantId),
    onSuccess: () => invalidatePeriods(qc),
  });
};

export const useBankTransfers = (periodId?: number, enabled = true, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-bank-transfers', periodId],
    queryFn: () => payrollService.getBankTransfers(periodId!, tenantId),
    enabled: !!periodId && enabled,
  });

export const useMarkAsPaid = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ periodId, paymentDate }: { periodId: number; paymentDate: string }) =>
      payrollService.markAsPaid(periodId, paymentDate, tenantId),
    onSuccess: () => invalidatePeriods(qc),
  });
};
