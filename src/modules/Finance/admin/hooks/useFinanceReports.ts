import { useMutation, useQuery } from '@tanstack/react-query';

import { reportService } from '../services';
import type { AccountingExportParams } from '../../types';

export const useFinanceDashboard = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['finance-dashboard', academicYearId],
    queryFn: () => reportService.getDashboard(academicYearId, tenantId),
  });
};

export const usePaymentJournal = (
  params: { start_date: string; end_date: string; payment_method?: string },
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['payment-journal', params],
    queryFn: () => reportService.getPaymentJournal(params, tenantId),
    enabled: Boolean(params.start_date && params.end_date),
  });
};

export const useAgingBalance = (tenantId?: string) => {
  return useQuery({
    queryKey: ['aging-balance'],
    queryFn: () => reportService.getAgingBalance(tenantId),
  });
};

export const useUnpaidStatements = (studentId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['unpaid-statements', studentId],
    queryFn: () => reportService.getUnpaidStatements(studentId, tenantId),
  });
};

export const useCashFlowForecast = (months = 6, tenantId?: string) => {
  return useQuery({
    queryKey: ['cash-flow-forecast', months],
    queryFn: () => reportService.getCashFlowForecast(months, tenantId),
  });
};

export const useExportAccounting = (tenantId?: string) => {
  return useMutation({
    mutationFn: (params: AccountingExportParams) => reportService.exportAccounting(params, tenantId),
  });
};
