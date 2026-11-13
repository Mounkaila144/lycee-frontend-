import { useQuery } from '@tanstack/react-query';

import { payrollReportService } from '../services';

export const usePayrollDashboard = (params?: { year?: number; month?: number }, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-dashboard', params],
    queryFn: () => payrollReportService.getDashboard(params, tenantId),
  });

export const usePayrollJournal = (periodId?: number, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-journal', periodId],
    queryFn: () => payrollReportService.getPayrollJournal(periodId!, tenantId),
    enabled: !!periodId,
  });

export const useSocialCharges = (periodId?: number, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-social-charges', periodId],
    queryFn: () => payrollReportService.getSocialCharges(periodId!, tenantId),
    enabled: !!periodId,
  });

export const useSalaryStatistics = (params?: { year?: number; month?: number }, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-salary-statistics', params],
    queryFn: () => payrollReportService.getSalaryStatistics(params, tenantId),
  });
