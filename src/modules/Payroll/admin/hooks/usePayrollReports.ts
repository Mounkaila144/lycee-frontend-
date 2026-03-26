import { useQuery } from '@tanstack/react-query';

import { payrollReportService } from '../services';

export const usePayrollDashboardStats = (tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-dashboard-stats'],
    queryFn: () => payrollReportService.getDashboardStats(tenantId),
  });
};

export const usePayrollJournal = (periodId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-journal', periodId],
    queryFn: () => payrollReportService.getPayrollJournal(periodId!, tenantId),
    enabled: !!periodId,
  });
};

export const useSocialCharges = (year?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-social-charges', year],
    queryFn: () => payrollReportService.getSocialCharges(year!, tenantId),
    enabled: !!year,
  });
};

export const useSalaryStatistics = (tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-salary-statistics'],
    queryFn: () => payrollReportService.getSalaryStatistics(tenantId),
  });
};
