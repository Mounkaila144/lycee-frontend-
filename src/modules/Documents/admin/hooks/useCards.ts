import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cardService } from '../services';
import type {
  CreateStudentCardRequest,
  BatchCardRequest,
  ReplaceCardRequest,
  CreateAccessBadgeRequest,
  CardFilters,
} from '../../types';

export const useStudentCards = (filters?: CardFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['student-cards', filters],
    queryFn: () => cardService.getCards(filters, tenantId),
  });
};

export const useStudentCard = (cardId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['student-card', cardId],
    queryFn: () => cardService.getCard(cardId!, tenantId),
    enabled: !!cardId,
  });
};

export const useCreateStudentCard = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentCardRequest) =>
      cardService.createCard(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-cards'] });
    },
  });
};

export const useBatchCreateCards = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchCardRequest) =>
      cardService.batchCreateCards(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-cards'] });
    },
  });
};

export const useReplaceCard = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, data }: { cardId: number; data: ReplaceCardRequest }) =>
      cardService.replaceCard(cardId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-cards'] });
    },
  });
};

export const useSuspendCard = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (cardId: number) =>
      cardService.suspendCard(cardId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-cards'] });
      qc.invalidateQueries({ queryKey: ['student-card'] });
    },
  });
};

export const useActivateCard = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (cardId: number) =>
      cardService.activateCard(cardId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-cards'] });
      qc.invalidateQueries({ queryKey: ['student-card'] });
    },
  });
};

export const useAccessBadges = (tenantId?: string) => {
  return useQuery({
    queryKey: ['access-badges'],
    queryFn: () => cardService.getAccessBadges(tenantId),
  });
};

export const useCreateAccessBadge = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccessBadgeRequest) =>
      cardService.createAccessBadge(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['access-badges'] });
    },
  });
};

export const useAccessPermissions = (badgeId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['access-permissions', badgeId],
    queryFn: () => cardService.getAccessPermissions(badgeId!, tenantId),
    enabled: !!badgeId,
  });
};

export const useSuspendBadge = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (badgeId: number) =>
      cardService.suspendBadge(badgeId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['access-badges'] });
    },
  });
};

export const useActivateBadge = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (badgeId: number) =>
      cardService.activateBadge(badgeId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['access-badges'] });
    },
  });
};

export const useCardStatistics = (tenantId?: string) => {
  return useQuery({
    queryKey: ['card-statistics'],
    queryFn: () => cardService.getStatistics(tenantId),
  });
};
