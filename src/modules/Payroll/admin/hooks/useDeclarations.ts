import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { declarationService } from '../services';
import type {
  CreateSocialDeclarationRequest,
  DeclarationFilters,
} from '../../types';

export const useDeclarations = (filters?: DeclarationFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-declarations', filters],
    queryFn: () => declarationService.getDeclarations(filters, tenantId),
  });
};

export const useDeclaration = (declarationId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-declaration', declarationId],
    queryFn: () => declarationService.getDeclaration(declarationId!, tenantId),
    enabled: !!declarationId,
  });
};

export const useCreateDeclaration = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSocialDeclarationRequest) =>
      declarationService.createDeclaration(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-declarations'] });
    },
  });
};

export const useValidateDeclaration = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (declarationId: number) =>
      declarationService.validateDeclaration(declarationId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-declarations'] });
      qc.invalidateQueries({ queryKey: ['payroll-declaration'] });
    },
  });
};

export const useSubmitDeclaration = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (declarationId: number) =>
      declarationService.submitDeclaration(declarationId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-declarations'] });
      qc.invalidateQueries({ queryKey: ['payroll-declaration'] });
    },
  });
};

export const useMarkDeclarationPaid = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (declarationId: number) =>
      declarationService.markDeclarationPaid(declarationId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-declarations'] });
      qc.invalidateQueries({ queryKey: ['payroll-declaration'] });
    },
  });
};

export const useAnnualSummary = (year?: number, employeeId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-annual-summary', year, employeeId],
    queryFn: () => declarationService.getAnnualSummary(year!, employeeId, tenantId),
    enabled: !!year,
  });
};
