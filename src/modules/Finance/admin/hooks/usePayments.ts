import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { paymentService } from '../services';
import type {
  RecordPaymentRequest,
  CreateRefundRequest,
  CreateDiscountRequest,
  PaymentFilters,
} from '../../types';

export const usePayments = (filters?: PaymentFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentService.getPayments(filters, tenantId),
  });
};

export const usePayment = (paymentId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentService.getPayment(paymentId!, tenantId),
    enabled: !!paymentId,
  });
};

export const useRecordPayment = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordPaymentRequest) =>
      paymentService.recordPayment(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useRecordPartialPayment = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordPaymentRequest) =>
      paymentService.recordPartialPayment(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useCreateRefund = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRefundRequest) =>
      paymentService.createRefund(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useRefunds = (tenantId?: string) => {
  return useQuery({
    queryKey: ['refunds'],
    queryFn: () => paymentService.getRefunds(tenantId),
  });
};

export const useReconciliation = (date?: string, tenantId?: string) => {
  return useQuery({
    queryKey: ['reconciliation', date],
    queryFn: () => paymentService.getReconciliation(date!, tenantId),
    enabled: !!date,
  });
};

export const useDailySummary = (date?: string, tenantId?: string) => {
  return useQuery({
    queryKey: ['daily-summary', date],
    queryFn: () => paymentService.getDailySummary(date!, tenantId),
    enabled: !!date,
  });
};

export const useDiscounts = (tenantId?: string) => {
  return useQuery({
    queryKey: ['discounts'],
    queryFn: () => paymentService.getDiscounts(tenantId),
  });
};

export const useCreateDiscount = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountRequest) =>
      paymentService.createDiscount(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
};

export const useDeleteDiscount = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (discountId: number) =>
      paymentService.deleteDiscount(discountId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
};
