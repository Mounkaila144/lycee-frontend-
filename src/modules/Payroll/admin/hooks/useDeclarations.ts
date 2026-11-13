import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { declarationService, type GeneratedDeclarationType } from '../services/declarationService';
import type { DeclarationFilters, DeclarationPaymentRequest, SubmitDeclarationRequest } from '../../types';

const invalidateDeclarations = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['payroll-declarations'] });
  qc.invalidateQueries({ queryKey: ['payroll-declaration'] });
};

export const useDeclarations = (filters?: DeclarationFilters, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-declarations', filters],
    queryFn: () => declarationService.getDeclarations(filters, tenantId),
  });

export const useDeclaration = (declarationId?: number, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-declaration', declarationId],
    queryFn: () => declarationService.getDeclaration(declarationId!, tenantId),
    enabled: !!declarationId,
  });

export const useGenerateDeclaration = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ periodId, type }: { periodId: number; type: GeneratedDeclarationType }) =>
      declarationService.generateDeclaration(periodId, type, tenantId),
    onSuccess: () => invalidateDeclarations(qc),
  });
};

export const useGenerateAnnualSummary = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (year: number) => declarationService.generateAnnualSummary(year, tenantId),
    onSuccess: () => invalidateDeclarations(qc),
  });
};

export const useValidateDeclaration = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (declarationId: number) => declarationService.validateDeclaration(declarationId, tenantId),
    onSuccess: () => invalidateDeclarations(qc),
  });
};

export const useSubmitDeclaration = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ declarationId, data }: { declarationId: number; data: SubmitDeclarationRequest }) =>
      declarationService.submitDeclaration(declarationId, data, tenantId),
    onSuccess: () => invalidateDeclarations(qc),
  });
};

export const useRecordDeclarationPayment = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ declarationId, data }: { declarationId: number; data: DeclarationPaymentRequest }) =>
      declarationService.recordPayment(declarationId, data, tenantId),
    onSuccess: () => invalidateDeclarations(qc),
  });
};
