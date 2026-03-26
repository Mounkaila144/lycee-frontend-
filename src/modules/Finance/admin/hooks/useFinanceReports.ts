import { useMutation, useQuery } from '@tanstack/react-query';

import { reportService } from '../services';
import type { AccountingExport } from '../../types';

export const useFinanceDashboard = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['finance-dashboard', academicYearId],
    queryFn: () => reportService.getDashboard(academicYearId, tenantId),
  });
};

export const usePaymentJournal = (
  params?: { date_from?: string; date_to?: string; page?: number; per_page?: number },
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['payment-journal', params],
    queryFn: () => reportService.getPaymentJournal(params, tenantId),
  });
};

export const useAgingBalance = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['aging-balance', academicYearId],
    queryFn: () => reportService.getAgingBalance(academicYearId, tenantId),
  });
};

export const useUnpaidStatements = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['unpaid-statements', academicYearId],
    queryFn: () => reportService.getUnpaidStatements(academicYearId, tenantId),
  });
};

export const useCashFlowForecast = (tenantId?: string) => {
  return useQuery({
    queryKey: ['cash-flow-forecast'],
    queryFn: () => reportService.getCashFlowForecast(tenantId),
  });
};

export const useReportCollectionStatistics = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['report-collection-statistics', academicYearId],
    queryFn: () => reportService.getCollectionStatistics(academicYearId, tenantId),
  });
};

export const useExportAccounting = (tenantId?: string) => {
  return useMutation({
    mutationFn: (data: AccountingExport) =>
      reportService.exportAccounting(data, tenantId),
  });
};
