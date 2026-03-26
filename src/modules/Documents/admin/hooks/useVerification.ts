import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { verificationService } from '../services';
import type {
  VerifyDocumentRequest,
  CreateSignatureRequest,
  VerificationFilters,
} from '../../types';

export const useVerifyByQrCode = (tenantId?: string) => {
  return useMutation({
    mutationFn: (data: VerifyDocumentRequest) =>
      verificationService.verifyByQrCode(data, tenantId),
  });
};

export const useVerifyByDocumentNumber = (tenantId?: string) => {
  return useMutation({
    mutationFn: (data: VerifyDocumentRequest) =>
      verificationService.verifyByDocumentNumber(data, tenantId),
  });
};

export const useVerificationHistory = (filters?: VerificationFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['verification-history', filters],
    queryFn: () => verificationService.getVerificationHistory(filters, tenantId),
  });
};

export const useVerificationStatistics = (tenantId?: string) => {
  return useQuery({
    queryKey: ['verification-statistics'],
    queryFn: () => verificationService.getStatistics(tenantId),
  });
};

export const useDocumentRegister = (tenantId?: string) => {
  return useQuery({
    queryKey: ['document-register'],
    queryFn: () => verificationService.getRegister(tenantId),
  });
};

export const useArchives = (tenantId?: string) => {
  return useQuery({
    queryKey: ['document-archives'],
    queryFn: () => verificationService.getArchives(tenantId),
  });
};

export const useMoveToColdStorage = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (archiveId: number) =>
      verificationService.moveToColdStorage(archiveId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-archives'] });
    },
  });
};

export const useElectronicSignatures = (tenantId?: string) => {
  return useQuery({
    queryKey: ['electronic-signatures'],
    queryFn: () => verificationService.getSignatures(tenantId),
  });
};

export const useCreateSignature = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSignatureRequest) =>
      verificationService.createSignature(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['electronic-signatures'] });
    },
  });
};

export const useSignDocument = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (signatureId: number) =>
      verificationService.signDocument(signatureId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['electronic-signatures'] });
    },
  });
};
