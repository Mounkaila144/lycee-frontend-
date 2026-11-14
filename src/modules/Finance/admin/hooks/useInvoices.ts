import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { invoiceService } from '../services';
import type {
  BulkBillingRequest,
  CreateFeeTypeRequest,
  FeeTypeListParams,
  UpdateFeeTypeRequest,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  GenerateAutomatedInvoicesRequest,
  InvoiceFilters,
} from '../../types';

export const useFeeTypes = (tenantId?: string) => {
  return useQuery({
    queryKey: ['fee-types'],
    queryFn: () => invoiceService.getFeeTypes(tenantId),
  });
};

/** Liste des types de frais (tableau), désactivés inclus si demandé. */
export const useFeeTypeList = (params?: FeeTypeListParams, tenantId?: string) => {
  return useQuery({
    queryKey: ['fee-types', 'list', params],
    queryFn: () => invoiceService.listFeeTypes(params, tenantId),
  });
};

export const useSetFeeTypeStatus = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ feeTypeId, isActive }: { feeTypeId: number; isActive: boolean }) =>
      invoiceService.setFeeTypeStatus(feeTypeId, isActive, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-types'] });
    },
  });
};

export const useBulkBillingTargets = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['bulk-billing-targets', academicYearId],
    queryFn: () => invoiceService.getBulkBillingTargets(academicYearId, tenantId),
    enabled: !!academicYearId,
  });
};

export const usePreviewBulkBilling = (tenantId?: string) => {
  return useMutation({
    mutationFn: (data: BulkBillingRequest) => invoiceService.previewBulkBilling(data, tenantId),
  });
};

export const useGenerateBulkBilling = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkBillingRequest) => invoiceService.generateBulkBilling(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useFeeType = (feeTypeId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['fee-type', feeTypeId],
    queryFn: () => invoiceService.getFeeType(feeTypeId!, tenantId),
    enabled: !!feeTypeId,
  });
};

export const useCreateFeeType = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeeTypeRequest) =>
      invoiceService.createFeeType(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-types'] });
    },
  });
};

export const useUpdateFeeType = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ feeTypeId, data }: { feeTypeId: number; data: UpdateFeeTypeRequest }) =>
      invoiceService.updateFeeType(feeTypeId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-types'] });
    },
  });
};

export const useDeleteFeeType = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (feeTypeId: number) =>
      invoiceService.deleteFeeType(feeTypeId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-types'] });
    },
  });
};

export const useInvoices = (filters?: InvoiceFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => invoiceService.getInvoices(filters, tenantId),
  });
};

export const useInvoice = (invoiceId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceService.getInvoice(invoiceId!, tenantId),
    enabled: !!invoiceId,
  });
};

export const useCreateInvoice = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) =>
      invoiceService.createInvoice(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateInvoice = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: number; data: UpdateInvoiceRequest }) =>
      invoiceService.updateInvoice(invoiceId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice'] });
    },
  });
};

export const useDeleteInvoice = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: number) =>
      invoiceService.deleteInvoice(invoiceId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useGenerateAutomatedInvoices = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateAutomatedInvoicesRequest) =>
      invoiceService.generateAutomatedInvoices(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const usePaymentSchedule = (invoiceId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payment-schedule', invoiceId],
    queryFn: () => invoiceService.getPaymentSchedule(invoiceId!, tenantId),
    enabled: !!invoiceId,
  });
};

export const useApplyLateFees = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => invoiceService.applyLateFees(tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useInvoiceStatistics = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['invoice-statistics', academicYearId],
    queryFn: () => invoiceService.getStatistics(academicYearId, tenantId),
  });
};
