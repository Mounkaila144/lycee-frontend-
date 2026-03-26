import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { certificateService } from '../services';
import type {
  GenerateCertificateRequest,
  CreateCertificateRequestPayload,
  ApproveCertificateRequestPayload,
  RejectCertificateRequestPayload,
  CertificateFilters,
  CertificateRequestFilters,
} from '../../types';

export const useCertificates = (filters?: CertificateFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['certificates', filters],
    queryFn: () => certificateService.getCertificates(filters, tenantId),
  });
};

export const useCertificate = (certificateId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['certificate', certificateId],
    queryFn: () => certificateService.getCertificate(certificateId!, tenantId),
    enabled: !!certificateId,
  });
};

export const useGenerateCertificate = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateCertificateRequest) =>
      certificateService.generateCertificate(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useCertificateRequests = (filters?: CertificateRequestFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['certificate-requests', filters],
    queryFn: () => certificateService.getRequests(filters, tenantId),
  });
};

export const useCreateCertificateRequest = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCertificateRequestPayload) =>
      certificateService.createRequest(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificate-requests'] });
    },
  });
};

export const useApproveCertificateRequest = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: number; data: ApproveCertificateRequestPayload }) =>
      certificateService.approveRequest(requestId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificate-requests'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useRejectCertificateRequest = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: number; data: RejectCertificateRequestPayload }) =>
      certificateService.rejectRequest(requestId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificate-requests'] });
    },
  });
};

export const useCertificateStatistics = (tenantId?: string) => {
  return useQuery({
    queryKey: ['certificate-statistics'],
    queryFn: () => certificateService.getStatistics(tenantId),
  });
};
