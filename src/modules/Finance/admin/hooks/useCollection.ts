import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { collectionService } from '../services';
import type {
  CreateReminderRequest,
  CreateServiceBlockRequest,
  CreatePaymentPlanRequest,
  CreateWriteOffRequest,
  ReminderFilters,
} from '../../types';

export const useReminders = (filters?: ReminderFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['reminders', filters],
    queryFn: () => collectionService.getReminders(filters, tenantId),
  });
};

export const useCreateReminder = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReminderRequest) =>
      collectionService.createReminder(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
};

export const useSendReminder = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: number) =>
      collectionService.sendReminder(reminderId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
};

export const useServiceBlocks = (tenantId?: string) => {
  return useQuery({
    queryKey: ['service-blocks'],
    queryFn: () => collectionService.getServiceBlocks(tenantId),
  });
};

export const useCreateServiceBlock = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceBlockRequest) =>
      collectionService.createServiceBlock(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-blocks'] });
    },
  });
};

export const useLiftServiceBlock = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (blockId: number) =>
      collectionService.liftServiceBlock(blockId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-blocks'] });
    },
  });
};

export const usePaymentPlans = (tenantId?: string) => {
  return useQuery({
    queryKey: ['payment-plans'],
    queryFn: () => collectionService.getPaymentPlans(tenantId),
  });
};

export const useCreatePaymentPlan = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentPlanRequest) =>
      collectionService.createPaymentPlan(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-plans'] });
    },
  });
};

export const useCancelPaymentPlan = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (planId: number) =>
      collectionService.cancelPaymentPlan(planId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-plans'] });
    },
  });
};

export const useWriteOffs = (tenantId?: string) => {
  return useQuery({
    queryKey: ['write-offs'],
    queryFn: () => collectionService.getWriteOffs(tenantId),
  });
};

export const useCreateWriteOff = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWriteOffRequest) =>
      collectionService.createWriteOff(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['write-offs'] });
    },
  });
};

export const useApproveWriteOff = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (writeOffId: number) =>
      collectionService.approveWriteOff(writeOffId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['write-offs'] });
    },
  });
};

export const useCollectionStatistics = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['collection-statistics', academicYearId],
    queryFn: () => collectionService.getCollectionStatistics(academicYearId, tenantId),
  });
};
