import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { BlockListFilters, BlockType, ReminderListFilters } from '../services/collectionService';
import { collectionService } from '../services/collectionService';

const invalidateCollection = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['collection'] });
  qc.invalidateQueries({ queryKey: ['invoices'] });
};

export const useCollectionStatistics = (tenantId?: string) =>
  useQuery({
    queryKey: ['collection', 'statistics'],
    queryFn: () => collectionService.getStatistics(tenantId),
  });

export const useReminders = (filters?: ReminderListFilters, tenantId?: string) =>
  useQuery({
    queryKey: ['collection', 'reminders', filters],
    queryFn: () => collectionService.getReminders(filters, tenantId),
    placeholderData: keepPreviousData,
  });

export const useGenerateReminders = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => collectionService.generateReminders(tenantId),
    onSuccess: () => invalidateCollection(qc),
  });
};

export const useSendReminders = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => collectionService.sendReminders(tenantId),
    onSuccess: () => invalidateCollection(qc),
  });
};

export const useServiceBlocks = (filters?: BlockListFilters, tenantId?: string) =>
  useQuery({
    queryKey: ['collection', 'blocks', filters],
    queryFn: () => collectionService.getServiceBlocks(filters, tenantId),
    placeholderData: keepPreviousData,
  });

export const useCreateServiceBlock = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { student_id: number; block_type: BlockType; reason: string; related_invoice_ids?: number[] }) =>
      collectionService.createServiceBlock(data, tenantId),
    onSuccess: () => invalidateCollection(qc),
  });
};

export const useLiftServiceBlock = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (blockId: number) => collectionService.liftServiceBlock(blockId, tenantId),
    onSuccess: () => invalidateCollection(qc),
  });
};

export const useCreatePaymentPlan = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { invoice_id: number; number_of_installments: number; first_due_date?: string }) =>
      collectionService.createPaymentPlan(data, tenantId),
    onSuccess: () => invalidateCollection(qc),
  });
};

export const useWriteOff = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, reason }: { invoiceId: number; reason: string }) =>
      collectionService.writeOff(invoiceId, reason, tenantId),
    onSuccess: () => invalidateCollection(qc),
  });
};
